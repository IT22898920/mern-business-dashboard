import express from 'express';
import {
  createReorderRequest,
  getAllReorderRequests,
  getSupplierReorderRequests,
  updateReorderStatus,
  addReorderNote,
  getReorderRequest
} from '../controllers/reorderController.js';
import { protect, restrictTo, staffOnly, supplierOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin/Staff routes
router.post('/', staffOnly, createReorderRequest);
router.get('/', staffOnly, getAllReorderRequests);
router.get('/admin/all', staffOnly, getAllReorderRequests);
router.get('/:id', getReorderRequest);
router.patch('/:id/status', updateReorderStatus);
router.post('/:id/notes', addReorderNote);

// Supplier-specific routes
router.get('/supplier/my-requests', supplierOnly, getSupplierReorderRequests);

export default router;