import api from './api';

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get product statistics
  getProductStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    const response = await api.get('/products/inventory-stats');
    return response.data;
  },

  // Update stock
  updateStock: async (id, stockData) => {
    const response = await api.patch(`/products/${id}/stock`, stockData);
    return response.data;
  },

  // Get stock history
  getStockHistory: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products/${id}/stock-history?${queryString}`);
    return response.data;
  },

  // Get stock movement statistics
  getStockMovementStats: async (id, days = 30) => {
    const response = await api.get(`/products/${id}/stock-movement-stats?days=${days}`);
    return response.data;
  },

  // Create stock movement
  createStockMovement: async (id, movementData) => {
    const response = await api.post(`/products/${id}/stock-movements`, movementData);
    return response.data;
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await api.get(`/products/search?${queryString}`);
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  // Get out of stock products
  getOutOfStockProducts: async () => {
    const response = await api.get('/products/out-of-stock');
    return response.data;
  },

  // Bulk update products
  bulkUpdateProducts: async (productIds, updateData) => {
    const response = await api.post('/products/bulk-update', {
      productIds,
      updateData
    });
    return response.data;
  },

  // Duplicate product
  duplicateProduct: async (id) => {
    const response = await api.post(`/products/${id}/duplicate`);
    return response.data;
  },

  // Upload image to Cloudinary
  uploadImage: async (imageData, altText = '') => {
    const response = await api.post('/products/upload-image', {
      imageData,
      alt_text: altText
    });
    return response.data;
  }
};