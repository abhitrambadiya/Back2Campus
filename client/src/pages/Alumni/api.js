// services/api.js
import axios from 'axios';

const myAPI = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const VITE_API_URL = `${myAPI}/alumni`;

// Create axios instance with base URL
const apiAlumni = axios.create({
  baseURL: VITE_API_URL,
});

// Request interceptor for adding token
apiAlumni.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alumniToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiAlumni.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, redirect to login
      localStorage.removeItem('alumniToken');
      localStorage.removeItem('alumniInfo');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiAlumni;