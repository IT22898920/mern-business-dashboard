import api, { handleAPIError } from './api';

export const leaveService = {
  async createLeave(payload) {
    try {
      const res = await api.post('/leaves', payload);
      return res.data.data || res.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async getMyLeaves() {
    try {
      const res = await api.get('/leaves/me');
      return res.data.data || res.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async getAllLeaves(params = {}) {
    try {
      const res = await api.get('/leaves', { params });
      return res.data.data || res.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async approveLeave(id, adminNote) {
    try {
      const res = await api.put(`/leaves/${id}/approve`, { adminNote });
      return res.data.data || res.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async rejectLeave(id, adminNote) {
    try {
      const res = await api.put(`/leaves/${id}/reject`, { adminNote });
      return res.data.data || res.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },
};

export default leaveService;



