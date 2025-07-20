import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import SupportChat from './SupportChat';
import ReportForm from './ReportForm';
import { FiBook, FiAlertCircle, FiMessageSquare, FiUser, FiLogOut, FiPlus } from 'react-icons/fi';
import '../styles/student-dashboard.css';

const StudentDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const navigate = useNavigate();

  // Status colors mapping
  const statusColors = {
    pending: 'status-pending',
    ongoing: 'status-ongoing',
    serious: 'status-serious',
    reviewed: 'status-reviewed',
    closed: 'status-resolved'
  };

  // Fetch student's reports
  const fetchReports = (userId) => {
    let q;
    
    if (userId) {
      q = query(
        collection(db, 'reports'),
        where('reporterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      const anonymousReports = JSON.parse(localStorage.getItem('anonymousReports') || '[]');
      setReports(anonymousReports);
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setReports(data);
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const unsubscribeReports = fetchReports(user?.uid);
      return () => unsubscribeReports();
    });

    return () => unsubscribeAuth();
  }, []);

  const handleNewReportSubmit = (newReport) => {
    if (!user) {
      const anonymousReports = JSON.parse(localStorage.getItem('anonymousReports') || '[]');
      anonymousReports.push({
        ...newReport,
        id: `anonymous-${Date.now()}`,
        createdAt: new Date()
      });
      localStorage.setItem('anonymousReports', JSON.stringify(anonymousReports));
      setReports(anonymousReports);
    }
    setShowReportForm(false);
  };

  return (
    <div className="academic-dashboard">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>
            <FiBook className="icon" /> Academic Support
          </h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FiAlertCircle className="icon" /> My Reports
          </button>
          
          <button 
            className="nav-item"
            onClick={() => setShowReportForm(true)}
          >
            <FiPlus className="icon" /> New Report
          </button>
          
          {selectedReport && (
            <button 
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('chat');
                setSelectedReport(selectedReport);
              }}
            >
              <FiMessageSquare className="icon" /> Support Chat
            </button>
          )}
          
          {user && (
            <button 
              className="nav-item"
              onClick={() => auth.signOut()}
            >
              <FiLogOut className="icon" /> Sign Out
            </button>
          )}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>
            {user ? `${user.displayName || 'Student'}'s Dashboard` : 'Anonymous Reports'}
          </h1>
          {user && (
            <div className="user-profile">
              <div className="avatar">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </div>
              <span>{user.displayName || user.email}</span>
            </div>
          )}
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="dashboard-content">
            <div className="content-header">
              <h2>My Reports</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowReportForm(true)}
              >
                <FiPlus /> New Report
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="empty-state">
                <FiAlertCircle className="icon" />
                <p>No reports found. Submit a new report to get started.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowReportForm(true)}
                >
                  Create First Report
                </button>
              </div>
            ) : (
              <div className="reports-grid">
                {reports.map(report => (
                  <div 
                    key={report.id} 
                    className={`report-card ${report.severity === 'High' ? 'high-severity' : ''}`}
                  >
                    <div className="card-header">
                      <h3>{report.category}</h3>
                      <span className={`status-badge ${statusColors[report.status]}`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="card-meta">
                      <span>Submitted: {report.createdAt.toLocaleString()}</span>
                      {report.severity && <span>Severity: {report.severity}</span>}
                    </div>

                    <p className="card-description">{report.description}</p>

                    <div className="card-actions">
                      {(report.status === 'ongoing' || report.status === 'serious') && (
                        <button
                          className="btn-primary"
                          onClick={() => {
                            setSelectedReport(report);
                            setActiveTab('chat');
                          }}
                        >
                          <FiMessageSquare /> Chat with Support
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && selectedReport && (
          <div className="dashboard-content">
            <div className="content-header">
              <h2>Support Conversation</h2>
              <button 
                className="btn-outline"
                onClick={() => setActiveTab('reports')}
              >
                Back to Reports
              </button>
            </div>
            
            <div className="chat-container">
              <SupportChat 
                reportId={selectedReport.id} 
                studentId={user?.uid || 'anonymous'} 
                studentPseudonym={selectedReport.studentPseudonym || 'Anonymous'}
                onClose={() => setSelectedReport(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Report</h2>
              <button 
                className="modal-close"
                onClick={() => setShowReportForm(false)}
              >
                ✕
              </button>
            </div>
            <ReportForm 
              onSubmit={handleNewReportSubmit} 
              isAnonymous={!user}
              onCancel={() => setShowReportForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;