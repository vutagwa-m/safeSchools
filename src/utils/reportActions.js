import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { logReportAction } from './auditLogger';

export const escalateReport = async (reportId) => {
  await updateDoc(doc(db, 'reports', reportId), {
    status: 'escalated',
    lastUpdated: new Date()
  });
  
  await logReportAction({
    reportId,
    actionType: 'escalation',
    details: 'Report escalated to admin'
  });
};

export const reassignReport = async (reportId, newAssigneeId) => {
  const prevAssignee = 
  
  await updateDoc(doc(db, 'reports', reportId), {
    assignedTo: newAssigneeId,
    status: 'reassigned'
  });

  await logReportAction({
    reportId,
    actionType: 'reassignment',
    details: `Reassigned from ${prevAssignee} to ${newAssigneeId}`
  });
};
export const resolveReport = async (reportId) => {
  await updateDoc(doc(db, 'reports', reportId), {
    status: 'resolved',
    resolvedAt: new Date()
  });
};