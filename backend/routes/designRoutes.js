import express from 'express';
import {
  addDesign,
  getAllDesigns,
  getDesignById,
  updateDesign,
  deleteDesign
} from '../controllers/designController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes with authentication
router.post('/add', protect, addDesign);
router.get('/all', optionalAuth, getAllDesigns); // Public viewing with optional auth
router.get('/:id', optionalAuth, getDesignById); // Public viewing with optional auth
router.put('/update/:id', protect, updateDesign);
router.delete('/delete/:id', protect, deleteDesign);

export default router;
