import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LanguageSelector from './LanguageSelector';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Safe<span>Schools</span></div>

      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        {user && user.role === 'student' && (
          <li><a href="/report">Report</a></li>
        )}
        {user && user.role === 'support' && (
          <li><a href="/dashboard">Dashboard</a></li>
        )}
        <li><a href="/resources">Resources</a></li>
        <li><a href="/chat">Get Help</a></li>
      </ul>

      <div className="navbar-right">
        <LanguageSelector />
        {user ? <span>👋 {user.displayName || 'User'}</span> : <a href="/login">Login</a>}
      </div>
    </nav>
  );
};

export default Navbar;
