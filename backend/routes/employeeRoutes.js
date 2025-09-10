import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listEmployees, createEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', protect, requireAdmin, listEmployees);
router.post('/', protect, requireAdmin, createEmployee);

export default router;


