import api from './api';

// Create client contact
export const createClientContact = async (contactData) => {
  try {
    const response = await api.post('/client-contacts/create', contactData);
    return response.data;
  } catch (error) {
    console.error('Error creating client contact:', error);
    throw error;
  }
};

// Get client contacts for a designer
export const getClientContacts = async (designerEmail) => {
  try {
    const response = await api.get(`/client-contacts/designer/${designerEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client contacts:', error);
    throw error;
  }
};

// Update client contact status
export const updateClientContactStatus = async (id, status) => {
  try {
    const response = await api.put(`/client-contacts/update/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating client contact status:', error);
    throw error;
  }
};

// Get client contact by ID
export const getClientContactById = async (id) => {
  try {
    const response = await api.get(`/client-contacts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client contact:', error);
    throw error;
  }
};

// Delete client contact
export const deleteClientContact = async (id) => {
  try {
    const response = await api.delete(`/client-contacts/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting client contact:', error);
    throw error;
  }
};
