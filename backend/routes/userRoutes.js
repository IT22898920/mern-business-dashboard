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
  //unlockUser
} from '../controllers/userController.js';
import User from '../models/User.js';
import { protect, adminOnly, staffOnly } from '../middleware/auth.js';
import {
  validateUpdateUser,
  validateMongoId,
  validateRole,
  validatePagination
} from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// Debug routes (no auth required)
router.get('/debug/pdf', async (req, res) => {
  try {
    console.log('🚀 DEBUG: PDF generation function called');
    const suppliers = await User.find({ role: 'supplier' })
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')
      .sort({ createdAt: -1 });
    console.log('🚀 DEBUG: Found suppliers:', suppliers.length);
    console.log('🚀 DEBUG: Sample supplier:', suppliers[0] ? {
      name: suppliers[0].name,
      email: suppliers[0].email,
      companyName: suppliers[0].companyName
    } : 'None');
    
    res.json({ 
      message: 'PDF generation debug complete',
      supplierCount: suppliers.length,
      sampleSupplier: suppliers[0] ? suppliers[0].name : 'None'
    });
  } catch (error) {
    console.error('🚀 DEBUG: Error:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// Debug route to check suppliers (no auth required for testing)
router.get('/debug/suppliers', async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'supplier' }).select('name email role companyName phone');
    res.json({ count: suppliers.length, suppliers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;