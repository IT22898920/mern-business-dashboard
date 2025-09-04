import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    public_id: String,
    url: String,
    alt_text: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  sort_order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  meta: {
    title: String,
    description: String,
    keywords: [String]
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ sort_order: 1 });

// Virtual for subcategories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for product count
categorySchema.virtual('product_count', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to set level based on parent
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent') && this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
    }
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {
  return this.find({ parent: null, status: 'active' })
    .populate({
      path: 'children',
      match: { status: 'active' },
      populate: {
        path: 'children',
        match: { status: 'active' }
      }
    })
    .sort({ sort_order: 1, name: 1 });
};

// Static method to get all subcategories of a category
categorySchema.statics.getSubcategories = function(categoryId) {
  return this.find({ parent: categoryId, status: 'active' })
    .sort({ sort_order: 1, name: 1 });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;