import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { deleteImageFromCloudinary } from '../config/cloudinary.js';

// Get all users (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filter = req.query.role ? { role: req.query.role } : {};
  const search = req.query.search;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user (Admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, isActive } = req.body;

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Update fields if provided
  if (name) user.name = name.trim();
  if (email) user.email = email.toLowerCase().trim();
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user: user.profile
    }
  });
});

// Delete user (Admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    return res.status(400).json({
      status: 'error',
      message: 'You cannot delete your own account'
    });
  }

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Delete avatar from Cloudinary if exists
  if (user.avatar.public_id) {
    try {
      await deleteImageFromCloudinary(user.avatar.public_id);
    } catch (error) {
      console.error('Error deleting avatar from Cloudinary:', error);
    }
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

// Get users by role
export const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;

  const validRoles = ['user', 'admin', 'employee', 'supplier', 'interior_designer'];
  
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid role specified'
    });
  }

  const users = await User.findByRole(role)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');

  res.status(200).json({
    status: 'success',
    data: {
      users,
      count: users.length
    }
  });
});

// Get user statistics (Admin only)
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentUsers,
      roleDistribution: stats
    }
  });
});

// Deactivate user account (Admin only)
export const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    return res.status(400).json({
      status: 'error',
      message: 'You cannot deactivate your own account'
    });
  }

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User account deactivated successfully'
  });
});

// Activate user account (Admin only)
export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User account activated successfully'
  });
});

// Unlock user account (Admin only)
export const unlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  if (!user.isLocked()) {
    return res.status(400).json({
      status: 'error',
      message: 'User account is not locked'
    });
  }

  await user.resetLoginAttempts();

  res.status(200).json({
    status: 'success',
    message: 'User account unlocked successfully'
  });
});