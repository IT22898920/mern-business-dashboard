import mongoose from 'mongoose';

const supplierApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One application per user
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['manufacturer', 'wholesaler', 'distributor', 'retailer', 'other']
  },
  businessAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State/Province is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  contactInfo: {
    businessPhone: {
      type: String,
      required: [true, 'Business phone is required']
    },
    businessEmail: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid website URL'
      }
    }
  },
  businessDetails: {
    yearsInBusiness: {
      type: Number,
      required: [true, 'Years in business is required'],
      min: [0, 'Years in business cannot be negative']
    },
    numberOfEmployees: {
      type: String,
      required: [true, 'Number of employees is required'],
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
    },
    annualRevenue: {
      type: String,
      enum: ['under-100k', '100k-500k', '500k-1m', '1m-10m', '10m+']
    },
    description: {
      type: String,
      required: [true, 'Business description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
  },
  productCategories: [{
    type: String,
    required: true
  }],
  documents: {
    businessLicense: {
      url: String,
      public_id: String,
      uploaded: { type: Boolean, default: false }
    },
    taxCertificate: {
      url: String,
      public_id: String,
      uploaded: { type: Boolean, default: false }
    },
    bankStatement: {
      url: String,
      public_id: String,
      uploaded: { type: Boolean, default: false }
    }
  },
  references: [{
    companyName: {
      type: String,
      required: false
    },
    contactPerson: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    relationship: {
      type: String,
      required: false
    }
  }],
  bankDetails: {
    bankName: {
      type: String,
      required: false
    },
    accountHolder: {
      type: String,
      required: false
    },
    accountNumber: {
      type: String,
      required: false
    },
    routingNumber: {
      type: String
    },
    swiftCode: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
supplierApplicationSchema.index({ user: 1 });
supplierApplicationSchema.index({ status: 1 });
supplierApplicationSchema.index({ submittedAt: -1 });
supplierApplicationSchema.index({ 'businessDetails.description': 'text', businessName: 'text' });

// Virtual for application age
supplierApplicationSchema.virtual('applicationAge').get(function() {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Populate user info when querying
supplierApplicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email phone createdAt'
  });
  
  this.populate({
    path: 'reviewedBy',
    select: 'name email'
  });
  
  next();
});

// Static method to get application statistics
supplierApplicationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalApplications = await this.countDocuments();
  
  return {
    total: totalApplications,
    breakdown: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };
};

const SupplierApplication = mongoose.model('SupplierApplication', supplierApplicationSchema);

export default SupplierApplication;