import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Attach token if it exists
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('logiq_token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logiq_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
