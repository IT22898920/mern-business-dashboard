import Product from '../models/Product.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../config/email.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

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

// Generate inventory reports
export const generateInventoryReport = asyncHandler(async (req, res) => {
  const { 
    type = 'inventory_summary', 
    format = 'pdf', 
    dateRange = 'last_30_days',
    startDate,
    endDate,
    includeOutOfStock = 'true',
    includeLowStock = 'true',
    includeSupplierInfo = 'true'
  } = req.query;

  // Calculate date range
  let dateFilter = {};
  const now = new Date();
  
  switch (dateRange) {
    case 'today':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lte: now
        }
      };
      break;
    case 'last_7_days':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lte: now
        }
      };
      break;
    case 'last_30_days':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          $lte: now
        }
      };
      break;
    case 'last_90_days':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          $lte: now
        }
      };
      break;
    case 'last_year':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
          $lte: now
        }
      };
      break;
    case 'custom':
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      }
      break;
  }

  // Build query based on report type
  let query = { ...dateFilter };
  let selectFields = 'name sku stock price category brand supplier supplier_info createdAt updatedAt';

  switch (type) {
    case 'inventory_summary':
      // Include all products for summary report
      break;
    case 'low_stock':
      query.$expr = { 
        $and: [
          { $lte: ['$stock.available', '$stock.low_stock_threshold'] },
          { $gt: ['$stock.available', 0] }
        ]
      };
      break;
    case 'out_of_stock':
      query['stock.available'] = { $lte: 0 };
      break;
    case 'stock_valuation':
      selectFields += ' cost';
      break;
    case 'supplier_analysis':
      selectFields += ' supplier';
      break;
    case 'stock_movement':
      selectFields += ' stock_history';
      break;
  }

  // Fetch data
  let populateOptions = [{ path: 'category', select: 'name' }];
  if (includeSupplierInfo === 'true') {
    populateOptions.push({ path: 'supplier', select: 'name email phone' });
  }

  console.log('Query for products:', query);
  console.log('Report type:', type);
  
  const products = await Product.find(query)
    .populate(populateOptions)
    .select(selectFields)
    .sort({ name: 1 });

  console.log('Products found:', products.length);

  // Filter products based on stock conditions
  let filteredProducts = products;
  if (includeOutOfStock === 'false') {
    filteredProducts = filteredProducts.filter(p => p.stock && p.stock.available > 0);
  }
  if (includeLowStock === 'false') {
    filteredProducts = filteredProducts.filter(p => p.stock && p.stock.available > (p.stock.low_stock_threshold || 0));
  }

  console.log('Filtered products:', filteredProducts.length);

  // Generate report based on format
  const reportData = {
    title: getReportTitle(type),
    generatedAt: new Date(),
    dateRange: dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange.replace('_', ' '),
    products: filteredProducts,
    summary: {
      totalProducts: filteredProducts.length,
      totalValue: filteredProducts.reduce((sum, p) => {
        const stock = p.stock?.available || p.stock?.current || 0;
        return sum + (stock * p.price);
      }, 0),
      outOfStock: filteredProducts.filter(p => {
        const stock = p.stock?.available || p.stock?.current || 0;
        return stock <= 0;
      }).length,
      lowStock: filteredProducts.filter(p => {
        const stock = p.stock?.available || p.stock?.current || 0;
        const threshold = p.stock?.low_stock_threshold || 10;
        return stock <= threshold && stock > 0;
      }).length
    }
  };

  console.log('Report data summary:', reportData.summary);

  switch (format) {
    case 'pdf':
      return generatePDFReport(reportData, res);
    case 'excel':
      return generateExcelReport(reportData, res);
    case 'csv':
      return generateCSVReport(reportData, res);
    default:
      throw new AppError('Invalid format specified', 400);
  }
});

// Helper functions for report generation
const getReportTitle = (type) => {
  const titles = {
    inventory_summary: 'Inventory Summary Report',
    low_stock: 'Low Stock Report',
    out_of_stock: 'Out of Stock Report',
    stock_valuation: 'Stock Valuation Report',
    supplier_analysis: 'Supplier Analysis Report',
    stock_movement: 'Stock Movement Report'
  };
  return titles[type] || 'Inventory Report';
};

