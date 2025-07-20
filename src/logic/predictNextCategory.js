// logic/predictNextCategory.js
import * as tf from '@tensorflow/tfjs';

export const predictNextCategory = (logs) => {
  const categoryMap = {};
  logs.forEach(log => {
    const key = `${log.term}_${log.category}`;
    categoryMap[key] = (categoryMap[key] || 0) + 1;
  });

  const grouped = {};
  for (const [key, count] of Object.entries(categoryMap)) {
    const [term, category] = key.split('_');
    if (!grouped[term]) grouped[term] = [];
    grouped[term].push({ category, count });
  }

  const prediction = {};
  for (const term in grouped) {
    const top = grouped[term].sort((a, b) => b.count - a.count)[0];
    prediction[term] = top.category;
  }

  return prediction; // e.g. { 'Term 1': 'Bullying', 'Term 2': 'Truancy' }
};
