import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://test.soheru.me:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 API Request [${config.method?.toUpperCase()}] ${config.url} with token:`, token.substring(0, 20) + '...');
    } else {
      console.warn(`⚠️ API Request [${config.method?.toUpperCase()}] ${config.url} without token`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response [${response.config.method?.toUpperCase()}] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    
    console.error(`❌ API Error [${method}] ${url} - Status: ${status}`, error.response?.data);
    
    if (status === 401) {
      console.warn('🚫 Token expired or invalid - clearing auth data');
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        console.log('🔄 Redirecting to login page');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; // ✅ correct export
