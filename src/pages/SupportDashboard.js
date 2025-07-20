import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { logReportAction } from '../utils/logAction';
import ReportAuditLogs from '../components/ReportAuditLogs';
import SupportChat from './SupportChat';
import StudentProfile from './StudentProfile';
import ProgressTracker from './ProgressTracker';
import FollowUpScheduler from './FollowUpScheduler';
import AnalyticsDashboard from './AnalyticsDashboard';
import NotificationBell from './NotificationBell';
import { FiHome, FiAlertCircle, FiUsers, FiBarChart2, FiMessageSquare, FiBook, FiCalendar, FiFileText } from 'react-icons/fi';
import '../styles/supporting.css';

const SupportDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ 
    category: '', 
    severity: '', 
    status: '',
    assignedToMe: false 
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const navigate = useNavigate();

  // Fetch reports with real-time updates
  const fetchReports = async (userId) => {
    let q;
    const constraints = [orderBy('createdAt', 'desc')];

    if (filter.category) constraints.push(where('category', '==', filter.category));
    if (filter.severity) constraints.push(where('severity', '==', filter.severity));
    if (filter.status) constraints.push(where('status', '==', filter.status));
    
    if (filter.assignedToMe && userId) {
      constraints.push(where('assignedSupportId', '==', userId));
    }

    q = query(collection(db, 'reports'), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      }));
      
      setReports(data);
      setLoading(false);
    });

    return unsubscribe;
  };

  // Fetch notifications
  const fetchNotifications = (userId) => {
    if (!userId) return;
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(data);
    });
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
  
      try {
        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const userDocSnapshot = await getDocs(userQuery);
  
        if (userDocSnapshot.empty) {
          navigate('/unauthorized');
          return;
        }
  
        const userData = userDocSnapshot.docs[0].data();
        setUserData(userData);
  
        if (userData?.role !== 'support') {
          navigate('/unauthorized');
          return;
        }
  
        // Set up real-time listeners
        const unsubscribeReports = fetchReports(user.uid);
        const unsubscribeNotifications = fetchNotifications(user.uid);
  
        return () => {
          unsubscribeReports();
          unsubscribeNotifications();
        };
      } catch (error) {
        console.error("Error fetching user or reports:", error);
      }
    });
  
    return () => unsubscribeAuth();
  }, [filter, navigate]);

   const handleStatusUpdate = async (id, newStatus) => {
    const reportRef = doc(db, 'reports', id);
    const updates = {
      status: newStatus,
      updatedAt: serverTimestamp(),
    };
    
    if (newStatus === 'ongoing' && userData) {
      updates.assignedSupportId = auth.currentUser.uid;
    }
    
    await updateDoc(reportRef, updates);
    await logReportAction({
      reportId: id,
      action: `Status Updated to ${newStatus}`,
      actor: auth.currentUser?.uid,
      details: `Support marked report as ${newStatus}`,
    });
  };

  const handleAddInternalNote = async (reportId) => {
    if (!internalNotes.trim()) return;
    
    const note = {
      reportId,
      supportUserId: auth.currentUser.uid,
      note: internalNotes,
      createdAt: serverTimestamp(),
      isInternal: true
    };
    
    await addDoc(collection(db, 'report_notes'), note);
    setInternalNotes('');
    
    await logReportAction({
      reportId,
      action: 'Internal Note Added',
      actor: auth.currentUser?.uid,
      details: `Added internal note: "${internalNotes.substring(0, 30)}..."`,
    });
  };

  const handleAssignToMe = async (reportId) => {
    await updateDoc(doc(db, 'reports', reportId), {
      assignedSupportId: auth.currentUser.uid,
      status: 'ongoing',
      updatedAt: serverTimestamp()
    });
    
    await logReportAction({
      reportId,
      action: 'Report Assigned',
      actor: auth.currentUser?.uid,
      details: 'Assigned report to current support agent',
    });
  };

  const handleStartFollowUp = async (reportId, followUpDate) => {
    await addDoc(collection(db, 'follow_ups'), {
      reportId,
      followUpDate: Timestamp.fromDate(new Date(followUpDate)),
      assignedSupportId: auth.currentUser.uid,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'reports', reportId), {
      status: 'ongoing',
      updatedAt: serverTimestamp()
    });
    
    await logReportAction({
      reportId,
      action: 'Follow-Up Scheduled',
      actor: auth.currentUser?.uid,
      details: `Scheduled follow-up for ${followUpDate}`,
    });
  };

  const handleMarkResolved = async (reportId) => {
    await updateDoc(doc(db, 'reports', reportId), {
      status: 'closed',
      updatedAt: serverTimestamp(),
      resolvedAt: serverTimestamp()
    });
    
    await logReportAction({
      reportId,
      action: 'Report Resolved',
      actor: auth.currentUser?.uid,
      details: 'Marked report as resolved/closed',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Counselor Portal</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FiHome className="nav-icon" /> Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FiBarChart2 className="nav-icon" /> Analytics
          </button>
          <button
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => {
              if (reports.length > 0) {
                setSelectedStudent(reports[0].studentId || reports[0].studentPseudonym);
                setActiveTab('progress');
              }
            }}
          >
            <FiBook className="nav-icon" /> Progress Tracker
          </button>
          <button
            className="nav-item"
            onClick={() => {
              if (reports.length > 0) {
                setSelectedReport(reports[0]);
              }
            }}
          >
            <FiMessageSquare className="nav-icon" /> Student Chat
          </button>
          <button
            className={`nav-item ${activeTab === 'followups' ? 'active' : ''}`}
            onClick={() => setActiveTab('followups')}
          >
            <FiCalendar className="nav-icon" /> Follow-ups
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {userData?.name?.charAt(0) || userData?.email?.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{userData?.name || 'Counselor'}</span>
              <span className="user-role">Support Specialist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            {activeTab === 'reports' && 'Case Management'}
            {activeTab === 'analytics' && 'School Analytics'}
            {activeTab === 'progress' && 'Student Progress'}
            {activeTab === 'followups' && 'Scheduled Follow-ups'}
          </h1>
          <div className="header-actions">
            <NotificationBell notifications={notifications} />
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="dashboard-content">
            <div className="filters-section">
              <div className="filter-card">
                <h3 className="filter-title">Case Filters</h3>
                <div className="filter-grid">
                  <div className="filter-group">
                    <label>Category</label>
                    <select
                      onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                      value={filter.category}
                    >
                      <option value="">All Categories</option>
                      <option value="GBV">Gender-Based Violence</option>
                      <option value="Bullying">Bullying</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Academic">Academic</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Severity</label>
                    <select
                      onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                      value={filter.severity}
                    >
                      <option value="">All Levels</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Status</label>
                    <select
                      onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                      value={filter.status}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="serious">Critical</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="filter-group checkbox-group">
                    <input
                      type="checkbox"
                      id="assignedToMe"
                      checked={filter.assignedToMe}
                      onChange={(e) => setFilter({ ...filter, assignedToMe: e.target.checked })}
                    />
                    <label htmlFor="assignedToMe">My Cases Only</label>
                  </div>
                </div>
              </div>

              <div className="stats-card">
                <h3 className="stats-title">Case Overview</h3>
                <div className="stats-grid">
                  <div className="stat-item pending">
                    <span className="stat-count">{reports.filter(r => r.status === 'pending').length}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                  <div className="stat-item ongoing">
                    <span className="stat-count">{reports.filter(r => r.status === 'ongoing').length}</span>
                    <span className="stat-label">Ongoing</span>
                  </div>
                  <div className="stat-item critical">
                    <span className="stat-count">{reports.filter(r => r.status === 'serious').length}</span>
                    <span className="stat-label">Critical</span>
                  </div>
                  <div className="stat-item resolved">
                    <span className="stat-count">{reports.filter(r => r.status === 'resolved').length}</span>
                    <span className="stat-label">Resolved</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cases-section">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading cases...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="empty-state">
                  <FiFileText className="empty-icon" />
                  <p>No cases match your current filters</p>
                </div>
              ) : (
                <div className="cases-list">
                  {reports.map((report) => (
                    <div 
                      key={report.id} 
                      className={`case-card ${report.severity?.toLowerCase()}`}
                    >
                      <div className="case-header">
                        <div className="case-meta">
                          <span className="case-category">{report.category}</span>
                          <span className={`case-status ${report.status}`}>
                            {report.status}
                          </span>
                          {report.severity && (
                            <span className={`case-severity ${report.severity.toLowerCase()}`}>
                              {report.severity} severity
                            </span>
                          )}
                        </div>
                        <div className="case-details">
                          <span className="case-student">
                            Student: {report.studentPseudonym || 'Anonymous'}
                          </span>
                          <span className="case-date">
                            {report.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="case-content">
                        <p className="case-description">{report.description}</p>
                      </div>
                      <div className="case-actions">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="action-btn chat-btn"
                        >
                          <FiMessageSquare /> Open Chat
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(report.studentId || report.studentPseudonym);
                            setActiveTab('progress');
                          }}
                          className="action-btn profile-btn"
                        >
                          <FiUsers /> View Profile
                        </button>
                        <div className="action-group">
                          {report.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(report.id, 'ongoing')}
                              className="action-btn primary-btn"
                            >
                              Accept Case
                            </button>
                          )}
                          {report.status === 'ongoing' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(report.id, 'serious')}
                                className="action-btn warning-btn"
                              >
                                Escalate
                              </button>
                              <FollowUpScheduler 
                                reportId={report.id} 
                                onSchedule={handleStartFollowUp} 
                              />
                            </>
                          )}
                          {['ongoing', 'serious'].includes(report.status) && (
                            <button
                              onClick={() => handleMarkResolved(report.id)}
                              className="action-btn success-btn"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="case-notes">
                        <h4>Counselor Notes</h4>
                        <textarea
                          value={internalNotes}
                          onChange={(e) => setInternalNotes(e.target.value)}
                          placeholder="Add your case notes here..."
                        />
                        <button
                          onClick={() => handleAddInternalNote(report.id)}
                          className="notes-btn"
                        >
                          Save Notes
                        </button>
                      </div>
                      <ReportAuditLogs reportId={report.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard reports={reports} userData={userData} />
        )}

        {/* Progress Tracker Tab */}
        {activeTab === 'progress' && selectedStudent && (
          <ProgressTracker 
            studentId={selectedStudent} 
            onBack={() => setActiveTab('reports')}
          />
        )}

        {/* Follow-ups Tab */}
        {activeTab === 'followups' && (
          <div className="dashboard-content">
            <h2>Scheduled Follow-ups</h2>
            {/* Follow-ups content would go here */}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedReport && (
        <div className="chat-modal">
          <div className="chat-container">
            <div className="chat-header">
              <h3>
                Chat with {selectedReport.studentPseudonym || 'Student'}
              </h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="close-btn"
              >
                &times;
              </button>
            </div>
            <SupportChat 
              reportId={selectedReport.id} 
              studentId={selectedReport.studentId} 
              onClose={() => setSelectedReport(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;