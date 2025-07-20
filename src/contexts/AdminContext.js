import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config'; 
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy 
} from 'firebase/firestore';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // Using a single state object for better organization, as in the first example
  const [adminData, setAdminData] = useState({
    users: [],
    reports: [], // For all reports
    flaggedReports: [], // For reports with high/critical severity
    logs: [], // For system logs
    notifications: [], // Added based on Firestore rules, assuming an admin might need to see these
    studentProgress: [], // Added based on Firestore rules
    followUps: [], // Added based on Firestore rules
    reportNotes: [], // Added based on Firestore rules
    educationalContent: [], // Added based on Firestore rules
  });

  // Real-time user data
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Add pseudonym fallback as in the first snippet
        displayName: doc.data().pseudonym || (doc.data().email ? doc.data().email.split('@')[0] : 'N/A')
      }));
      setAdminData(prev => ({ ...prev, users }));
    });
    return unsubscribe; // Return unsubscribe for cleanup
  }, []);

  // Real-time reports (all reports, if needed for admin dashboard)
  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc')); // Order by creation date
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to Date object
      }));
      setAdminData(prev => ({ ...prev, reports }));
    });
    return unsubscribe;
  }, []);

  // Real-time flagged reports (high/critical severity)
  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      where('severity', 'in', ['high', 'critical']), // Use 'in' to catch both 'high' and 'critical'
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flaggedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAdminData(prev => ({ ...prev, flaggedReports }));
    });
    return unsubscribe;
  }, []);

  // Real-time system logs
  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc')); // Assuming logs have a 'timestamp' field
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setAdminData(prev => ({ ...prev, logs }));
    });
    return unsubscribe;
  }, []);

  // You can add more useEffects here for other collections an admin might need
  // Example: Notifications (if admins can view all notifications)
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAdminData(prev => ({ ...prev, notifications }));
    });
    return unsubscribe;
  }, []);

  // Example: Student Progress
  useEffect(() => {
    const q = query(collection(db, 'studentProgress'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentProgress = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdminData(prev => ({ ...prev, studentProgress }));
    });
    return unsubscribe;
  }, []);

  // Example: Follow-ups
  useEffect(() => {
    const q = query(collection(db, 'follow_ups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followUps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAdminData(prev => ({ ...prev, followUps }));
    });
    return unsubscribe;
  }, []);

  // Example: Report Notes
  useEffect(() => {
    const q = query(collection(db, 'report_notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAdminData(prev => ({ ...prev, reportNotes }));
    });
    return unsubscribe;
  }, []);

  // Example: Educational Content
  useEffect(() => {
    const q = query(collection(db, 'educationalContent'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const educationalContent = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAdminData(prev => ({ ...prev, educationalContent }));
    });
    return unsubscribe;
  }, []);


  return (
    <AdminContext.Provider value={adminData}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);