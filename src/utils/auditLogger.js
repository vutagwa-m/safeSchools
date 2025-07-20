import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const logReportAction = async (action) => {
  await addDoc(collection(db, 'audit_logs'), {
    ...action,
    timestamp: new Date(),
    actorId: auth.currentUser?.uid,
    actorRole: 'admin'
  });
};

export const logSystemAction = async (action) => {
  await addDoc(collection(db, 'system_logs'), {
    ...action,
    timestamp: new Date(),
    severity: 'info' 
  });
};