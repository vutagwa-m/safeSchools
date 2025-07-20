import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const ProgressTracker = ({ studentId }) => {
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    mood: 'neutral',
    notes: '',
    recommendations: ''
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const q = query(
          collection(db, 'studentProgress'),
          where('studentId', '==', studentId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        
        setProgressEntries(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching progress data:", error);
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [studentId]);

  const handleAddProgressEntry = async (e) => {
    e.preventDefault();
    
    const entry = {
      studentId,
      supportId: auth.currentUser.uid,
      ...newEntry,
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'studentProgress'), entry);
    
    // Reset form and refresh data
    setNewEntry({
      mood: 'neutral',
      notes: '',
      recommendations: ''
    });
    
    // Refresh the list
    const q = query(
      collection(db, 'studentProgress'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    setProgressEntries(data);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Well-being Progress</h3>
      
      <form onSubmit={handleAddProgressEntry} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Add New Progress Entry</h4>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Mood</label>
          <select
            value={newEntry.mood}
            onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="very-happy">😊 Very Happy</option>
            <option value="happy">🙂 Happy</option>
            <option value="neutral">😐 Neutral</option>
            <option value="sad">🙁 Sad</option>
            <option value="very-sad">😞 Very Sad</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={newEntry.notes}
            onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Recommendations</label>
          <textarea
            value={newEntry.recommendations}
            onChange={(e) => setNewEntry({...newEntry, recommendations: e.target.value})}
            className="w-full p-2 border rounded"
            rows="2"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Entry
        </button>
      </form>
      
      {progressEntries.length === 0 ? (
        <p>No progress entries yet.</p>
      ) : (
        <div className="space-y-4">
          {progressEntries.map(entry => (
            <div key={entry.id} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-2xl">
                  {entry.mood === 'very-happy' && '😊'}
                  {entry.mood === 'happy' && '🙂'}
                  {entry.mood === 'neutral' && '😐'}
                  {entry.mood === 'sad' && '🙁'}
                  {entry.mood === 'very-sad' && '😞'}
                </div>
                <span className="text-sm text-gray-500">
                  {entry.createdAt.toLocaleDateString()}
                </span>
              </div>
              
              {entry.notes && (
                <div className="mb-3">
                  <h5 className="font-medium text-sm mb-1">Notes</h5>
                  <p className="text-sm">{entry.notes}</p>
                </div>
              )}
              
              {entry.recommendations && (
                <div>
                  <h5 className="font-medium text-sm mb-1">Recommendations</h5>
                  <p className="text-sm">{entry.recommendations}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;