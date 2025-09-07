import Notification from '../models/Notification.js';

// Create new notification
export const createNotification = async (req, res) => {
  try {
    const {
      recipientEmail,
      senderName,
      senderEmail,
      type,
      title,
      message,
      relatedDesignId,
      relatedClientContactId,
      priority = 'medium',
      metadata = {}
    } = req.body;

    const notification = new Notification({
      recipientEmail,
      senderName,
      senderEmail,
      type,
      title,
      message,
      relatedDesignId,
      relatedClientContactId,
      priority,
      metadata
    });

    await notification.save();

    res.status(201).json({
      status: 'success',
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    let query = { recipientEmail: userEmail };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedDesignId', 'projectName imageURL')
      .populate('relatedClientContactId', 'clientName clientEmail message')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await Notification.countDocuments({ recipientEmail: userEmail });
    const unreadCount = await Notification.countDocuments({ 
      recipientEmail: userEmail, 
      isRead: false 
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        totalCount,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const result = await Notification.updateMany(
      { recipientEmail: userEmail, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get notification count for a user
export const getNotificationCount = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const unreadCount = await Notification.countDocuments({ 
      recipientEmail: userEmail, 
      isRead: false 
    });

    res.status(200).json({
      status: 'success',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};
