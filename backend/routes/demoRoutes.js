import express from 'express';
import {
  demoLogin,
  demoGetCategories,
  demoGetCategoryStats,
  demoCreateCategory,
  demoUpdateCategory,
  demoDeleteCategory
} from '../controllers/demoAuthController.js';

const router = express.Router();

// Demo Auth Routes (demo users only)
router.post('/auth/login', demoLogin);

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