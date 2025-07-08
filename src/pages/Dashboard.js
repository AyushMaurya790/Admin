import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import styles from './Dashboard.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { admin, token, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    activeSubscriptions: 0,
    totalPayments: 0,
    totalOrders: 0,
  });
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Mock leads data for chart fallback
  const mockLeads = [
    { id: 1, name: "John Doe", email: "john@example.com", date: "2025-06-01", count: 2 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", date: "2025-06-02", count: 3 },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", date: "2025-06-03", count: 1 },
    { id: 4, name: "Alice Brown", email: "alice@example.com", date: "2025-06-04", count: 4 },
    { id: 5, name: "Charlie Davis", email: "charlie@example.com", date: "2025-06-05", count: 2 },
    { id: 6, name: "Eve Wilson", email: "eve@example.com", date: "2025-06-06", count: 5 },
    { id: 7, name: "Frank Lee", email: "frank@example.com", date: "2025-06-07", count: 3 },
  ];

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://test.soheru.me:5000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData({
          totalLeads: response.data.totalLeads,
          activeSubscriptions: response.data.activeSubscriptions,
          totalPayments: response.data.totalPayments,
          totalOrders: response.data.totalOrders,
        });
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Using fallback data.');
        setDashboardData({
          totalLeads: mockLeads.reduce((sum, lead) => sum + lead.count, 0),
          activeSubscriptions: 1,
          totalPayments: 298,
          totalOrders: 2,
        });
      }
    };
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Chart Data
  const chartData = {
    labels: error ? mockLeads.map(lead => lead.date) : ['2025-07-08'], // Current date
    datasets: [
      {
        label: 'Total Leads',
        data: error ? mockLeads.map(lead => lead.count) : [dashboardData.totalLeads],
        fill: error ? true : false,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 1)',
        tension: error ? 0.4 : 0,
        pointRadius: error ? 5 : 8,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
      },
    ],
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: error ? 'Daily Leads Trend' : 'Total Leads',
        font: {
          size: 18,
          family: "'Inter', sans-serif",
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Leads',
          font: { size: 14, family: "'Inter', sans-serif" },
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        title: {
          display: true,
          text: error ? 'Date' : 'Current',
          font: { size: 14, family: "'Inter', sans-serif" },
        },
      },
    },
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navbarTitle}>AI Marketplace Admin</div>
        <div className={styles.adminInfo}>
          <span className={styles.adminName}>{admin?.name || admin?.email || 'Admin'}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>
      <div className={styles.content}>
        <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Total Leads</h2>
            <p className={styles.cardValue}>{dashboardData.totalLeads}</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Active Subscriptions</h2>
            <p className={styles.cardValue}>{dashboardData.activeSubscriptions}</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Total Payments</h2>
            <p className={styles.cardValue}>₹{dashboardData.totalPayments}</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Total Orders</h2>
            <p className={styles.cardValue}>{dashboardData.totalOrders}</p>
          </div>
        </div>
        <div className={styles.chartContainer}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;