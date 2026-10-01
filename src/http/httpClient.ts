// src/api/axios.js
import axios from 'axios';
import { decryptAuthData } from '../lib/helper';
import { goToAmuzeAdmin } from '../lib/amuze';

// const baseURL = import.meta.env.VITE_APP_BASE_URL;
const baseURL= import.meta.env.VITE_APP_BASE_URL ? import.meta.env.VITE_APP_BASE_URL : 'http://localhost:3000';
const axiosInstance = axios.create({
  baseURL: baseURL, //  Set your API base URL
  timeout: 90000, // Optional: request timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Optional: Add interceptors for request/response
axiosInstance.interceptors.request.use(
  (config) => {
    // e.g., Add token to headers
    const user = decryptAuthData(localStorage.getItem('user')!);
    const token = user?.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    //unauthorized: the AMUZE token expired or was rejected, so sign in again through AMUZE.
    // The /sso call itself is excluded so its page can show why sign-in failed.
    if(error?.response?.status === 401 && !error?.config?.url?.includes('/auth/admin/sso')) {
        localStorage.removeItem('user');
        goToAmuzeAdmin();
    }

    // Global error handling
    console.error('API error:', error.response || error.message);
    return Promise.reject(error);
  }
);



export default axiosInstance;
