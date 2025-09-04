import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Protect routes - check if user is authenticated
export const protect = async (req, res, next) => {
  try {
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
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if token type is correct (only if type field exists - for backward compatibility)
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token type.'
      });
    }

    // Check if user still exists
    let user = null;
    
    // Only try to find user if userId is a valid ObjectId
    if (mongoose.isValidObjectId(decoded.userId)) {
      user = await User.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User account is deactivated.'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        status: 'error',
        message: 'Account is temporarily locked due to too many failed login attempts.'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired.'
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed.'
    });
  }
};

// Restrict routes to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Check if user is admin
export const adminOnly = restrictTo('admin');

// Check if user is admin or employee
export const staffOnly = restrictTo('admin', 'employee');

// Check if user is supplier
export const supplierOnly = restrictTo('admin', 'supplier');

// Check if user is interior designer
export const designerOnly = restrictTo('admin', 'interior_designer');

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      
      if (decoded.type === 'access' && mongoose.isValidObjectId(decoded.userId)) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive && !user.isLocked()) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Check if user owns the resource or is admin
export const checkResourceOwnership = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
    
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({
      status: 'error',
      message: 'You can only access your own resources.'
    });
  };
};