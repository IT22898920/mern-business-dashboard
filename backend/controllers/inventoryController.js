import Product from '../models/Product.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../config/email.js';

// Get all products with inventory info
export const getInventoryOverview = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    supplier,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (supplier && supplier !== 'all') {
    filter.supplier = supplier;
  }

  // Build search query
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Execute query
  const products = await Product
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('category', 'name')
    .populate('supplier', 'name email role')
    .select('name sku stock price status supplier supplier_info category brand');

  const total = await Product.countDocuments(filter);

  // Get inventory statistics
  const stats = await getInventoryStats();

  res.json({
    status: 'success',
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      stats
    }
  });
});

// Get inventory statistics
const getInventoryStats = async () => {
  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    totalValue
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({
      'stock.track_inventory': true,
      $expr: { $lte: ['$stock.available', '$stock.low_stock_threshold'] }
    }),
    Product.countDocuments({
      'stock.track_inventory': true,
      'stock.available': { $lte: 0 }
    }),
    Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$stock.current', '$cost_price'] } } } }
    ])
  ]);

  return {
    totalProducts,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    totalInventoryValue: totalValue[0]?.total || 0
  };
};

// Adjust product stock
export const adjustStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, quantity, reason, supplier: supplierId } = req.body;

  if (!type || !quantity || !reason) {
    throw new AppError('Type, quantity, and reason are required', 400);
  }

  const validTypes = ['restock', 'adjustment', 'damaged', 'returned'];
  if (!validTypes.includes(type)) {
    throw new AppError('Invalid stock adjustment type', 400);
  }

  const product = await Product.findById(id).populate('supplier', 'name email');
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // If assigning a new supplier during restock
  if (type === 'restock' && supplierId && supplierId !== product.supplier?._id?.toString()) {
    const supplier = await User.findOne({ _id: supplierId, role: 'supplier' });
    if (!supplier) {
      throw new AppError('Invalid supplier selected', 400);
    }
    
    product.supplier = supplierId;
    product.supplier_info.name = supplier.name;
    product.supplier_info.contact = supplier.email;
  }

  // Add stock history and update stock
  await product.addStockHistory(type, quantity, reason, req.user._id);

  res.json({
    status: 'success',
    message: 'Stock adjusted successfully',
    data: {
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        supplier: product.supplier
      }
    }
  });
});

// Assign supplier to product
export const assignSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { supplierId, leadTime, minimumOrderQuantity } = req.body;

  if (!supplierId) {
    throw new AppError('Supplier ID is required', 400);
  }

  // Verify supplier exists and has supplier role
  const supplier = await User.findOne({ _id: supplierId, role: 'supplier' });
  if (!supplier) {
    throw new AppError('Invalid supplier or supplier not approved', 400);
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Update product with supplier information
  product.supplier = supplierId;
  product.supplier_info = {
    name: supplier.name,
    contact: supplier.email,
    lead_time: leadTime || 7,
    minimum_order_quantity: minimumOrderQuantity || 1
  };
  product.updated_by = req.user._id;

  await product.save();

  await product.populate('supplier', 'name email role');

  // Send email notification to supplier
  try {
    await sendSupplierAssignmentEmail(supplier, product, req.user);
    console.log(`✅ Supplier assignment email sent to: ${supplier.email}`);
  } catch (emailError) {
    console.error('❌ Failed to send supplier assignment email:', emailError);
    // Don't fail the request if email fails
  }

  res.json({
    status: 'success',
    message: 'Supplier assigned successfully and notification sent',
    data: {
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        supplier: product.supplier,
        supplier_info: product.supplier_info
      }
    }
  });
});

// Get all approved suppliers for assignment
export const getApprovedSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await User.find(
    { 
      role: 'supplier',
      isActive: true 
    },
    'name email phone createdAt'
  ).sort({ name: 1 });

  res.json({
    status: 'success',
    data: {
      suppliers
    }
  });
});

