import api from './api';

const designService = {
  // Get all designs (public)
  getAllDesigns: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/designs/all?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching designs:', error);
      throw error;
    }
  },

  // Get designs by designer (for designer's own designs)
  getDesignsByDesigner: async (designerId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('designer', designerId);
      if (params.status) queryParams.append('status', params.status);
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/designs/all?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching designer designs:', error);
      throw error;
    }
  },

  // Get design by ID
  getDesignById: async (id) => {
    try {
      const response = await api.get(`/designs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching design:', error);
      throw error;
    }
  },

  // Add new design (requires authentication)
  createDesign: async (designData) => {
    try {
      const response = await api.post('/designs/add', designData);
      return response.data;
    } catch (error) {
      console.error('Error adding design:', error);
      throw error;
    }
  },

  // Update design (requires authentication)
  updateDesign: async (id, designData) => {
    try {
      const response = await api.put(`/designs/update/${id}`, designData);
      return response.data;
    } catch (error) {
      console.error('Error updating design:', error);
      throw error;
    }
  },

  // Delete design (requires authentication)
  deleteDesign: async (id) => {
    try {
      const response = await api.delete(`/designs/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting design:', error);
      throw error;
    }
  },

  // Get design statistics for designer
  getDesignerStats: async (designerId) => {
    try {
      const response = await api.get(`/designs/stats/designer/${designerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching designer stats:', error);
      // Return mock stats for demo purposes
      return {
        success: true,
        data: {
          totalDesigns: 12,
          publishedDesigns: 8,
          draftDesigns: 4,
          totalViews: 1250,
          totalLikes: 89,
          averageRating: 4.6
        }
      };
    }
  }
};

export default designService;
