import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUsersByRole, 
  getUserStats, 
  deactivateUser, 
  activateUser, 
  unlockUser 
} from '../controllers/userController.js';
import { protect, adminOnly, staffOnly } from '../middleware/auth.js';
import {
  validateUpdateUser,
  validateMongoId,
  validateRole,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public user routes (authenticated users can access)
router.get('/profile/:id', validateMongoId, getUserById);

// Staff routes (admin and employee access)
router.use(staffOnly);
router.get('/role/:role', validateRole, getUsersByRole);

// Admin only routes
router.use(adminOnly);

// User management routes
router.get('/', validatePagination, getAllUsers);
router.get('/stats', getUserStats);
router.put('/:id', validateUpdateUser, updateUser);
router.delete('/:id', validateMongoId, deleteUser);

// User status management
router.put('/:id/deactivate', validateMongoId, deactivateUser);
router.put('/:id/activate', validateMongoId, activateUser);
router.put('/:id/unlock', validateMongoId, unlockUser);

export default router;