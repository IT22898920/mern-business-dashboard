import express from 'express';
import {
  addDesign,
  getAllDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
  getMyDesigns
} from '../controllers/designController.js';
import { protect, optionalAuth, designerOnly } from '../middleware/auth.js';

const router = express.Router();

// Routes with authentication
router.post('/add', protect, addDesign);
router.get('/all', optionalAuth, getAllDesigns); // Public viewing with optional auth
router.get('/mine', protect, designerOnly, getMyDesigns);
router.get('/:id', optionalAuth, getDesignById); // Public viewing with optional auth
router.put('/update/:id', protect, updateDesign);
router.delete('/delete/:id', protect, deleteDesign);

export default router;
