import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a Gmail address');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending login request:', { email, password });
      const loginResponse = await fetch('http://test.soheru.me:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();
      console.log('Login API Response:', loginData);

      if (!loginResponse.ok) {
        setError(loginData.message || 'Login failed');
        console.error('Login failed with status:', loginResponse.status, loginData);
        setLoading(false);
        return;
      }

      if (!loginData.token) {
        setError('No token received from server. Please try again.');
        console.error('Response lacks token:', loginData);
        setLoading(false);
        return;
      }

      const adminData = {
        ...loginData.admin,
        name: loginData.admin.name || formatEmailToName(email),
      };

      login(loginData.token, adminData);
      console.log('✅ Token saved successfully:', loginData.token);

      if (onLogin) onLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.message);
      setError('Could not connect to server. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatEmailToName = (email) => {
    const username = email.split('@')[0];
    return username
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon}>
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563eb"/>
            <path d="M2 17L12 22L22 17" stroke="#4b5563" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="#4b5563" strokeWidth="2"/>
          </svg>
        </div>
        <h2 className={styles.loginTitle}>AI Admin Login</h2>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Gmail Address <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              aria-required="true"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
            aria-label={loading ? 'Logging in' : 'Login'}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;