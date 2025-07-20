import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const ReportAuditLogs = ({ reportId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const logsRef = collection(db, 'report_logs');
      const q = query(
        logsRef,
        where('reportId', '==', reportId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const logData = snapshot.docs.map((doc) => doc.data());
      setLogs(logData);
    };

    fetchLogs();
  }, [reportId]);

  if (!logs.length) return null;

  return (
    <div className="mt-4 p-2 bg-gray-50 rounded border">
      <h4 className="text-sm font-semibold mb-2">Audit Log</h4>
      <ul className="text-xs space-y-1">
        {logs.map((log, index) => (
          <li key={index}>
            <span className="font-medium">{log.action}</span> - {log.details} <br />
            <span className="text-gray-500">
              {log.timestamp?.toDate().toLocaleString() || '...'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportAuditLogs;
