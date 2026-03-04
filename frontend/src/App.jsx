import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import CreateEvent from './pages/CreateEvent';
import QRScanner from './pages/QRScanner';

import JoinEvent from './pages/JoinEvent';
import FeedbackPage from './pages/FeedbackPage';
import EventManagement from './pages/EventManagement';
import AdminQRDisplay from './pages/AdminQRDisplay';
import EditEvent from './pages/EditEvent';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />

          <Route path="/join-event" element={
            <PrivateRoute>
              <JoinEvent />
            </PrivateRoute>
          } />

          <Route path="/feedback/:eventId" element={
            <PrivateRoute>
              <FeedbackPage />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute role="Admin">
              <AdminDashboard />
            </PrivateRoute>
          } />

          <Route path="/admin/events" element={
            <PrivateRoute role="Admin">
              <EventManagement />
            </PrivateRoute>
          } />

          <Route path="/admin/create-event" element={
            <PrivateRoute role="Admin">
              <CreateEvent />
            </PrivateRoute>
          } />

          <Route path="/admin/scanner" element={
            <PrivateRoute role="Admin">
              <QRScanner />
            </PrivateRoute>
          } />
          <Route path="/admin/display-qr/:eventId" element={
            <PrivateRoute role="Admin">
              <AdminQRDisplay />
            </PrivateRoute>
          } />
          <Route path="/admin/edit-event/:eventId" element={
            <PrivateRoute role="Admin">
              <EditEvent />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
