import express from 'express';
import {
  demoGetCategories,
  demoGetCategoryStats,
  demoCreateCategory,
  demoUpdateCategory,
  demoDeleteCategory,
  demoGetDesigners,
  demoCreateDesigner,
  demoUpdateDesigner,
  demoDeleteDesigner,
  demoGetDesignerStats
} from '../controllers/demoAuthController.js';
import { hybridLogin, designerLogin } from '../controllers/hybridAuthController.js';

const router = express.Router();

// Hybrid Auth Routes (tries database first, then demo)
router.post('/auth/login', hybridLogin);

// Direct InteriorDesigner login (DB only)
router.post('/auth/login-designer', designerLogin);

// Demo Categories Routes  
router.get('/categories', demoGetCategories);
router.get('/categories/stats', demoGetCategoryStats);
router.post('/categories', demoCreateCategory);
router.put('/categories/:id', demoUpdateCategory);
router.delete('/categories/:id', demoDeleteCategory);

// Demo Interior Designer Routes
router.get('/interior-designers/stats/overview', demoGetDesignerStats);
router.get('/interior-designers', demoGetDesigners);
router.get('/interior-designers/:id', demoGetDesigners);
router.post('/interior-designers', demoCreateDesigner);
router.put('/interior-designers/:id', demoUpdateDesigner);
router.patch('/interior-designers/:id/toggle-status', demoUpdateDesigner);
router.delete('/interior-designers/:id', demoDeleteDesigner);

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