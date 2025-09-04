import mongoose from 'mongoose';

const productImageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  alt_text: {
    type: String,
    default: ''
  },
  is_primary: {
    type: Boolean,
    default: false
  }
});

const productVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  price_adjustment: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  sku_suffix: {
    type: String,
    default: ''
  }
});

const stockHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['restock', 'sale', 'adjustment', 'damaged', 'returned'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previous_stock: {
    type: Number,
    required: true
  },
  new_stock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  short_description: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  images: [productImageSchema],
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost_price: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  compare_at_price: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  profit_margin: {
    type: Number,
    default: function() {
      return ((this.price - this.cost_price) / this.price * 100).toFixed(2);
    }
  },
  stock: {
    current: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative']
    },
    available: {
      type: Number,
      default: function() {
        return this.stock.current - this.stock.reserved;
      }
    },
    low_stock_threshold: {
      type: Number,
      required: true,
      min: [0, 'Low stock threshold cannot be negative'],
      default: 10
    },
    track_inventory: {
      type: Boolean,
      default: true
    }
  },
  stock_history: [stockHistorySchema],
  variants: [productVariantSchema],
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: ['cm', 'in', 'mm'],
      default: 'cm'
    },
    weight_unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  supplier_info: {
    name: String,
    contact: String,
    lead_time: Number, // in days
    minimum_order_quantity: {
      type: Number,
      default: 1
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  digital: {
    type: Boolean,
    default: false
  },
  requires_shipping: {
    type: Boolean,
    default: true
  },
  meta: {
    title: String,
    description: String,
    keywords: [String]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      five_star: { type: Number, default: 0 },
      four_star: { type: Number, default: 0 },
      three_star: { type: Number, default: 0 },
      two_star: { type: Number, default: 0 },
      one_star: { type: Number, default: 0 }
    }
  },
  sales: {
    total_sold: {
      type: Number,
      default: 0
    },
    total_revenue: {
      type: Number,
      default: 0
    },
    last_sale_date: Date
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ 'stock.current': 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });

// Virtual for stock status
productSchema.virtual('stock_status').get(function() {
  if (!this.stock.track_inventory) return 'not_tracked';
  if (this.stock.available <= 0) return 'out_of_stock';
  if (this.stock.available <= this.stock.low_stock_threshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for profit amount
productSchema.virtual('profit_amount').get(function() {
  return this.price - this.cost_price;
});

// Virtual for availability
productSchema.virtual('is_available').get(function() {
  return this.status === 'active' && 
         this.visibility === 'public' && 
         (this.stock.available > 0 || !this.stock.track_inventory);
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to update available stock
productSchema.pre('save', function(next) {
  if (this.isModified('stock.current') || this.isModified('stock.reserved')) {
    this.stock.available = this.stock.current - this.stock.reserved;
  }
  next();
});

// Pre-save middleware to auto-update status based on stock
productSchema.pre('save', function(next) {
  if (this.stock.track_inventory && this.stock.available <= 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.stock.track_inventory && this.stock.available > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  next();
});

// Instance method to add stock history entry
productSchema.methods.addStockHistory = function(type, quantity, reason, userId) {
  const previousStock = this.stock.current;
  let newStock;
  
  switch(type) {
    case 'restock':
      newStock = previousStock + quantity;
      break;
    case 'sale':
    case 'damaged':
      newStock = previousStock - quantity;
      break;
    case 'adjustment':
      newStock = quantity; // Direct adjustment
      break;
    case 'returned':
      newStock = previousStock + quantity;
      break;
    default:
      newStock = previousStock;
  }
  
  this.stock_history.push({
    type,
    quantity: Math.abs(quantity),
    previous_stock: previousStock,
    new_stock: newStock,
    reason,
    user: userId
  });
  
  this.stock.current = newStock;
  return this.save();
};

// Instance method to update rating
productSchema.methods.updateRating = function(newRating, oldRating = null) {
  if (oldRating) {
    // Update existing rating
    this.ratings.distribution[`${oldRating}_star`]--;
    this.ratings.distribution[`${newRating}_star`]++;
  } else {
    // New rating
    this.ratings.count++;
    this.ratings.distribution[`${newRating}_star`]++;
  }
  
  // Recalculate average
  const total = this.ratings.distribution.five_star * 5 +
                this.ratings.distribution.four_star * 4 +
                this.ratings.distribution.three_star * 3 +
                this.ratings.distribution.two_star * 2 +
                this.ratings.distribution.one_star * 1;
  
  this.ratings.average = (total / this.ratings.count).toFixed(1);
  return this.save();
};

// Instance method to record sale
productSchema.methods.recordSale = function(quantity, saleAmount, userId) {
  this.sales.total_sold += quantity;
  this.sales.total_revenue += saleAmount;
  this.sales.last_sale_date = new Date();
  
  return this.addStockHistory('sale', quantity, 'Product sale', userId);
};

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    'stock.track_inventory': true,
    $expr: { $lte: ['$stock.available', '$stock.low_stock_threshold'] }
  });
};

// Static method to get out of stock products
productSchema.statics.getOutOfStockProducts = function() {
  return this.find({
    'stock.track_inventory': true,
    'stock.available': { $lte: 0 }
  });
};

// Static method to get products by category
productSchema.statics.getByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'active' });
};

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    visibility: 'public'
  };
  
  if (options.category) {
    searchQuery.category = options.category;
  }
  
  if (options.priceRange) {
    searchQuery.price = {
      $gte: options.priceRange.min || 0,
      $lte: options.priceRange.max || Number.MAX_SAFE_INTEGER
    };
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .populate('category', 'name')
    .populate('supplier', 'name email');
};

const Product = mongoose.model('Product', productSchema);

export default Product;