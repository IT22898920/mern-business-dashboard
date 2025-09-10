import api from './api';

export const applyLeave = async (payload) => {
  const response = await api.post(`/leaves/apply`, payload);
  return response.data.data.leave;
};

export const fetchMyLeaves = async () => {
  const response = await api.get(`/leaves/me`);
  return response.data.data.leaves;
};

export const fetchAllLeaves = async (params = {}) => {
  const response = await api.get(`/leaves`, { params });
  return response.data.data.leaves;
};

export const reviewLeave = async (id, action) => {
  const response = await api.patch(`/leaves/${id}/review`, { action });
  return response.data.data.leave;
};


