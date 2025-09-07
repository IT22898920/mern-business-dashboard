import api from './api';

// Get all designs
export const getAllDesigns = async () => {
  try {
    const response = await api.get('/designs/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching designs:', error);
    throw error;
  }
};

// Get design by ID
export const getDesignById = async (id) => {
  try {
    const response = await api.get(`/designs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching design:', error);
    throw error;
  }
};

// Add new design (requires authentication)
export const addDesign = async (designData) => {
  try {
    const response = await api.post('/designs/add', designData);
    return response.data;
  } catch (error) {
    console.error('Error adding design:', error);
    throw error;
  }
};

// Update design (requires authentication)
export const updateDesign = async (id, designData) => {
  try {
    const response = await api.put(`/designs/update/${id}`, designData);
    return response.data;
  } catch (error) {
    console.error('Error updating design:', error);
    throw error;
  }
};

// Delete design (requires authentication)
export const deleteDesign = async (id) => {
  try {
    const response = await api.delete(`/designs/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting design:', error);
    throw error;
  }
};
