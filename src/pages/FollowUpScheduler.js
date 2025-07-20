import React, { useState } from 'react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const FollowUpScheduler = ({ reportId, onSchedule }) => {
  const [followUpDate, setFollowUpDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!followUpDate) return;
    
    setIsScheduling(true);
    try {
      await onSchedule(reportId, followUpDate);
      setFollowUpDate('');
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={followUpDate}
        onChange={(e) => setFollowUpDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="text-sm p-1 border rounded"
      />
      <button
        onClick={handleSchedule}
        disabled={!followUpDate || isScheduling}
        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
      >
        {isScheduling ? 'Scheduling...' : 'Schedule'}
      </button>
    </div>
  );
};

export default FollowUpScheduler;