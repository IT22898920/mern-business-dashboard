import { body } from 'express-validator';

// Validation rules for creating/updating interior designers
const designerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('address.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  
  body('age')
    .isInt({ min: 18, max: 80 })
    .withMessage('Age must be between 18 and 80 years'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('specialization')
    .optional()
    .isArray()
    .withMessage('Specialization must be an array'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('Verified status must be a boolean')
];

// Validation rules for creating designers (password required)
const createDesignerValidation = [
  ...designerValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export {
  designerValidation,
  createDesignerValidation
};
