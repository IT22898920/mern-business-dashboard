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
  unlockUser, 
  createEmployee 
} from '../controllers/userController.js';
import { protect, adminOnly, staffOnly } from '../middleware/auth.js';
import {
  validateUpdateUser,
  validateMongoId,
  validateRole,
  validatePagination
} from '../middleware/validation.js';
import { body } from 'express-validator';

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
router.post('/', [
  body('name').isString().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isString()
], createEmployee);
router.put('/:id', validateUpdateUser, updateUser);
router.delete('/:id', validateMongoId, deleteUser);

// User status management
router.put('/:id/deactivate', validateMongoId, deactivateUser);
router.put('/:id/activate', validateMongoId, activateUser);
router.put('/:id/unlock', validateMongoId, unlockUser);

export default router;