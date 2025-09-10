import express from 'express';
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationCount
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create notification (public route for system notifications)
router.post('/create', createNotification);

// Get notifications for a user (protected route)
router.get('/user/:userEmail', protect, getNotifications);

// Get notification count for a user (protected route)
router.get('/count/:userEmail', protect, getNotificationCount);

// Mark notification as read (protected route)
router.put('/read/:id', protect, markAsRead);

// Mark all notifications as read for a user (protected route)
router.put('/read-all/:userEmail', protect, markAllAsRead);

// Delete notification (protected route)
router.delete('/delete/:id', protect, deleteNotification);

export default router;
