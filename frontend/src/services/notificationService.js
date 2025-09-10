import api from './api';

// Get notifications for a user
export const getNotifications = async (userEmail, options = {}) => {
  try {
    const { limit = 50, skip = 0, unreadOnly = false } = options;
    const response = await api.get(`/notifications/user/${userEmail}`, {
      params: { limit, skip, unreadOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get notification count for a user
export const getNotificationCount = async (userEmail) => {
  try {
    const response = await api.get(`/notifications/count/${userEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification count:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userEmail) => {
  try {
    const response = await api.put(`/notifications/read-all/${userEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/delete/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Create notification (for system use)
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/create', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
