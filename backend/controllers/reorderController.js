import ReorderRequest from '../models/ReorderRequest.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendEmail } from '../config/email.js';

// Create reorder request (Admin only)
export const createReorderRequest = async (req, res) => {
  try {
    const { productId, supplierId, quantity, urgency, message, expectedDeliveryDate } = req.body;
    const adminId = req.user._id;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Validate supplier exists and is actually a supplier
    const supplier = await User.findOne({ _id: supplierId, role: 'supplier' });
    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found or user is not a supplier'
      });
    }

    // Create reorder request
    const reorderRequest = await ReorderRequest.create({
      product: productId,
      supplier: supplierId,
      requestedBy: adminId,
      quantity,
      urgency: urgency || 'medium',
      message,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined
    });

    // Send email notification to supplier
    try {
      await sendSupplierNotificationEmail(supplier, product, reorderRequest, req.user);
    } catch (emailError) {
      console.error('Failed to send supplier notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Reorder request created and supplier notified',
      data: reorderRequest
    });
  } catch (error) {
    console.error('Create reorder request error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create reorder request'
    });
  }
};

// Get all reorder requests (Admin view)
export const getAllReorderRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      urgency,
      supplierId,
      productId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (urgency && urgency !== 'all') filter.urgency = urgency;
    if (supplierId) filter.supplier = supplierId;
    if (productId) filter.product = productId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const reorderRequests = await ReorderRequest
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReorderRequest.countDocuments(filter);

    // Get statistics
    const stats = await ReorderRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      status: 'success',
      data: {
        reorderRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats: statsObj
      }
    });
  } catch (error) {
    console.error('Get reorder requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reorder requests'
    });
  }
};

// Get supplier's reorder requests (Supplier view)
export const getSupplierReorderRequests = async (req, res) => {
  try {
    const supplierId = req.user._id;
    const {
      page = 1,
      limit = 10,
      status,
      urgency,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { supplier: supplierId };
    if (status && status !== 'all') filter.status = status;
    if (urgency && urgency !== 'all') filter.urgency = urgency;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const reorderRequests = await ReorderRequest
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReorderRequest.countDocuments(filter);

    // Get supplier stats
    const stats = await ReorderRequest.getSupplierStats(supplierId);

    res.json({
      status: 'success',
      data: {
        reorderRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get supplier reorder requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reorder requests'
    });
  }
};

// Update reorder request status
export const updateReorderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, estimatedPrice, estimatedDelivery } = req.body;
    const userId = req.user._id;

    const reorderRequest = await ReorderRequest.findById(id);
    if (!reorderRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Reorder request not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'employee';
    const isSupplier = req.user.role === 'supplier' && reorderRequest.supplier._id.toString() === userId.toString();
    
    if (!isAdmin && !isSupplier) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this request'
      });
    }

    // Update supplier response if supplier is updating
    if (isSupplier && ['acknowledged', 'in_progress', 'shipped'].includes(status)) {
      reorderRequest.supplierResponse = {
        message,
        estimatedPrice,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        respondedAt: new Date()
      };
    }

    // Update status with timeline entry
    await reorderRequest.updateStatus(status, userId, message);

    // Send notification emails
    try {
      if (isSupplier) {
        // Notify admin of supplier response
        const admin = await User.findById(reorderRequest.requestedBy._id);
        if (admin) {
          await sendAdminNotificationEmail(admin, reorderRequest, req.user);
        }
      } else if (isAdmin && status === 'delivered') {
        // Notify supplier of delivery confirmation
        const supplier = await User.findById(reorderRequest.supplier._id);
        if (supplier) {
          await sendSupplierDeliveryConfirmationEmail(supplier, reorderRequest, req.user);
        }
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    res.json({
      status: 'success',
      message: 'Reorder request updated successfully',
      data: reorderRequest
    });
  } catch (error) {
    console.error('Update reorder status error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update reorder request'
    });
  }
};

// Add note to reorder request
export const addReorderNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const reorderRequest = await ReorderRequest.findById(id);
    if (!reorderRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Reorder request not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'employee';
    const isSupplier = req.user.role === 'supplier' && reorderRequest.supplier._id.toString() === userId.toString();
    
    if (!isAdmin && !isSupplier) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to add notes to this request'
      });
    }

    // Add note
    reorderRequest.notes.push({
      user: userId,
      message
    });

    // Add timeline entry
    await reorderRequest.addTimelineEntry('note_added', userId, `Added note: ${message.substring(0, 50)}...`);

    res.json({
      status: 'success',
      message: 'Note added successfully',
      data: reorderRequest
    });
  } catch (error) {
    console.error('Add reorder note error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to add note'
    });
  }
};

