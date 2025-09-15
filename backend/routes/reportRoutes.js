import express from 'express';
import { generateSupplierReport } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Generate suppliers PDF report
router.post('/suppliers', 
  protect,
  adminOnly,
  [
    body('title').notEmpty().withMessage('Report title is required'),
    body('summary').isObject().withMessage('Summary data is required'),
    body('suppliers').isArray().withMessage('Suppliers data must be an array')
  ],
  validateRequest,
  generateSupplierReport
);

export default router;