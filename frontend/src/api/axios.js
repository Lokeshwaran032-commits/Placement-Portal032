import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (only when on protected pages, not on /login or /register)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
    if (err.response?.status === 401 && !isAuthPage) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