// Get reorder request details
export const getReorderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reorderRequest = await ReorderRequest.findById(id);
    if (!reorderRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Reorder request not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'employee';
    const isSupplier = req.user.role === 'supplier' && reorderRequest.supplier._id.toString() === userId.toString();
    
    if (!isAdmin && !isSupplier) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this request'
      });
    }

    res.json({
      status: 'success',
      data: reorderRequest
    });
  } catch (error) {
    console.error('Get reorder request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reorder request'
    });
  }
};

// Email notification functions
const sendSupplierNotificationEmail = async (supplier, product, reorderRequest, admin) => {
  const subject = `New Stock Reorder Request - ${product.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Stock Reorder Request</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">Product Details</h3>
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>SKU:</strong> ${product.sku}</p>
        <p><strong>Requested Quantity:</strong> ${reorderRequest.quantity} units</p>
        <p><strong>Urgency:</strong> <span style="text-transform: uppercase; color: ${getUrgencyColor(reorderRequest.urgency)}">${reorderRequest.urgency}</span></p>
        ${reorderRequest.expectedDeliveryDate ? `<p><strong>Expected Delivery:</strong> ${reorderRequest.expectedDeliveryDate.toDateString()}</p>` : ''}
      </div>

      ${reorderRequest.message ? `
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Additional Message</h4>
          <p style="margin: 0;">${reorderRequest.message}</p>
        </div>
      ` : ''}

      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #065f46;">Next Steps</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Log in to your supplier dashboard to view the full request</li>
          <li>Update the request status and provide estimated delivery time</li>
          <li>Add any notes or questions about the order</li>
        </ul>
      </div>

      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/supplier/reorders" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Request in Dashboard
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
        <p><strong>Requested by:</strong> ${admin.name} (${admin.email})</p>
        <p><strong>Request ID:</strong> ${reorderRequest._id}</p>
        <p><strong>Date:</strong> ${reorderRequest.createdAt.toDateString()}</p>
      </div>
    </div>
  `;

  return sendEmail(supplier.email, subject, html);
};

const sendAdminNotificationEmail = async (admin, reorderRequest, supplier) => {
  const subject = `Supplier Response - ${reorderRequest.product.name} Reorder Request`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Supplier Response Received</h2>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">Request Update</h3>
        <p><strong>Product:</strong> ${reorderRequest.product.name}</p>
        <p><strong>Supplier:</strong> ${supplier.name}</p>
        <p><strong>Status:</strong> <span style="text-transform: uppercase; color: #059669">${reorderRequest.status}</span></p>
        <p><strong>Quantity:</strong> ${reorderRequest.quantity} units</p>
      </div>

      ${reorderRequest.supplierResponse ? `
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #374151;">Supplier Response</h4>
          ${reorderRequest.supplierResponse.message ? `<p><strong>Message:</strong> ${reorderRequest.supplierResponse.message}</p>` : ''}
          ${reorderRequest.supplierResponse.estimatedPrice ? `<p><strong>Estimated Price:</strong> $${reorderRequest.supplierResponse.estimatedPrice}</p>` : ''}
          ${reorderRequest.supplierResponse.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${reorderRequest.supplierResponse.estimatedDelivery.toDateString()}</p>` : ''}
        </div>
      ` : ''}

      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/admin/reorders/${reorderRequest._id}" 
           style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Full Request
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
        <p><strong>Request ID:</strong> ${reorderRequest._id}</p>
        <p><strong>Updated:</strong> ${new Date().toDateString()}</p>
      </div>
    </div>
  `;

  return sendEmail(admin.email, subject, html);
};

const sendSupplierDeliveryConfirmationEmail = async (supplier, reorderRequest, admin) => {
  const subject = `Delivery Confirmed - ${reorderRequest.product.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Delivery Confirmed</h2>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">Order Completed</h3>
        <p><strong>Product:</strong> ${reorderRequest.product.name}</p>
        <p><strong>Quantity:</strong> ${reorderRequest.quantity} units</p>
        <p><strong>Delivery Date:</strong> ${new Date().toDateString()}</p>
      </div>

      <p>Thank you for fulfilling this reorder request. The delivery has been confirmed and the inventory has been updated.</p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
        <p><strong>Confirmed by:</strong> ${admin.name}</p>
        <p><strong>Request ID:</strong> ${reorderRequest._id}</p>
      </div>
    </div>
  `;

  return sendEmail(supplier.email, subject, html);
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'urgent': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#d97706';
    case 'low': return '#16a34a';
    default: return '#6b7280';
  }
};