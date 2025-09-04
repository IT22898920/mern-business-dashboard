import express from 'express';
import {
  demoGetCategories,
  demoGetCategoryStats,
  demoCreateCategory,
  demoUpdateCategory,
  demoDeleteCategory
} from '../controllers/demoAuthController.js';
import { hybridLogin } from '../controllers/hybridAuthController.js';

const router = express.Router();

// Hybrid Auth Routes (tries database first, then demo)
router.post('/auth/login', hybridLogin);

// Demo Categories Routes  
router.get('/categories', demoGetCategories);
router.get('/categories/stats', demoGetCategoryStats);
router.post('/categories', demoCreateCategory);
router.put('/categories/:id', demoUpdateCategory);
router.delete('/categories/:id', demoDeleteCategory);

// Demo health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Demo API is running',
    timestamp: new Date().toISOString(),
    note: 'Running in demo mode without database'
  });
});

export default router;