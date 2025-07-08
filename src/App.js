// App.js
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Orders from './pages/Orders';
import Subscriptions from './pages/Subscriptions';
import styles from './App.module.css';
import Login from './login/Login';
import Uploads from './pages/Uploads';
import SubscriptionPlan from './pages/SubscriptionPlan'; // Importing SubscriptionPlan component

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  return (
    <div className={styles.appContainer}>
      {!isLoginPage && (
        <button
          className={styles.hamburger}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg className={styles.hamburgerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      )}

      {!isLoginPage && (
        <Sidebar
          setActiveSection={setActiveSection}
          activeSection={activeSection}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}

      <div className={`${styles.mainContent} ${isSidebarOpen ? styles.mainContentOpen : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/subscriptionPlan" element={
            <ProtectedRoute>
              <SubscriptionPlan />
            </ProtectedRoute>
          } />
          <Route path="/subscription plan" element={
            <ProtectedRoute>
              <SubscriptionPlan />
            </ProtectedRoute>
          } />
          <Route path="/uploads" element={
            <ProtectedRoute>
              <Uploads />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default App;
