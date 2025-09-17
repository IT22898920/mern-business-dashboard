import express from 'express';
import {
  getAllDesigners,
  getDesignerById,
  createDesigner,
  updateDesigner,
  deleteDesigner,
  toggleDesignerStatus,
  getDesignerStats
} from '../controllers/interiorDesignerController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { designerValidation, createDesignerValidation } from '../middleware/designerValidation.js';

const router = express.Router();

// @route   GET /api/interior-designers/stats/overview
// @desc    Get designer statistics
// @access  Private (Admin)
router.get('/stats/overview', protect, restrictTo('admin'), getDesignerStats);

// @route   GET /api/interior-designers
// @desc    Get all interior designers
// @access  Private (Admin)
router.get('/', protect, restrictTo('admin'), getAllDesigners);

// @route   GET /api/interior-designers/:id
// @desc    Get single interior designer
// @access  Private
router.get('/:id', protect, getDesignerById);

// @route   POST /api/interior-designers
// @desc    Create new interior designer
// @access  Private (Admin)
router.post('/', protect, restrictTo('admin'), createDesignerValidation, createDesigner);

// @route   PUT /api/interior-designers/:id
// @desc    Update interior designer
// @access  Private (Admin)
router.put('/:id', protect, restrictTo('admin'), designerValidation, updateDesigner);

// @route   PATCH /api/interior-designers/:id/toggle-status
// @desc    Toggle designer active status
// @access  Private (Admin)
router.patch('/:id/toggle-status', protect, restrictTo('admin'), toggleDesignerStatus);

// @route   DELETE /api/interior-designers/:id
// @desc    Delete interior designer
// @access  Private (Admin)
router.delete('/:id', protect, restrictTo('admin'), deleteDesigner);

export default router;
