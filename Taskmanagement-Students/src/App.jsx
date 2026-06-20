import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from './components/layout/StudentLayout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import Materials from './pages/Materials/Materials';
import MyReport from './pages/Reports/MyReport';
import NotificationPage from './pages/Notifications/NotificationPage';
import ProfileView from './pages/Profile/ProfileView';
import ResumeBuilder from './pages/Profile/ResumeBuilder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - Redirect if already logged in */}
        <Route path="/login" element={
          localStorage.getItem('studentToken') ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/register" element={
          localStorage.getItem('studentToken') ? <Navigate to="/" replace /> : <Register />
        } />
        
        {/* Protected Student Portal */}
        <Route path="/" element={
          localStorage.getItem('studentToken') ? <StudentLayout /> : <Navigate to="/login" replace />
        }>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="materials" element={<Materials />} />
          <Route path="report" element={<MyReport />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="profile/resume-builder" element={<ResumeBuilder />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
