import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { predictNextCategory } from '../logic/predictNextCategory';

const PredictionChart = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'logs'), (snapshot) => {
      setLogs(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  const predictions = predictNextCategory(logs);

  const terms = Object.keys(predictions);
  const predictedCategories = Object.values(predictions);

  const data = {
    labels: terms,
    datasets: [
      {
        label: 'Predicted Top Category',
        data: predictedCategories.map(() => 1),
        backgroundColor: '#4CAF50',
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Predicted: ${predictedCategories[context.dataIndex]}`,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: { display: false },
      y: {
        ticks: {
          callback: (_, i) => predictedCategories[i],
        },
      },
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-10">
      <h2 className="text-xl font-bold mb-4">🔮 Predicted Top Categories</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default PredictionChart;
