import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import { 
  createTokenAndSetCookie, 
  clearTokenCookie, 
  generatePasswordResetToken,
  generateEmailVerificationToken,
  verifyToken 
} from '../utils/jwt.js';
import { 
  sendPasswordResetEmail, 
  sendEmailVerificationEmail, 
  sendWelcomeEmail 
} from '../config/email.js';
import { uploadBase64ToCloudinary, deleteImageFromCloudinary } from '../config/cloudinary.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// Register user
export const register = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, phone, password, role, avatar } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      status: 'error',
      message: 'User with this email already exists'
    });
  }

  let avatarData = {
    public_id: null,
    url: 'https://res.cloudinary.com/dxkufsejm/image/upload/v1625661662/avatars/default_avatar.png'
  };

  // Handle avatar upload if provided
  if (avatar && avatar.startsWith('data:image')) {
    try {
      const uploadResult = await uploadBase64ToCloudinary(avatar, 'mern-business-dashboard/avatars');
      avatarData = uploadResult;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to upload avatar image'
      });
    }
  }

  // Create user
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone ? phone.trim() : undefined,
    password,
    role: role || 'user',
    avatar: avatarData
  });

  await user.save();

  // Generate email verification token
  const verificationToken = generateEmailVerificationToken(user._id, user.email);
  user.emailVerificationToken = verificationToken;
  await user.save();

  // Send verification email
  try {
    await sendEmailVerificationEmail(user, verificationToken);
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't fail registration if email fails
  }

  // Create token and set cookie
  const token = createTokenAndSetCookie(res, user._id, false);

  res.status(201).json({
    status: 'success',
    message: 'Registration successful! Please check your email to verify your account.',
    data: {
      user: user.profile,
      token
    }
  });
});

// Refresh token endpoint
export const refreshToken = asyncHandler(async (req, res) => {
  let token;

  // Get token from cookies or Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No token provided'
    });
  }

  try {
    // Verify the token
    const decoded = verifyToken(token);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = createTokenAndSetCookie(res, user._id, false);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        user: user.profile,
        token: newToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please login again.'
    });
  }
});

// Login user
export const login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, rememberMe } = req.body;

  // Find user and include password field
  const user = await User.findByEmail(email.toLowerCase().trim());
  
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Check if account is locked
  if (user.isLocked()) {
    return res.status(423).json({
      status: 'error',
      message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
    });
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Check if user account is active
  if (!user.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create token and set cookie
  const token = createTokenAndSetCookie(res, user._id, rememberMe);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: user.profile,
      token
    }
  });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get current user profile
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user.profile
    }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const updateFields = req.body;

  // Basic fields that all users can update
  const allowedFields = ['name', 'phone', 'avatar'];
  
  // Additional fields for suppliers
  const supplierFields = [
    'companyName', 'contactPersonTitle', 'website', 'address',
    'businessLicense', 'taxId', 'establishedYear', 'employeeCount',
    'description', 'specialties', 'services', 'certifications', 'businessHours'
  ];

  // If user is a supplier, add supplier fields to allowed fields
  if (user.role === 'supplier') {
    allowedFields.push(...supplierFields);
  }

  // Update basic fields
  for (const field of allowedFields) {
    if (updateFields[field] !== undefined) {
      if (field === 'name' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'phone' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'companyName' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'contactPersonTitle' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'website' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'businessLicense' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'taxId' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'description' && updateFields[field]) {
        user[field] = updateFields[field].trim();
      } else if (field === 'establishedYear' && updateFields[field]) {
        user[field] = parseInt(updateFields[field]);
      } else if (field === 'employeeCount' && updateFields[field]) {
        user[field] = updateFields[field];
      } else if (field === 'address' && updateFields[field]) {
        user[field] = {
          street: updateFields[field].street || '',
          city: updateFields[field].city || '',
          state: updateFields[field].state || '',
          zipCode: updateFields[field].zipCode || '',
          country: updateFields[field].country || ''
        };
      } else if (field === 'specialties' && Array.isArray(updateFields[field])) {
        user[field] = updateFields[field].filter(item => item && item.trim()).map(item => item.trim());
      } else if (field === 'services' && Array.isArray(updateFields[field])) {
        user[field] = updateFields[field].filter(item => item && item.trim()).map(item => item.trim());
      } else if (field === 'certifications' && Array.isArray(updateFields[field])) {
        user[field] = updateFields[field].filter(item => item && item.trim()).map(item => item.trim());
      } else if (field === 'businessHours' && updateFields[field]) {
        user[field] = updateFields[field];
      }
    }
  }

  // Handle avatar update
  if (updateFields.avatar && updateFields.avatar.startsWith('data:image')) {
    try {
      // Delete old avatar from Cloudinary if exists
      if (user.avatar.public_id) {
        await deleteImageFromCloudinary(user.avatar.public_id);
      }

      // Upload new avatar
      const uploadResult = await uploadBase64ToCloudinary(updateFields.avatar, 'mern-business-dashboard/avatars');
      user.avatar = uploadResult;
    } catch (error) {
      console.error('Avatar update error:', error);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update avatar image'
      });
    }
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: user.profile
    }
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return res.status(400).json({
      status: 'error',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, we have sent password reset instructions.'
    });
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(user._id);
  
  // Save reset token to user
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send reset email
  try {
    await sendPasswordResetEmail(user, resetToken);
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    console.error('Password reset email error:', error);
    
    // Remove reset token if email fails
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to send password reset email. Please try again.'
    });
  }
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Token and new password are required'
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    
    // Reset login attempts if any
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or expired password reset token'
    });
  }
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  // Handle both GET (/verify-email/:token) and POST (/verify-email) requests
  const token = req.params.token || req.body.token;

  if (!token) {
    return res.status(400).json({
      status: 'error',
      message: 'Verification token is required'
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    // Find user with verification token
    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
      emailVerificationToken: token
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (error) {
      console.error('Welcome email error:', error);
      // Don't fail verification if welcome email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or expired verification token'
    });
  }
});

// Resend email verification
export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = generateEmailVerificationToken(user._id, user.email);
  user.emailVerificationToken = verificationToken;
  await user.save();

  // Send verification email
  try {
    await sendEmailVerificationEmail(user, verificationToken);
    
    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email. Please try again.'
    });
  }
});