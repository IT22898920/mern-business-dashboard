import api from './api';

export const supplierApplicationService = {
  // Submit a new application
  submitApplication: (applicationData) => {
    return api.post('/supplier-applications/apply', applicationData);
  },

  // Get user's own application
  getMyApplication: () => {
    return api.get('/supplier-applications/my-application');
  },

  // Update user's own application
  updateMyApplication: (applicationData) => {
    return api.put('/supplier-applications/my-application', applicationData);
  },

  // Admin functions
  getAllApplications: (params = {}) => {
    return api.get('/supplier-applications', { params });
  },

  getApplicationById: (id) => {
    return api.get(`/supplier-applications/${id}`);
  },

  updateApplicationStatus: (id, status, reviewNotes = '', rejectionReason = '') => {
    return api.put(`/supplier-applications/${id}/status`, { 
      status, 
      reviewNotes, 
      rejectionReason 
    });
  },

  deleteApplication: (id) => {
    return api.delete(`/supplier-applications/${id}`);
  },

  getApplicationStats: () => {
    return api.get('/supplier-applications/stats');
  }
};