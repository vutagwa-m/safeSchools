import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReportForm from './pages/ReportForm';
import MyReportsDashboard from './pages/MyReportsDashboard';
import React from "react";
import { Toaster } from "react-hot-toast";
import EducationHub from './pages/EducationHub';
import SupportDashboard from './pages/SupportDashboard';
import Register from './pages/Register';
import SupportChat from './pages/SupportChat';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import ProgressTracker from './pages/ProgressTracker';
import FollowUpScheduler from './pages/FollowUpScheduler';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import NotificationBell from './pages/NotificationBell';
import AdminDashboard from './pages/AdminDashboard';



function App() {
  return (
   <>
      <Navbar />
      <Toaster/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportForm />} />
        <Route path="/resources" element={<EducationHub />} />
        <Route path="/myReport" element={<MyReportsDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/support" element={<SupportDashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
      <Footer />
      </>
  );
}

export default App;
