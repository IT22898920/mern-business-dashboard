import api from './api';

export const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/categories?${queryString}`);
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category (using demo endpoint)
  createCategory: async (categoryData) => {
    const response = await api.post('/demo/categories', categoryData);
    return response.data;
  },

  // Update category (using demo endpoint)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/demo/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (using demo endpoint)
  deleteCategory: async (id) => {
    const response = await api.delete(`/demo/categories/${id}`);
    return response.data;
  },

  // Get category statistics (using demo endpoint)
  getCategoryStats: async () => {
    const response = await api.get('/demo/categories/stats');
    return response.data;
  },

  // Get subcategories
  getSubcategories: async (id) => {
    const response = await api.get(`/categories/${id}/subcategories`);
    return response.data;
  },

  // Get category tree (using demo endpoint)
  getCategoryTree: async () => {
    const response = await api.get('/demo/categories?tree=true');
    return response.data;
  }
};