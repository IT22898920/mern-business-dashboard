import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', protect, requireAdmin, listEmployees);
router.post('/', protect, requireAdmin, createEmployee);
router.put('/:id', protect, requireAdmin, updateEmployee);
router.delete('/:id', protect, requireAdmin, deleteEmployee);

export default router;


