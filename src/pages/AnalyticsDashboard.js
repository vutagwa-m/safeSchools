import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = ({ reports, userData }) => {
  // Prepare data for charts
  const getCategoryData = () => {
    const categories = {};
    
    reports.forEach(report => {
      categories[report.category] = (categories[report.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getStatusData = () => {
    const statuses = {};
    
    reports.forEach(report => {
      statuses[report.status] = (statuses[report.status] || 0) + 1;
    });
    
    return Object.entries(statuses).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getSeverityData = () => {
    const severities = {};
    
    reports.forEach(report => {
      if (report.severity) {
        severities[report.severity] = (severities[report.severity] || 0) + 1;
      }
    });
    
    return Object.entries(severities).map(([name, count]) => ({
      name,
      count
    }));
  };

  const categoryData = getCategoryData();
  const statusData = getStatusData();
  const severityData = getSeverityData();

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Reports Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{reports.length}</div>
            <div className="text-sm">Total Reports</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'closed').length}
            </div>
            <div className="text-sm">Resolved</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm">Pending</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-4">Reports by Category</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-4">Reports by Status</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {severityData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium mb-4">Reports by Severity</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;