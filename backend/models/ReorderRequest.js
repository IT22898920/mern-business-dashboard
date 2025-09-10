import mongoose from 'mongoose';

const reorderRequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in_progress', 'shipped', 'delivered', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 1000
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  supplierResponse: {
    message: {
      type: String,
      maxlength: 1000
    },
    estimatedPrice: {
      type: Number,
      min: 0
    },
    estimatedDelivery: {
      type: Date
    },
    respondedAt: {
      type: Date
    }
  },
  timeline: [{
    action: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
reorderRequestSchema.index({ supplier: 1, status: 1 });
reorderRequestSchema.index({ product: 1 });
reorderRequestSchema.index({ requestedBy: 1 });
reorderRequestSchema.index({ createdAt: -1 });
reorderRequestSchema.index({ urgency: 1, status: 1 });

// Virtual for days pending
reorderRequestSchema.virtual('daysPending').get(function() {
  if (this.status === 'delivered' || this.status === 'rejected') {
    return 0;
  }
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to add timeline entry
reorderRequestSchema.methods.addTimelineEntry = function(action, user, message, metadata) {
  this.timeline.push({
    action,
    user,
    message,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status with timeline
reorderRequestSchema.methods.updateStatus = function(newStatus, user, message) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  return this.addTimelineEntry(`status_changed`, user, 
    message || `Status changed from ${oldStatus} to ${newStatus}`);
};

// Static method to get supplier statistics
reorderRequestSchema.statics.getSupplierStats = async function(supplierId) {
  const stats = await this.aggregate([
    { $match: { supplier: new mongoose.Types.ObjectId(supplierId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDeliveryTime: {
          $avg: {
            $cond: {
              if: { $and: [{ $ne: ['$actualDeliveryDate', null] }, { $ne: ['$createdAt', null] }] },
              then: { $divide: [{ $subtract: ['$actualDeliveryDate', '$createdAt'] }, 86400000] },
              else: null
            }
          }
        }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      avgDeliveryTime: Math.round(stat.avgDeliveryTime || 0)
    };
    return acc;
  }, {});
};

// Pre-save middleware to add initial timeline entry
reorderRequestSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'request_created',
      user: this.requestedBy,
      message: `Reorder request created for ${this.quantity} units`,
      timestamp: new Date()
    });
  }
  next();
});

// Populate references on find
reorderRequestSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'product',
    select: 'name sku stock.available stock.low_stock_threshold'
  }).populate({
    path: 'supplier',
    select: 'name email profile.businessName'
  }).populate({
    path: 'requestedBy',
    select: 'name email'
  }).populate({
    path: 'timeline.user',
    select: 'name email'
  }).populate({
    path: 'notes.user',
    select: 'name email'
  });
  next();
});

const ReorderRequest = mongoose.model('ReorderRequest', reorderRequestSchema);

export default ReorderRequest;