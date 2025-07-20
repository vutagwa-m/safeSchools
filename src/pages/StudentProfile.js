import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import ProgressTracker from './ProgressTracker';

const StudentProfile = ({ studentId, onBack }) => {
  const [studentReports, setStudentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch reports by this student
        const reportsQuery = query(
          collection(db, 'reports'),
          where('studentId', '==', studentId),
          orderBy('createdAt', 'desc')
        );
        
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData = reportsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        
        setStudentReports(reportsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <button 
        onClick={onBack}
        className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
      >
        ← Back to reports
      </button>
      
      <h2 className="text-xl font-bold mb-4">Student Profile</h2>
      <p className="mb-6">ID: {studentId}</p>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'reports' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'progress' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </div>
      
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Report History</h3>
          {studentReports.length === 0 ? (
            <p>No reports found for this student.</p>
          ) : (
            <div className="space-y-3">
              {studentReports.map(report => (
                <div key={report.id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{report.category}</span>
                    <span className="text-sm text-gray-500">
                      {report.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{report.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {report.status}
                    </span>
                    {report.severity && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {report.severity} severity
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'progress' && (
        <ProgressTracker studentId={studentId} />
      )}
    </div>
  );
};

export default StudentProfile;