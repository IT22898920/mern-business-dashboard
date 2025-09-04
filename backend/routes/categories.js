import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getSubcategories
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import { body } from 'express-validator';

const router = express.Router();

// Category validation middleware
const validateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  body('image.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),

  body('meta.title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Meta title cannot exceed 200 characters')
    .trim(),

  body('meta.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Meta description cannot exceed 500 characters')
    .trim(),

  body('meta.keywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array')
];

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/subcategories', getSubcategories);

// Protected routes
router.get('/admin/stats', protect, authorize(['admin', 'employee']), getCategoryStats);

// Admin and Employee routes
router.post('/', 
  protect, 
  authorize(['admin', 'employee']), 
  validateCategory, 
  createCategory
);

router.put('/:id', 
  protect, 
  authorize(['admin', 'employee']), 
  validateCategory, 
  updateCategory
);

router.delete('/:id', 
  protect, 
  authorize(['admin', 'employee']), 
  deleteCategory
);

export default router;