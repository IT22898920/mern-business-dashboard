import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only show toast if not already on auth pages and not during initial load
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/admin/dashboard') &&
          localStorage.getItem('skipSessionExpiredToast') !== 'true') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (response?.status === 404) {
      toast.error('Resource not found.');
    } else if (response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user (using demo endpoint for development)
  login: (credentials) => api.post('/demo/auth/login', credentials),
  
  // Logout user
  logout: () => api.post('/auth/logout'),
  
  // Get current user profile
  getProfile: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/auth/update-profile', userData),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  
  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  
  // Resend email verification
  resendVerification: () => api.post('/auth/resend-verification'),
  
  // Upload avatar
  uploadAvatar: (formData) => api.put('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// User management API endpoints (Admin)
export const userAPI = {
  // Get all users
  getAllUsers: (params = {}) => api.get('/users', { params }),
  // Create user (Admin)
  createUser: (userData) => api.post('/users', userData),
  
  // Get user by ID
  getUserById: (id) => api.get(`/users/profile/${id}`),
  
  // Update user (Admin)
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user (Admin)
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Get users by role
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  
  // Get user statistics (Admin)
  getUserStats: () => api.get('/users/stats'),
  
  // Deactivate user (Admin)
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
  
  // Activate user (Admin)
  activateUser: (id) => api.put(`/users/${id}/activate`),
  
  // Unlock user (Admin)
  unlockUser: (id) => api.put(`/users/${id}/unlock`),
};

// Utility functions
export const handleAPIError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const handleAPISuccess = (response) => {
  return response.data;
};

// File upload helper
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Image compression helper
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      // Set canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export default api;