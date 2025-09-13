import { authAPI, handleAPIError } from './api';

export const employeeService = {
  async listEmployees({ page = 1, limit = 10, search } = {}) {
    try {
      const res = await authAPI.get('/users', { params: { page, limit, role: 'employee', search } });
      return res.data.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async createEmployee(payload) {
    try {
      const res = await authAPI.post('/users', payload);
      return res.data.data.user;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async updateEmployee(id, payload) {
    try {
      const res = await authAPI.put(`/users/${id}`, payload);
      return res.data.data.user;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async deleteEmployee(id) {
    try {
      await authAPI.delete(`/users/${id}`);
      return true;
    } catch (e) {
      throw handleAPIError(e);
    }
  }
};

export default employeeService;



