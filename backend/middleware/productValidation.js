import { body } from 'express-validator';

export const validateCreateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),

  body('short_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters')
    .trim(),

  body('sku')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),

  body('barcode')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('Barcode must be between 8 and 20 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('subcategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid subcategory ID'),

  body('brand')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters')
    .trim(),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters')
    .trim(),

  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative')
    .custom((value) => {
      if (value > 1000000) {
        throw new Error('Price cannot exceed 1,000,000');
      }
      return true;
    }),

  body('cost_price')
    .isNumeric()
    .withMessage('Cost price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost price cannot be negative')
    .custom((value, { req }) => {
      if (value > req.body.price) {
        throw new Error('Cost price cannot be higher than selling price');
      }
      return true;
    }),

  body('compare_at_price')
    .optional()
    .isNumeric()
    .withMessage('Compare at price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Compare at price cannot be negative'),

  body('stock.current')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),

  body('stock.reserved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reserved stock must be a non-negative integer'),

  body('stock.low_stock_threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),

  body('stock.track_inventory')
    .optional()
    .isBoolean()
    .withMessage('Track inventory must be a boolean'),

  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),

  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),

  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),

  body('dimensions.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('dimensions.unit')
    .optional()
    .isIn(['cm', 'in', 'mm'])
    .withMessage('Unit must be cm, in, or mm'),

  body('dimensions.weight_unit')
    .optional()
    .isIn(['kg', 'g', 'lb', 'oz'])
    .withMessage('Weight unit must be kg, g, lb, or oz'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('supplier_info.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supplier name cannot exceed 100 characters')
    .trim(),

  body('supplier_info.contact')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supplier contact cannot exceed 100 characters')
    .trim(),

  body('supplier_info.lead_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Lead time must be a non-negative integer'),

  body('supplier_info.minimum_order_quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum order quantity must be at least 1'),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'discontinued', 'out_of_stock'])
    .withMessage('Invalid status'),

  body('visibility')
    .optional()
    .isIn(['public', 'private', 'hidden'])
    .withMessage('Invalid visibility'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),

  body('digital')
    .optional()
    .isBoolean()
    .withMessage('Digital must be a boolean'),

  body('requires_shipping')
    .optional()
    .isBoolean()
    .withMessage('Requires shipping must be a boolean'),

  body('meta.title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Meta title cannot exceed 200 characters')
    .trim(),

  body('meta.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Meta description cannot exceed 500 characters')
    .trim(),

  body('meta.keywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*.public_id')
    .optional()
    .notEmpty()
    .withMessage('Image public_id is required'),

  body('images.*.url')
    .optional()
    .custom((value) => {
      // Accept both regular URLs and base64 data URIs
      if (value.startsWith('data:image/')) {
        return true;
      }
      if (value.match(/^https?:\/\/.+/)) {
        return true;
      }
      throw new Error('Image URL must be a valid URL or base64 data URI');
    }),

  body('images.*.alt_text')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image alt text cannot exceed 200 characters'),

  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),

  body('variants.*.name')
    .optional()
    .notEmpty()
    .withMessage('Variant name is required')
    .isLength({ max: 100 })
    .withMessage('Variant name cannot exceed 100 characters'),

  body('variants.*.value')
    .optional()
    .notEmpty()
    .withMessage('Variant value is required')
    .isLength({ max: 100 })
    .withMessage('Variant value cannot exceed 100 characters'),

  body('variants.*.price_adjustment')
    .optional()
    .isNumeric()
    .withMessage('Price adjustment must be a number'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Variant stock must be a non-negative integer')
];

export const validateUpdateProduct = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),

  body('short_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters')
    .trim(),

  body('sku')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),

  body('cost_price')
    .optional()
    .isNumeric()
    .withMessage('Cost price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost price cannot be negative'),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'discontinued', 'out_of_stock'])
    .withMessage('Invalid status'),

  body('visibility')
    .optional()
    .isIn(['public', 'private', 'hidden'])
    .withMessage('Invalid visibility')
];

export const validateStockUpdate = [
  body('type')
    .notEmpty()
    .withMessage('Stock update type is required')
    .isIn(['restock', 'sale', 'adjustment', 'damaged', 'returned'])
    .withMessage('Invalid stock update type'),

  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
    .trim()
];