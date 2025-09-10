import api from './api';

export const fetchEmployees = async (search = '') => {
  const response = await api.get(`/employees`, { params: { search } });
  return response.data.data.employees;
};

export const createEmployee = async (payload) => {
  const response = await api.post(`/employees`, payload);
  return response.data.data.employee;
};


