import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { validationResult } from 'express-validator';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { tree = 'false', parent, status = 'active', search } = req.query;

    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { slug: { $regex: searchRegex } }
      ];
      console.log(`🔍 Category search for "${search}"`);
    }

    if (tree === 'true') {
      // Return hierarchical tree structure
      const categories = await Category.getCategoryTree();
      return res.json({
        success: true,
        data: categories
      });
    }

    if (parent !== undefined) {
      query.parent = parent === 'null' ? null : parent;
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .populate('created_by', 'name email')
      .sort({ sort_order: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate('parent', 'name slug')
      .populate('children')
      .populate('created_by', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const categoryData = {
      ...req.body,
      created_by: req.user.id
    };

    const category = new Category(categoryData);
    await category.save();

    await category.populate([
      { path: 'parent', select: 'name slug' },
      { path: 'created_by', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Category with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if trying to set parent as itself or create circular reference
    if (req.body.parent === id) {
      return res.status(400).json({
        success: false,
        message: 'Category cannot be its own parent'
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'parent', select: 'name slug' },
      { path: 'children', select: 'name slug' },
      { path: 'created_by', select: 'name email' }
    ]);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Category with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Please move or delete products first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${subcategoryCount} subcategories. Please delete subcategories first.`
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// Get category statistics
export const getCategoryStats = async (req, res) => {
  try {
    const [totalCategories, activeCategories, categoryProductCounts] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ status: 'active' }),
      Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $addFields: {
            product_count: { $size: '$products' }
          }
        },
        {
          $project: {
            name: 1,
            product_count: 1
          }
        },
        { $sort: { product_count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        topCategories: categoryProductCounts
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message
    });
  }
};

// Get subcategories of a category
export const getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategories = await Category.getSubcategories(id);

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
};