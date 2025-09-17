import jwt from 'jsonwebtoken';

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
  }
];

// Demo interior designers for testing
const demoDesigners = [
  {
    _id: 'demo_designer_1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    address: {
      street: '123 Design Street',
      city: 'Colombo',
      state: 'Western Province',
      zipCode: '00100',
      country: 'Sri Lanka'
    },
    experience: 5,
    age: 28,
    phone: '+94 77 123 4567',
    specialization: ['Modern', 'Contemporary', 'Minimalist'],
    bio: 'Passionate interior designer with 5 years of experience creating beautiful spaces.',
    hourlyRate: 2500,
    languages: ['English', 'Sinhala'],
    isActive: true,
    isVerified: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'demo_designer_2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    address: {
      street: '456 Creative Lane',
      city: 'Kandy',
      state: 'Central Province',
      zipCode: '20000',
      country: 'Sri Lanka'
    },
    experience: 8,
    age: 32,
    phone: '+94 77 234 5678',
    specialization: ['Traditional', 'Classic', 'Luxury'],
    bio: 'Experienced designer specializing in luxury residential and commercial spaces.',
    hourlyRate: 3500,
    languages: ['English', 'Tamil'],
    isActive: true,
    isVerified: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
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

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'demo_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

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

    // Generate token
    const token = generateToken(user._id, user.role);

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

// ===== DEMO INTERIOR DESIGNER FUNCTIONS =====

export const demoGetDesignerStats = (req, res) => {
  try {
    const total = demoDesigners.length;
    const active = demoDesigners.filter(d => d.isActive).length;
    const verified = demoDesigners.filter(d => d.isVerified).length;
    const newThisMonth = demoDesigners.filter(d => {
      const createdDate = new Date(d.createdAt);
      const currentDate = new Date();
      return createdDate.getMonth() === currentDate.getMonth() && 
             createdDate.getFullYear() === currentDate.getFullYear();
    }).length;
    
    const avgExperience = Math.round(
      demoDesigners.reduce((sum, d) => sum + d.experience, 0) / demoDesigners.length
    );

    res.json({
      success: true,
      data: {
        total,
        active,
        verified,
        newThisMonth,
        averageExperience: avgExperience
      }
    });
  } catch (error) {
    console.error('Demo get designer stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching designer statistics'
    });
  }
};

export const demoGetDesigners = (req, res) => {
  try {
    const { id } = req.params;
    
    if (id) {
      // Get single designer
      const designer = demoDesigners.find(d => d._id === id);
      if (!designer) {
        return res.status(404).json({
          success: false,
          message: 'Designer not found'
        });
      }
      return res.json({
        success: true,
        data: designer
      });
    }

    // Get all designers with pagination and filters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const filter = req.query.filter || 'all';

    let filteredDesigners = [...demoDesigners];

    // Apply search filter
    if (search) {
      filteredDesigners = filteredDesigners.filter(d => 
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()) ||
        d.address.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'active') {
      filteredDesigners = filteredDesigners.filter(d => d.isActive);
    } else if (filter === 'inactive') {
      filteredDesigners = filteredDesigners.filter(d => !d.isActive);
    } else if (filter === 'verified') {
      filteredDesigners = filteredDesigners.filter(d => d.isVerified);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDesigners = filteredDesigners.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        designers: paginatedDesigners,
        pagination: {
          current: page,
          pages: Math.ceil(filteredDesigners.length / limit),
          total: filteredDesigners.length
        }
      }
    });
  } catch (error) {
    console.error('Demo get designers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching designers'
    });
  }
};

export const demoCreateDesigner = (req, res) => {
  try {
    const {
      name,
      email,
      address,
      experience,
      age,
      phone,
      specialization,
      bio,
      hourlyRate,
      languages
    } = req.body;

    // Check if designer already exists
    const existingDesigner = demoDesigners.find(d => d.email === email);
    if (existingDesigner) {
      return res.status(400).json({
        success: false,
        message: 'Designer with this email already exists'
      });
    }

    // Create new designer
    const newDesigner = {
      _id: `demo_designer_${Date.now()}`,
      name,
      email,
      address: {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'Sri Lanka'
      },
      experience: parseInt(experience),
      age: parseInt(age),
      phone: phone || '',
      specialization: specialization || [],
      bio: bio || '',
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      languages: languages || [],
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    demoDesigners.push(newDesigner);

    res.status(201).json({
      success: true,
      message: 'Designer created successfully',
      data: newDesigner
    });
  } catch (error) {
    console.error('Demo create designer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error creating designer'
    });
  }
};

export const demoUpdateDesigner = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const designerIndex = demoDesigners.findIndex(d => d._id === id);
    if (designerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }

    // Handle toggle status
    if (req.route.path.includes('toggle-status')) {
      demoDesigners[designerIndex].isActive = !demoDesigners[designerIndex].isActive;
      demoDesigners[designerIndex].updatedAt = new Date();
      
      return res.json({
        success: true,
        message: `Designer ${demoDesigners[designerIndex].isActive ? 'activated' : 'deactivated'} successfully`,
        data: demoDesigners[designerIndex]
      });
    }

    // Update designer data
    const designer = demoDesigners[designerIndex];
    Object.keys(updateData).forEach(key => {
      if (key === 'address' && typeof updateData[key] === 'object') {
        designer.address = { ...designer.address, ...updateData[key] };
      } else if (key !== '_id' && key !== 'createdAt') {
        designer[key] = updateData[key];
      }
    });
    designer.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Designer updated successfully',
      data: designer
    });
  } catch (error) {
    console.error('Demo update designer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating designer'
    });
  }
};

export const demoDeleteDesigner = (req, res) => {
  try {
    const { id } = req.params;

    const designerIndex = demoDesigners.findIndex(d => d._id === id);
    if (designerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }

    demoDesigners.splice(designerIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Designer deleted successfully'
    });
  } catch (error) {
    console.error('Demo delete designer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting designer'
    });
  }
};