const generatePDFReport = (data, res) => {
  console.log('🎨 Creating Beautiful Professional PDF Report...');
  
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="beautiful_inventory_report_${new Date().toISOString().split('T')[0]}.pdf"`);
  
  doc.pipe(res);

  // Beautiful Professional Colors
  const blue = '#2563eb';
  const darkBlue = '#1e40af';
  const green = '#10b981';
  const orange = '#f59e0b';
  const red = '#ef4444';
  const gray = '#6b7280';
  const lightGray = '#f9fafb';

  // STUNNING HEADER with Blue Background
  doc.rect(0, 0, 612, 100).fill(blue);
  
  // White Logo Circle
  doc.circle(100, 50, 25).fill('white');
  doc.fill(blue).fontSize(20).font('Helvetica-Bold').text('📊', 92, 42);

  // Beautiful Company Name
  doc.fill('white').fontSize(24).font('Helvetica-Bold')
     .text('BUSINESSPRO ANALYTICS', 150, 30);
  doc.fontSize(12).text('Professional Business Intelligence', 150, 55);

  // Report Title
  doc.fill('#1f2937').fontSize(20).font('Helvetica-Bold')
     .text(data.title, 50, 120);
     
  // Date and Info
  doc.fill(gray).fontSize(10)
     .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 150)
     .text(`Total Products: ${data.summary.totalProducts} | Value: $${data.summary.totalValue.toFixed(2)}`, 50, 165);

  // Beautiful Colored Line
  doc.rect(50, 180, 512, 3).fill(blue);

  let yPos = 200;
  
  // EXECUTIVE SUMMARY with Colored Cards
  doc.fill('#1f2937').fontSize(16).font('Helvetica-Bold')
     .text('📈 EXECUTIVE SUMMARY', 50, yPos);
  
  yPos += 30;
  
  // Beautiful Summary Cards
  const cards = [
    { label: 'Total Items', value: data.summary.totalProducts.toString(), color: blue },
    { label: 'Total Value', value: `$${data.summary.totalValue.toFixed(2)}`, color: green },
    { label: 'Low Stock', value: data.summary.lowStock.toString(), color: orange },
    { label: 'Out of Stock', value: data.summary.outOfStock.toString(), color: red }
  ];

  cards.forEach((card, index) => {
    const x = 50 + (index * 125);
    
    // Beautiful Card with Border
    doc.rect(x, yPos, 110, 60).fill(lightGray).stroke(card.color).lineWidth(2);
    
    // Card Content
    doc.fill(card.color).fontSize(18).font('Helvetica-Bold')
       .text(card.value, x + 10, yPos + 15);
    doc.fill(gray).fontSize(9).font('Helvetica')
       .text(card.label, x + 10, yPos + 40);
  });

  yPos += 80;

  // BEAUTIFUL TABLE
  doc.fill('#1f2937').fontSize(16).font('Helvetica-Bold')
     .text('📋 PRODUCT INVENTORY', 50, yPos);
  
  yPos += 30;

  // Table Header with Dark Blue Background
  doc.rect(50, yPos, 512, 25).fill(darkBlue);
  
  // Header Text
  doc.fill('white').fontSize(11).font('Helvetica-Bold')
     .text('Product Name', 60, yPos + 8)
     .text('SKU', 200, yPos + 8)
     .text('Category', 280, yPos + 8)
     .text('Stock', 360, yPos + 8)
     .text('Price', 420, yPos + 8)
     .text('Status', 480, yPos + 8);

  yPos += 25;

  // Beautiful Table Rows
  data.products.forEach((product, index) => {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
      
      // Repeat header
      doc.rect(50, yPos, 512, 25).fill(darkBlue);
      doc.fill('white').fontSize(11).font('Helvetica-Bold')
         .text('Product Name', 60, yPos + 8)
         .text('SKU', 200, yPos + 8)
         .text('Category', 360, yPos + 8)
         .text('Stock', 420, yPos + 8)
         .text('Price', 480, yPos + 8);
      yPos += 25;
    }

    // Alternating row colors
    const rowColor = index % 2 === 0 ? 'white' : lightGray;
    doc.rect(50, yPos, 512, 20).fill(rowColor).stroke('#e5e7eb');

    const stock = product.stock?.available || product.stock?.current || 0;
    const threshold = product.stock?.low_stock_threshold || 10;
    
    // Row content with beautiful formatting
    doc.fill('#1f2937').fontSize(9).font('Helvetica')
       .text(product.name.length > 18 ? product.name.substring(0, 18) + '...' : product.name, 60, yPos + 6)
       .fill(gray).text(product.sku, 200, yPos + 6)
       .fill('#1f2937').text(product.category?.name || 'N/A', 280, yPos + 6);
    
    // Stock with color coding
    const stockColor = stock <= 0 ? red : stock <= threshold ? orange : green;
    doc.fill(stockColor).font('Helvetica-Bold')
       .text(stock.toString(), 360, yPos + 6);
    
    doc.fill('#1f2937').font('Helvetica')
       .text(`$${product.price.toFixed(2)}`, 420, yPos + 6);
    
    // Status with color
    const status = stock <= 0 ? 'OUT' : stock <= threshold ? 'LOW' : 'OK';
    doc.fill(stockColor).font('Helvetica-Bold')
       .text(status, 480, yPos + 6);

    yPos += 20;
  });

  // BEAUTIFUL FOOTER
  yPos += 20;
  if (yPos > 720) {
    doc.addPage();
    yPos = 50;
  }

  doc.rect(50, yPos, 512, 2).fill(blue);
  yPos += 15;

  doc.fill(gray).fontSize(8)
     .text(`Generated: ${new Date().toLocaleString()} | BusinessPro Analytics Suite`, 50, yPos)
     .text('© 2025 BusinessPro - Professional Business Intelligence', 50, yPos + 12);

  doc.end();
};

// Helper function for product status
const getProductStatusForPDF = (product) => {
  if (!product.stock?.track_inventory) return 'Not Tracked';
  
  const available = product.stock?.available || product.stock?.current || 0;
  const threshold = product.stock?.low_stock_threshold || 10;
  
  if (available <= 0) return 'Out of Stock';
  else if (available <= threshold) return 'Low Stock';
  else return 'In Stock';
};

const generateExcelReport = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventory Report');

  // Set headers
  worksheet.columns = [
    { header: 'Product Name', key: 'name', width: 30 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Stock Available', key: 'stock', width: 15 },
    { header: 'Low Stock Threshold', key: 'threshold', width: 18 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Value', key: 'value', width: 15 },
    { header: 'Supplier', key: 'supplier', width: 25 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  // Add data
  data.products.forEach(product => {
    const stockStatus = product.stock.available <= 0 ? 'Out of Stock' :
                       product.stock.available <= product.stock.low_stock_threshold ? 'Low Stock' : 'In Stock';
    
    worksheet.addRow({
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'N/A',
      stock: product.stock.available,
      threshold: product.stock.low_stock_threshold,
      price: product.price,
      value: product.stock.available * product.price,
      supplier: product.supplier?.name || 'No Supplier',
      status: stockStatus
    });
  });

  // Summary section
  worksheet.addRow({});
  worksheet.addRow({ name: 'SUMMARY' });
  worksheet.addRow({ name: 'Total Products', sku: data.summary.totalProducts });
  worksheet.addRow({ name: 'Total Value', sku: `$${data.summary.totalValue.toFixed(2)}` });
  worksheet.addRow({ name: 'Out of Stock Items', sku: data.summary.outOfStock });
  worksheet.addRow({ name: 'Low Stock Items', sku: data.summary.lowStock });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${new Date().toISOString().split('T')[0]}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
};

const generateCSVReport = (data, res) => {
  const csvData = data.products.map(product => ({
    'Product Name': product.name,
    'SKU': product.sku,
    'Category': product.category?.name || 'N/A',
    'Stock Available': product.stock.available,
    'Low Stock Threshold': product.stock.low_stock_threshold,
    'Price': product.price,
    'Total Value': product.stock.available * product.price,
    'Supplier': product.supplier?.name || 'No Supplier',
    'Supplier Email': product.supplier?.email || 'N/A',
    'Status': product.stock.available <= 0 ? 'Out of Stock' :
             product.stock.available <= product.stock.low_stock_threshold ? 'Low Stock' : 'In Stock'
  }));

  const parser = new Parser();
  const csv = parser.parse(csvData);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
};