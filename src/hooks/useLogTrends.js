// hooks/useLogTrends.js
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useLogTrends = (selectedTerm, dateRange) => {
  const [trendData, setTrendData] = useState({});

  useEffect(() => {
    const colRef = collection(db, 'logs');

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const logs = snapshot.docs
        .map(doc => doc.data())
        .filter(log => {
          const matchesTerm = selectedTerm ? log.term === selectedTerm : true;
          const matchesDate =
            dateRange.start && dateRange.end
              ? new Date(log.timestamp) >= dateRange.start &&
                new Date(log.timestamp) <= dateRange.end
              : true;
          return matchesTerm && matchesDate;
        });

      const counts = {};
      logs.forEach(({ category, region }) => {
        if (!counts[region]) counts[region] = {};
        if (!counts[region][category]) counts[region][category] = 0;
        counts[region][category] += 1;
      });

      setTrendData(counts);
    });

    return () => unsubscribe();
  }, [selectedTerm, dateRange]);

  return trendData;
};
