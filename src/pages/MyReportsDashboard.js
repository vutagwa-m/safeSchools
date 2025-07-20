import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const MyReportsDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'reports'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);

          const data = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const reportData = docSnap.data();
              let response = null;

              if (reportData.responseId) {
                const responseDoc = await getDoc(doc(db, 'responses', reportData.responseId));
                if (responseDoc.exists()) {
                  response = responseDoc.data().responseText || null;
                }
              }

              return { id: docSnap.id, ...reportData, response };
            })
          );

          setReports(data);
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setReports([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Reports</h2>
      {loading ? (
        <p className="text-gray-500">Loading your reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">You haven’t submitted any reports yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{report.category}</h3>
                  <p className="text-gray-700 mb-2">{report.description}</p>
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Status: {report.status}
                  </p>
                  {report.response && (
                    <div className="mt-2 text-green-600">
                      <strong>Support Response:</strong> {report.response}
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold">
                  <span className={getSeverityColor(report.severity)}>
                    {report.severity || 'Unspecified'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReportsDashboard;
