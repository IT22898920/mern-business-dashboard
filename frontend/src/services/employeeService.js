import api from './api';

export const fetchEmployees = async (search = '') => {
  const response = await api.get(`/employees`, { params: { search } });
  return response.data.data.employees;
};

export const createEmployee = async (payload) => {
  const response = await api.post(`/employees`, payload);
  return response.data.data.employee;
};

export const updateEmployee = async (id, payload) => {
  const response = await api.put(`/employees/${id}`, payload);
  return response.data.data.employee;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};


