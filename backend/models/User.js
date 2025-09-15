import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  avatar: {
    public_id: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/dxkufsejm/image/upload/v1625661662/avatars/default_avatar.png'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'employee', 'supplier', 'interior_designer'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },

  // Employee-specific fields
  employeeProfile: {
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], trim: true },
    age: { type: Number, min: 16, max: 100 },
    position: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    qualifications: [{ type: String, trim: true }]
  },
  
  // Supplier-specific fields
  companyName: {
    type: String,
    trim: true
  },
  contactPersonTitle: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  businessLicense: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '50-100', '100-500', '500+']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  specialties: [{
    type: String,
    trim: true
  }],
  services: [{
    type: String,
    trim: true
  }],
  certifications: [{
    type: String,
    trim: true
  }],
  businessHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  
  // Supplier statistics
  stats: {
    overallRating: { type: Number, default: 0, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0, min: 0 },
    onTimeDelivery: { type: Number, default: 0, min: 0, max: 100 },
    productsSupplied: { type: Number, default: 0, min: 0 },
    yearsOfService: { type: Number, default: 0, min: 0 },
    customerSatisfaction: { type: Number, default: 0, min: 0, max: 5 },
    responseTime: { type: String, default: '0 hrs' },
    qualityScore: { type: Number, default: 0, min: 0, max: 5 }
  }
}, {
  timestamps: true
});

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  const baseProfile = {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone || this.employeeProfile?.phone,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };

  // Add supplier-specific fields if user is a supplier
  if (this.role === 'supplier') {
    return {
      ...baseProfile,
      companyName: this.companyName,
      contactPersonTitle: this.contactPersonTitle,
      website: this.website,
      address: this.address,
      businessLicense: this.businessLicense,
      taxId: this.taxId,
      establishedYear: this.establishedYear,
      employeeCount: this.employeeCount,
      description: this.description,
      specialties: this.specialties || [],
      services: this.services || [],
      certifications: this.certifications || [],
      businessHours: this.businessHours,
      stats: this.stats
    };
  }

  // Add employee-specific fields if user is an employee
  if (this.role === 'employee') {
    return {
      ...baseProfile,
      gender: this.employeeProfile?.gender || null,
      age: this.employeeProfile?.age || null,
      position: this.employeeProfile?.position || null,
      salary: this.employeeProfile?.salary || null,
      address: this.employeeProfile?.address || null,
      qualifications: this.employeeProfile?.qualifications || []
    };
  }

  return baseProfile;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update lastLogin on login
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by email with password
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Transform JSON output to remove sensitive fields
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;