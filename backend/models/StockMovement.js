import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  
  // Movement details
  type: {
    type: String,
    enum: [
      'adjustment_in',      // Manual stock increase
      'adjustment_out',     // Manual stock decrease
      'sale',              // Stock sold
      'purchase',          // Stock purchased/received
      'return_in',         // Customer return (stock back in)
      'return_out',        // Return to supplier (stock out)
      'damage_loss',       // Damaged/Lost items
      'transfer_in',       // Transfer from another location
      'transfer_out',      // Transfer to another location
      'inventory_count',   // Inventory count adjustment
      'production_in',     // Manufactured items
      'production_out',    // Raw materials used
      'initial_stock'      // Initial stock entry
    ],
    required: true
  },
  
  // Quantity details
  quantity: {
    type: Number,
    required: true
  },
  
  previous_stock: {
    type: Number,
    required: true,
    min: 0
  },
  
  new_stock: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Cost information
  unit_cost: {
    type: Number,
    default: 0
  },
  
  total_cost: {
    type: Number,
    default: 0
  },
  
  // Reference information
  reference_type: {
    type: String,
    enum: ['order', 'purchase', 'adjustment', 'transfer', 'return', 'other'],
    default: 'other'
  },
  
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  reference_number: {
    type: String,
    default: null
  },
  
  // Reason and notes
  reason: {
    type: String,
    enum: [
      'stock_received',
      'stock_sold',
      'damaged_goods',
      'theft_loss',
      'inventory_count',
      'return_refund',
      'supplier_return',
      'transfer',
      'production',
      'initial_setup',
      'manual_adjustment',
      'system_correction',
      'expired_goods',
      'quality_issue',
      'other'
    ],
    default: 'other'
  },
  
  notes: {
    type: String,
    maxlength: 500
  },
  
  // User who made the movement
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Location information
  location: {
    type: String,
    default: 'main_warehouse'
  },
  
  // Batch/Lot information (for inventory tracking)
  batch_number: {
    type: String,
    default: null
  },
  
  expiry_date: {
    type: Date,
    default: null
  },
  
  // System fields
  movement_date: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Metadata
  metadata: {
    ip_address: String,
    user_agent: String,
    system_generated: {
      type: Boolean,
      default: false
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
stockMovementSchema.index({ product: 1, movement_date: -1 });
stockMovementSchema.index({ type: 1, movement_date: -1 });
stockMovementSchema.index({ created_by: 1, movement_date: -1 });
stockMovementSchema.index({ reference_type: 1, reference_id: 1 });

// Virtual for movement direction
stockMovementSchema.virtual('direction').get(function() {
  const inTypes = ['adjustment_in', 'purchase', 'return_in', 'transfer_in', 'production_in', 'initial_stock'];
  return inTypes.includes(this.type) ? 'in' : 'out';
});

// Virtual for movement description
stockMovementSchema.virtual('description').get(function() {
  const descriptions = {
    'adjustment_in': 'Stock Adjustment (Increase)',
    'adjustment_out': 'Stock Adjustment (Decrease)',
    'sale': 'Sale',
    'purchase': 'Purchase/Received',
    'return_in': 'Customer Return',
    'return_out': 'Return to Supplier',
    'damage_loss': 'Damaged/Lost',
    'transfer_in': 'Transfer In',
    'transfer_out': 'Transfer Out',
    'inventory_count': 'Inventory Count',
    'production_in': 'Production Output',
    'production_out': 'Production Input',
    'initial_stock': 'Initial Stock'
  };
  return descriptions[this.type] || this.type;
});

// Pre-save middleware to calculate total_cost
stockMovementSchema.pre('save', function(next) {
  if (this.unit_cost && this.quantity) {
    this.total_cost = this.unit_cost * Math.abs(this.quantity);
  }
  next();
});

// Static method to create movement
stockMovementSchema.statics.createMovement = async function(data) {
  const movement = new this(data);
  await movement.save();
  
  // Populate the created movement
  return await this.findById(movement._id)
    .populate('product', 'name sku')
    .populate('created_by', 'name email');
};

// Static method to get product movement history
stockMovementSchema.statics.getProductHistory = async function(productId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    startDate,
    endDate,
    type,
    reason
  } = options;
  
  const query = { product: productId };
  
  if (startDate || endDate) {
    query.movement_date = {};
    if (startDate) query.movement_date.$gte = new Date(startDate);
    if (endDate) query.movement_date.$lte = new Date(endDate);
  }
  
  if (type) query.type = type;
  if (reason) query.reason = reason;
  
  return await this.find(query)
    .populate('created_by', 'name email')
    .populate('product', 'name sku')
    .sort({ movement_date: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get movement statistics
stockMovementSchema.statics.getMovementStats = async function(productId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        movement_date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        total_quantity: { $sum: '$quantity' },
        total_movements: { $sum: 1 },
        avg_quantity: { $avg: '$quantity' },
        total_cost: { $sum: '$total_cost' }
      }
    },
    {
      $sort: { total_movements: -1 }
    }
  ]);
};

export default mongoose.model('StockMovement', stockMovementSchema);