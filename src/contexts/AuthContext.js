import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminInfo');
    
    if (storedToken) {
      try {
        // Verify token is not expired
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp > currentTime) {
          setToken(storedToken);
          if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
          }
        } else {
          // Token expired, remove it
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
        }
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, adminInfo) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
    setToken(token);
    setAdmin(adminInfo);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = () => {
    return token !== null;
  };

  const value = {
    token,
    admin,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
