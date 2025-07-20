// components/TrendChart.js
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useLogTrends } from '../hooks/useLogTrends';
import { useEffect, useState } from 'react';
import { predictNextCategory } from '../logic/predictNextCategory';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const TrendChart = () => {
    const [term, setTerm] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [logs, setLogs] = useState([]);
    const trendData = useLogTrends(term, {
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
    });

  const regions = Object.keys(trendData);
  const categories = Array.from(new Set(regions.flatMap(r => Object.keys(trendData[r]))));

  const chartData = {
    labels: categories,
    datasets: regions.map((region, i) => ({
      label: region,
      data: categories.map(cat => trendData[region][cat] || 0),
      backgroundColor: `hsl(${(i * 60) % 360}, 70%, 60%)`,
    })),
  };
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'logs'), (snapshot) => {
      const allLogs = snapshot.docs.map((doc) => doc.data());
      setLogs(allLogs);
    });
    return () => unsub();
  }, []);

  const predictions = predictNextCategory(logs);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Trend Analytics</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
          <option value="">All Terms</option>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <Bar data={chartData} />
      {Object.keys(predictions).length > 0 && (
  <div className="mt-8 p-4 bg-blue-50 border border-blue-300 rounded-md">
    <h3 className="font-bold text-lg mb-2 text-blue-800">📊 Predicted Most Reported Category per Term</h3>
    <ul className="list-disc ml-5">
      {Object.entries(predictions).map(([term, category]) => (
        <li key={term}><strong>{term}:</strong> {category}</li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
};

export default TrendChart;
