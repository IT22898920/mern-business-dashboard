import api from './api';

const interiorDesignerService = {
  // Get all interior designers with pagination and filters
  getAllDesigners: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.filter) queryParams.append('filter', params.filter);
    
    const response = await api.get(`/demo/interior-designers?${queryParams.toString()}`);
    return response.data;
  },

  // Get single designer by ID
  getDesignerById: async (id) => {
    const response = await api.get(`/demo/interior-designers/${id}`);
    return response.data;
  },

  // Create new interior designer
  createDesigner: async (designerData) => {
    const response = await api.post('/demo/interior-designers', designerData);
    return response.data;
  },

  // Update interior designer
  updateDesigner: async (id, designerData) => {
    const response = await api.put(`/demo/interior-designers/${id}`, designerData);
    return response.data;
  },

  // Delete interior designer
  deleteDesigner: async (id) => {
    const response = await api.delete(`/demo/interior-designers/${id}`);
    return response.data;
  },

  // Toggle designer active status
  toggleDesignerStatus: async (id) => {
    const response = await api.patch(`/demo/interior-designers/${id}/toggle-status`);
    return response.data;
  },

  // Get designer statistics
  getDesignerStats: async () => {
    const response = await api.get('/demo/interior-designers/stats/overview');
    return response.data;
  },

  // Update designer profile (for designers themselves)
  updateProfile: async (id, profileData) => {
    const response = await api.put(`/interior-designers/${id}/profile`, profileData);
    return response.data;
  },

  // Update designer portfolio
  updatePortfolio: async (id, portfolioData) => {
    const response = await api.put(`/interior-designers/${id}/portfolio`, portfolioData);
    return response.data;
  },

  // Update designer availability
  updateAvailability: async (id, availability) => {
    const response = await api.patch(`/interior-designers/${id}/availability`, { availability });
    return response.data;
  }
};

export default interiorDesignerService;
