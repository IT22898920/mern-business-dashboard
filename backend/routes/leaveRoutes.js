import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin, requireStaff } from '../middleware/roleAuth.js';
import { applyLeave, listLeaves, reviewLeave, listMyLeaves } from '../controllers/leaveController.js';

const router = express.Router();

// Employee apply leave, and list my leaves
router.post('/apply', protect, requireStaff, applyLeave);
router.get('/me', protect, requireStaff, listMyLeaves);

// Admin manage leaves
router.get('/', protect, requireAdmin, listLeaves);
router.patch('/:id/review', protect, requireAdmin, reviewLeave);

export default router;


