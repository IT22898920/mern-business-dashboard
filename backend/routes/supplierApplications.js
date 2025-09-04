import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  submitApplication,
  getMyApplication,
  updateMyApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats
} from '../controllers/supplierApplicationController.js';

const router = express.Router();

// User routes (protected)
router.use(protect); // All routes require authentication

// User application routes
router.post('/apply', submitApplication);
router.get('/my-application', getMyApplication);
router.put('/my-application', updateMyApplication);

// Admin only routes
router.get('/stats', adminOnly, getApplicationStats);
router.get('/', adminOnly, getAllApplications);
router.get('/:id', adminOnly, getApplicationById);
router.put('/:id/status', adminOnly, updateApplicationStatus);
router.delete('/:id', adminOnly, deleteApplication);

export default router;