import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-business-dashboard/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?._id || 'anonymous';
      return `avatar_${userId}_${timestamp}`;
    }
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure Multer
export const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
}).single('avatar');

// Upload image to Cloudinary directly (without Multer)
export const uploadImageToCloudinary = async (file, folder = 'mern-business-dashboard') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Upload base64 image to Cloudinary
export const uploadBase64ToCloudinary = async (base64String, folder = 'mern-business-dashboard/avatars') => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      public_id: `avatar_${Date.now()}`
    });

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    throw new Error('Failed to upload base64 image to Cloudinary');
  }
};

// Middleware to handle Multer errors
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Only one file allowed.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected field name. Use "avatar" as field name.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      status: 'error',
      message: 'Only image files (jpg, jpeg, png, gif, webp) are allowed.'
    });
  }
  
  next(error);
};

export default cloudinary;