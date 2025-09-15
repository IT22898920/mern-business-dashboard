import express from 'express';
import { 
  getInventoryOverview,
  adjustStock,
  assignSupplier,
  getApprovedSuppliers,
  getStockHistory,
  getLowStockAlerts,
  bulkStockAdjustment,
  generateInventoryReport
} from '../controllers/inventoryController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All inventory routes require authentication and admin/employee role
router.use(protect);
router.use(restrictTo('admin', 'employee'));

// GET /api/inventory - Get inventory overview
router.get('/', getInventoryOverview);

// GET /api/inventory/low-stock - Get low stock alerts
router.get('/low-stock', getLowStockAlerts);

// GET /api/inventory/suppliers - Get approved suppliers
router.get('/suppliers', getApprovedSuppliers);

// GET /api/inventory/:id/history - Get stock history for product
router.get('/:id/history', getStockHistory);

// PUT /api/inventory/:id/adjust - Adjust stock for product
router.put('/:id/adjust', adjustStock);

// PUT /api/inventory/:id/supplier - Assign supplier to product
router.put('/:id/supplier', assignSupplier);

// POST /api/inventory/bulk-adjust - Bulk stock adjustment
router.post('/bulk-adjust', bulkStockAdjustment);

// GET /api/inventory/reports/generate - Generate inventory reports
router.get('/reports/generate', generateInventoryReport);

export default router;