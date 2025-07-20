import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const logReportAction = async ({ reportId, action, actor, details }) => {
  try {
    await addDoc(collection(db, 'report_logs'), {
      reportId,
      action,
      actor,
      timestamp: serverTimestamp(),
      details,
    });
  } catch (error) {
    console.error('Failed to log report action:', error);
  }
};
