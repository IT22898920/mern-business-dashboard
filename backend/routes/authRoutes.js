import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  updateProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  resendEmailVerification,
  refreshToken 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar, handleMulterError } from '../config/cloudinary.js';
import {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile
} from '../middleware/validation.js';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 password reset requests per hour
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later.'
  }
});

// Public routes (authentication not required)
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/verify-email', verifyEmail);

// Protected routes (authentication required)
router.use(protect); // All routes after this middleware require authentication

router.get('/me', getMe);
router.put('/update-profile', validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);
router.post('/resend-verification', resendEmailVerification);

// Route with file upload
router.put('/upload-avatar', uploadAvatar, handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No avatar file provided'
    });
  }

  // Update user avatar with Cloudinary URL
  req.user.avatar = {
    public_id: req.file.public_id,
    url: req.file.path
  };
  
  req.user.save()
    .then(() => {
      res.status(200).json({
        status: 'success',
        message: 'Avatar uploaded successfully',
        data: {
          avatar: req.user.avatar
        }
      });
    })
    .catch((error) => {
      console.error('Avatar save error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to save avatar'
      });
    });
});

export default router;