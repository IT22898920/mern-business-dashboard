import { userAPI, handleAPIError } from './api';

export const employeeService = {
  async listEmployees({ page = 1, limit = 10, search } = {}) {
    try {
      const res = await userAPI.getAllUsers({ page, limit, role: 'employee', search });
      return res.data.data;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async createEmployee(payload) {
    try {
      const res = await userAPI.createUser(payload);
      return res.data.data.user;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async updateEmployee(id, payload) {
    try {
      const res = await userAPI.updateUser(id, payload);
      return res.data.data.user;
    } catch (e) {
      throw handleAPIError(e);
    }
  },

  async deleteEmployee(id) {
    try {
      await userAPI.deleteUser(id);
      return true;
    } catch (e) {
      throw handleAPIError(e);
    }
  }
};

export default employeeService;



