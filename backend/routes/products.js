import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getInventoryStats,
  updateStock,
  getStockHistory,
  getStockMovementStats,
  createStockMovement,
  searchProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  bulkUpdateProducts,
  duplicateProduct,
  getSupplierProducts
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockUpdate
} from '../middleware/productValidation.js';
import { uploadProductImage } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/search', searchProducts);

// Protected routes - All authenticated users can view products
router.get('/', protect, getProducts);

// Specific routes must come BEFORE parameterized routes
router.get('/stats', protect, authorize(['admin', 'employee']), getProductStats);
router.get('/inventory-stats', protect, authorize(['admin', 'employee']), getInventoryStats);
router.get('/low-stock', protect, authorize(['admin', 'employee']), getLowStockProducts);
router.get('/out-of-stock', protect, authorize(['admin', 'employee']), getOutOfStockProducts);

// Supplier specific route - get products assigned to logged-in supplier
router.get('/supplier/my-products', protect, authorize(['supplier']), getSupplierProducts);

// Parameterized routes come AFTER specific routes
router.get('/:id', protect, getProduct);
router.get('/:id/stock-history', protect, authorize(['admin', 'employee']), getStockHistory);
router.get('/:id/stock-movement-stats', protect, authorize(['admin', 'employee']), getStockMovementStats);
router.post('/:id/stock-movements', protect, authorize(['admin', 'employee']), createStockMovement);

// Admin and Employee routes - Can manage products
router.post('/', 
  protect, 
  authorize(['admin', 'employee']), 
  validateCreateProduct, 
  createProduct
);

router.put('/:id', 
  protect, 
  authorize(['admin', 'employee']), 
  validateUpdateProduct, 
  updateProduct
);

router.delete('/:id', 
  protect, 
  authorize(['admin', 'employee']), 
  deleteProduct
);

router.patch('/:id/stock', 
  protect, 
  authorize(['admin', 'employee']), 
  validateStockUpdate, 
  updateStock
);

router.post('/bulk-update', 
  protect, 
  authorize(['admin', 'employee']), 
  bulkUpdateProducts
);

router.post('/:id/duplicate', 
  protect, 
  authorize(['admin', 'employee']), 
  duplicateProduct
);

// Image upload route
router.post('/upload-image', protect, authorize(['admin', 'employee']), async (req, res) => {
  try {
    const { imageData, alt_text = '' } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadProductImage(imageData);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
        alt_text: alt_text,
        is_primary: false,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

export default router;