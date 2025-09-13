import express from 'express';
import { protect, adminOnly, staffOnly } from '../middleware/auth.js';
import {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveById
} from '../controllers/leaveController.js';

const router = express.Router();

// All leave routes require auth
router.use(protect);

// Employee endpoints
router.post('/', createLeaveRequest);
router.get('/me', getMyLeaveRequests);
router.get('/:id', getLeaveById);

// Admin endpoints
router.get('/', adminOnly, getAllLeaveRequests);
router.put('/:id/approve', adminOnly, approveLeaveRequest);
router.put('/:id/reject', adminOnly, rejectLeaveRequest);

export default router;



