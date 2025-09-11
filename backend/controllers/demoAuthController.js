import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt.js';

// Demo users for testing without database
const demoUsers = [
  {
    _id: 'demo_admin_id',
    email: 'admin@example.com',
    name: 'Demo Admin',
    role: 'admin',
    password: 'admin123' // In real app, this would be hashed
  },
  {
    _id: 'demo_user_id',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'customer',
    password: 'user123'
  },
  {
    _id: 'demo_employee_id',
    email: 'employee@example.com',
    name: 'Demo Employee',
    role: 'employee',
    password: 'employee123'
  },
  {
    _id: 'demo_designer_id',
    email: 'designer@example.com',
    name: 'Demo Designer',
    role: 'designer',
    password: 'designer123'
  },
  {
    _id: 'demo_supplier_id',
    email: 'supplier@example.com',
    name: 'Demo Supplier',
    role: 'supplier',
    password: 'supplier123'
  }
];

// Demo categories for testing
const demoCategories = [
  {
    _id: 'demo_cat_1',
    name: 'Furniture',
    description: 'All types of furniture including chairs, tables, beds, and storage solutions',
    status: 'active',
    slug: 'furniture',
    createdAt: new Date(),
    updatedAt: new Date(),
    productCount: 12
  },
  {
    _id: 'demo_cat_2',
    name: 'Electronics',
    description: 'Electronic devices, gadgets, and accessories',
    status: 'active',
    slug: 'electronics',
    createdAt: new Date(),
    updatedAt: new Date(),
    productCount: 8
  },
  {
    _id: 'demo_cat_3',
    name: 'Home Decor',
    description: 'Decorative items, artwork, and home accessories',
    status: 'active',
    slug: 'home-decor',
    createdAt: new Date(),
    updatedAt: new Date(),
    productCount: 15
  },
  {
    _id: 'demo_cat_4',
    name: 'Lighting',
    description: 'Lamps, ceiling lights, and lighting solutions',
    status: 'inactive',
    slug: 'lighting',
    createdAt: new Date(),
    updatedAt: new Date(),
    productCount: 5
  },
  {
    _id: 'demo_cat_5',
    name: 'Kitchen',
    description: 'Kitchen appliances, cookware, and dining accessories',
    status: 'active',
    slug: 'kitchen',
    createdAt: new Date(),
    updatedAt: new Date(),
    productCount: 20
  }
];

// Removed local generateToken function - using the one from utils/jwt.js

export const demoLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    // Find demo user
    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate token using the proper JWT utility
    const token = generateToken({ 
      userId: user._id, 
      role: user.role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
};

export const demoGetCategories = (req, res) => {
  try {
    const { search, status, page = 1, limit = 12 } = req.query;

    let filteredCategories = [...demoCategories];

    // Apply search filter
    if (search) {
      filteredCategories = filteredCategories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredCategories = filteredCategories.filter(cat => cat.status === status);
    }

    // Calculate pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    res.status(200).json({
      status: 'success',
      data: paginatedCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredCategories.length,
        totalPages: Math.ceil(filteredCategories.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Demo get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching categories'
    });
  }
};

export const demoGetCategoryStats = (req, res) => {
  try {
    const stats = {
      totalCategories: demoCategories.length,
      activeCategories: demoCategories.filter(cat => cat.status === 'active').length,
      parentCategories: demoCategories.filter(cat => !cat.parent).length,
      categoriesWithProducts: demoCategories.filter(cat => cat.productCount > 0).length
    };

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Demo get category stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching category stats'
    });
  }
};

export const demoCreateCategory = (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;

    const newCategory = {
      _id: `demo_cat_${Date.now()}`,
      name,
      description,
      status,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      createdAt: new Date(),
      updatedAt: new Date(),
      productCount: 0
    };

    demoCategories.push(newCategory);

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Demo create category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error creating category'
    });
  }
};

export const demoUpdateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const categoryIndex = demoCategories.findIndex(cat => cat._id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Update category
    if (name) {
      demoCategories[categoryIndex].name = name;
      demoCategories[categoryIndex].slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (description) demoCategories[categoryIndex].description = description;
    if (status) demoCategories[categoryIndex].status = status;
    demoCategories[categoryIndex].updatedAt = new Date();

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: demoCategories[categoryIndex]
    });
  } catch (error) {
    console.error('Demo update category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating category'
    });
  }
};

export const demoDeleteCategory = (req, res) => {
  try {
    const { id } = req.params;

    const categoryIndex = demoCategories.findIndex(cat => cat._id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    demoCategories.splice(categoryIndex, 1);

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Demo delete category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting category'
    });
  }
};