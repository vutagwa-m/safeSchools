import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app ,db} from './config';


export const storage = getStorage(app);

// Submit a new report 
export const submitReport = async (reportData, file = null) => {
  try {
    let fileURL = null;

    if (file) {
      const fileRef = ref(storage, `attachments/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      attachment: fileURL,
      timestamp: serverTimestamp(),
      status: 'pending', 
    });

    return docRef.id;
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
};

// Fetch all reports
export const fetchReports = async () => {
  const q = query(collection(db, 'reports'));
  const querySnapshot = await getDocs(q);
  const reports = [];
  querySnapshot.forEach((doc) => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  return reports;
};

// Fetch reports by status
export const fetchReportsByStatus = async (status) => {
  const q = query(collection(db, 'reports'), where('status', '==', status));
  const querySnapshot = await getDocs(q);
  const reports = [];
  querySnapshot.forEach((doc) => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  return reports;
};
