import { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import MetricCard from '../MetricCard';
import Grid from '@mui/material/Grid';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState('month');
  const [reportData, setReportData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      // Fetch reports for time range
      const q = query(collection(db, 'reports'));
      const snapshot = await getDocs(q);
      
      // Process data for charts
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt.toDate()
      }));
      
      // Group by time period
      const timeGroups = groupByTime(reports, timeRange);
      setReportData(timeGroups);
      
      // Group by category
      const categoryGroups = groupByCategory(reports);
      setCategoryData(categoryGroups);
    };
    
    loadAnalytics();
  }, [timeRange]);

  const groupByTime = (reports, range) => {
    // Implementation for grouping by day/week/month
    // Returns array like [{ period: 'Jan', count: 12 }, ...]
  };

  const groupByCategory = (reports) => {
    // Implementation for grouping by category
    // Returns array like [{ name: 'Harassment', value: 15 }, ...]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>System Analytics</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <MenuItem value="day">Daily</MenuItem>
          <MenuItem value="week">Weekly</MenuItem>
          <MenuItem value="month">Monthly</MenuItem>
        </Select>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Paper sx={{ p: 2, width: '100%', maxWidth: 600 }}>
          <Typography variant="h6">Reports Over Time</Typography>
          <BarChart width={550} height={300} data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </Paper>
        
        <Paper sx={{ p: 2, width: '100%', maxWidth: 400 }}>
          <Typography variant="h6">Report Categories</Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Paper>

        
      </Box>
      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
        <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={4}>
          <MetricCard title="Total Reports" value={reportData.reduce((sum, d) => sum + d.count, 0)} />
        </Grid>
        <Grid item xs={4}>
          <MetricCard title="Avg Resolution Time" value="2.5 days" />
        </Grid>
        <Grid item xs={4}>
          <MetricCard title="Active Support Staff" value="8" />
        </Grid>
      </Grid></Box>
    </Box>
  );
}