// Get stock history for a product
export const getStockHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const product = await Product.findById(id)
    .populate('stock_history.user', 'name email')
    .select('name sku stock_history');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Sort stock history by date (newest first) and paginate
  const stockHistory = product.stock_history
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice((page - 1) * limit, page * limit);

  const total = product.stock_history.length;

  res.json({
    status: 'success',
    data: {
      product: {
        name: product.name,
        sku: product.sku
      },
      stockHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get low stock alerts
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.find({
    'stock.track_inventory': true,
    $expr: { $lte: ['$stock.available', '$stock.low_stock_threshold'] }
  })
  .populate('category', 'name')
  .populate('supplier', 'name email')
  .select('name sku stock category supplier')
  .sort({ 'stock.available': 1 });

  res.json({
    status: 'success',
    data: {
      lowStockProducts,
      count: lowStockProducts.length
    }
  });
});

// Bulk stock adjustment
export const bulkStockAdjustment = asyncHandler(async (req, res) => {
  const { adjustments } = req.body; // Array of { productId, type, quantity, reason }

  if (!Array.isArray(adjustments) || adjustments.length === 0) {
    throw new AppError('Adjustments array is required', 400);
  }

  const results = [];
  const errors = [];

  for (const adjustment of adjustments) {
    try {
      const { productId, type, quantity, reason } = adjustment;
      
      const product = await Product.findById(productId);
      if (!product) {
        errors.push({ productId, error: 'Product not found' });
        continue;
      }

      await product.addStockHistory(type, quantity, reason, req.user._id);
      results.push({
        productId,
        name: product.name,
        sku: product.sku,
        previousStock: product.stock_history[product.stock_history.length - 1].previous_stock,
        newStock: product.stock.current,
        success: true
      });
    } catch (error) {
      errors.push({ 
        productId: adjustment.productId, 
        error: error.message 
      });
    }
  }

  res.json({
    status: 'success',
    message: `Bulk adjustment completed. ${results.length} successful, ${errors.length} failed.`,
    data: {
      successful: results,
      failed: errors,
      summary: {
        total: adjustments.length,
        successful: results.length,
        failed: errors.length
      }
    }
  });
});

// Email notification function for supplier assignment
const sendSupplierAssignmentEmail = async (supplier, product, admin) => {
  const subject = `Product Assignment - ${product.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Product Assignment Notification</h2>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">You have been assigned to supply a product</h3>
        <p><strong>Product Name:</strong> ${product.name}</p>
        <p><strong>SKU:</strong> ${product.sku}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        ${product.supplier_info?.lead_time ? `<p><strong>Expected Lead Time:</strong> ${product.supplier_info.lead_time} days</p>` : ''}
        ${product.supplier_info?.minimum_order_quantity ? `<p><strong>Minimum Order Quantity:</strong> ${product.supplier_info.minimum_order_quantity} units</p>` : ''}
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">Current Stock Status</h4>
        <p><strong>Available Stock:</strong> ${product.stock?.available || 0} units</p>
        <p><strong>Low Stock Threshold:</strong> ${product.stock?.low_stock_threshold || 0} units</p>
        ${product.stock?.available <= product.stock?.low_stock_threshold ? 
          '<p style="color: #dc2626; font-weight: bold;">⚠️ This product is currently low on stock and may need reordering soon!</p>' 
          : ''}
      </div>

      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #065f46;">What's Next?</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>You will receive reorder requests for this product when stock is low</li>
          <li>Log in to your supplier dashboard to view all assigned products</li>
          <li>Keep track of your inventory levels and delivery capabilities</li>
          <li>Respond promptly to reorder requests from the admin team</li>
        </ul>
      </div>

      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/supplier/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Supplier Dashboard
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
        <p><strong>Assigned by:</strong> ${admin.name} (${admin.email})</p>
        <p><strong>Date:</strong> ${new Date().toDateString()}</p>
        <p>If you have any questions about this assignment, please contact the admin team.</p>
      </div>
    </div>
  `;

  return sendEmail(supplier.email, subject, html);
};