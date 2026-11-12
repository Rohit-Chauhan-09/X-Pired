import axios from 'axios';

const api = axios.create({
  baseURL: 'https://x-pired.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xpired_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or session invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('xpired_token');
        localStorage.removeItem('xpired_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
