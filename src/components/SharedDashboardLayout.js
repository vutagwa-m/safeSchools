import React from 'react';
import { Link } from 'react-router-dom';

const SharedDashboardLayout = ({ children, userRole }) => {
  const renderSidebarLinks = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <Link to="/admin" className="mb-4">Dashboard</Link>
            <Link to="/admin/manage-users" className="mb-4">Manage Users</Link>
            <Link to="/admin/reports" className="mb-4">View Reports</Link>
          </>
        );
      case 'support':
        return (
          <>
            <Link to="/support" className="mb-4">Dashboard</Link>
            <Link to="/support/tickets" className="mb-4">View Tickets</Link>
            <Link to="/support/analytics" className="mb-4">Analytics</Link>
          </>
        );
      case 'student':
        return (
          <>
            <Link to="/student" className="mb-4">Dashboard</Link>
            <Link to="/student/assignments" className="mb-4">My Assignments</Link>
            <Link to="/student/grades" className="mb-4">View Grades</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-2xl mb-4">Dashboard</h2>
        {renderSidebarLinks()}
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <header>
          <h1 className="text-3xl font-semibold mb-6">Welcome to the {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard</h1>
        </header>
        {children}
      </div>
    </div>
  );
};

export default SharedDashboardLayout;
