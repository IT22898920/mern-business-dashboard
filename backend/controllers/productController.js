import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import StockMovement from '../models/StockMovement.js';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { uploadProductImage, uploadMultipleProductImages } from '../config/cloudinary.js';

// Demo products data for testing without database
const demoProducts = [
  {
    _id: 'demo_product_1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    sku: 'PWH-001',
    short_description: 'High-quality wireless headphones with noise cancellation',
    description: 'Premium wireless headphones featuring advanced noise cancellation technology and superior sound quality.',
    price: 299.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      alt_text: 'Premium Wireless Headphones'
    }],
    stock: {
      current: 45,
      track_inventory: true,
      low_stock_threshold: 10
    },
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    _id: 'demo_product_2',
    name: 'Smart Coffee Maker',
    slug: 'smart-coffee-maker',
    sku: 'SCM-002',
    short_description: 'WiFi-enabled coffee maker with app control',
    description: 'Smart coffee maker that can be controlled via smartphone app with programmable settings.',
    price: 199.99,
    category: {
      _id: 'demo_appliances',
      name: 'Home Appliances'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      alt_text: 'Smart Coffee Maker'
    }],
    stock: {
      current: 23,
      track_inventory: true,
      low_stock_threshold: 5
    },
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    _id: 'demo_product_3',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-t-shirt',
    sku: 'OCT-003',
    short_description: '100% organic cotton comfortable t-shirt',
    description: 'Soft and comfortable t-shirt made from 100% organic cotton, available in multiple colors.',
    price: 29.99,
    category: {
      _id: 'demo_clothing',
      name: 'Clothing'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      alt_text: 'Organic Cotton T-Shirt'
    }],
    stock: {
      current: 8,
      track_inventory: true,
      low_stock_threshold: 10
    },
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16')
  },
  {
    _id: 'demo_product_4',
    name: 'Professional Camera Lens',
    slug: 'professional-camera-lens',
    sku: 'PCL-004',
    short_description: '85mm f/1.4 portrait lens for professional photography',
    description: 'High-quality 85mm f/1.4 portrait lens perfect for professional photography with beautiful bokeh.',
    price: 899.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1606983340077-ab4cd335d6ac?w=400',
      alt_text: 'Professional Camera Lens'
    }],
    stock: {
      current: 0,
      track_inventory: true,
      low_stock_threshold: 3
    },
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22')
  },
  {
    _id: 'demo_product_5',
    name: 'Eco-Friendly Water Bottle',
    slug: 'eco-friendly-water-bottle',
    sku: 'EWB-005',
    short_description: 'Sustainable stainless steel water bottle',
    description: 'Durable and eco-friendly stainless steel water bottle that keeps drinks cold for 24 hours.',
    price: 39.99,
    category: {
      _id: 'demo_lifestyle',
      name: 'Lifestyle'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      alt_text: 'Eco-Friendly Water Bottle'
    }],
    stock: {
      current: 67,
      track_inventory: true,
      low_stock_threshold: 15
    },
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-19')
  },
  {
    _id: 'demo_product_6',
    name: 'Bluetooth Gaming Mouse',
    slug: 'bluetooth-gaming-mouse',
    sku: 'BGM-006',
    short_description: 'High-precision wireless gaming mouse',
    description: 'Wireless gaming mouse with high DPI sensor and customizable RGB lighting.',
    price: 79.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      alt_text: 'Bluetooth Gaming Mouse'
    }],
    stock: {
      current: 34,
      track_inventory: true,
      low_stock_threshold: 8
    },
    status: 'draft',
    featured: false,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-17')
  },
  // Test products for search functionality
  {
    _id: 'demo_test_1',
    name: 'Test Product Basic',
    slug: 'test-product-basic',
    sku: 'TEST-001',
    short_description: 'Basic test product for search functionality',
    description: 'This is a test product used to demonstrate search functionality.',
    price: 19.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      alt_text: 'Test Product'
    }],
    stock: {
      current: 10,
      track_inventory: true,
      low_stock_threshold: 5
    },
    status: 'active',
    featured: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    _id: 'demo_test_2',
    name: 'Test1 Advanced Product',
    slug: 'test1-advanced-product',
    sku: 'TEST1-002',
    short_description: 'Advanced test1 product with more features',
    description: 'An advanced test1 product designed for comprehensive testing.',
    price: 39.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      alt_text: 'Test1 Product'
    }],
    stock: {
      current: 15,
      track_inventory: true,
      low_stock_threshold: 5
    },
    status: 'active',
    featured: false,
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02')
  },
  {
    _id: 'demo_test_3',
    name: 'Test2 Professional Edition',
    slug: 'test2-professional-edition',
    sku: 'TEST2-003',
    short_description: 'Professional test2 edition with premium features',
    description: 'High-end test2 product with professional-grade features.',
    price: 79.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      alt_text: 'Test2 Product'
    }],
    stock: {
      current: 8,
      track_inventory: true,
      low_stock_threshold: 3
    },
    status: 'active',
    featured: true,
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03')
  },
  {
    _id: 'demo_test_4',
    name: 'Super Test3 Ultimate',
    slug: 'super-test3-ultimate',
    sku: 'TEST3-004',
    short_description: 'Ultimate test3 product with all features',
    description: 'The ultimate test3 product combining all features in one package.',
    price: 159.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      alt_text: 'Test3 Product'
    }],
    stock: {
      current: 5,
      track_inventory: true,
      low_stock_threshold: 2
    },
    status: 'active',
    featured: true,
    createdAt: new Date('2024-02-04'),
    updatedAt: new Date('2024-02-04')
  },
  {
    _id: 'demo_sample_5',
    name: 'Sample Testing Device',
    slug: 'sample-testing-device',
    sku: 'SAMPLE-005',
    short_description: 'Sample device for testing various functionalities',
    description: 'A sample testing device used for quality assurance and testing.',
    price: 29.99,
    category: {
      _id: 'demo_electronics',
      name: 'Electronics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      alt_text: 'Sample Testing Device'
    }],
    stock: {
      current: 12,
      track_inventory: true,
      low_stock_threshold: 4
    },
    status: 'active',
    featured: false,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  }
];

// Demo product stats
const demoStats = {
  totalProducts: demoProducts.length,
  activeProducts: demoProducts.filter(p => p.status === 'active').length,
  lowStockProducts: demoProducts.filter(p => p.stock.current <= p.stock.low_stock_threshold).length,
  outOfStockProducts: demoProducts.filter(p => p.stock.current === 0).length,
  featuredProducts: demoProducts.filter(p => p.featured).length
};

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      inStock,
      featured,
      lowStock
    } = req.query;

    // If MongoDB is not connected, return demo products
    if (!isMongoConnected()) {
      console.log('🔍 Using demo products (database not connected)');
      
      let filteredProducts = [...demoProducts];
      
      // Apply filters
      if (status && status !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.status === status);
      }
      
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category._id === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase().trim();
        
        // Enhanced search with scoring for better results
        filteredProducts = filteredProducts.map(p => {
          let score = 0;
          const name = p.name.toLowerCase();
          const shortDesc = p.short_description.toLowerCase();
          const description = p.description ? p.description.toLowerCase() : '';
          const sku = p.sku.toLowerCase();
          const categoryName = p.category?.name ? p.category.name.toLowerCase() : '';
          
          // Exact matches get highest score
          if (name === searchLower) score += 100;
          if (sku === searchLower) score += 90;
          
          // Starts with matches get high score
          if (name.startsWith(searchLower)) score += 80;
          if (sku.startsWith(searchLower)) score += 70;
          if (shortDesc.startsWith(searchLower)) score += 60;
          
          // Contains matches get medium score
          if (name.includes(searchLower)) score += 50;
          if (sku.includes(searchLower)) score += 40;
          if (shortDesc.includes(searchLower)) score += 30;
          if (description.includes(searchLower)) score += 20;
          if (categoryName.includes(searchLower)) score += 10;
          
          // Word-based matching for better partial matches
          const searchWords = searchLower.split(/\s+/);
          searchWords.forEach(word => {
            if (word.length > 1) { // Ignore single character words
              if (name.includes(word)) score += 25;
              if (shortDesc.includes(word)) score += 15;
              if (description.includes(word)) score += 10;
              if (sku.includes(word)) score += 20;
            }
          });
          
          return { ...p, searchScore: score };
        })
        .filter(p => p.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore); // Sort by relevance
        
        console.log(`🔍 Search for "${search}" found ${filteredProducts.length} results`);
      }
      
      // Apply sorting (skip if search is active as results are already sorted by relevance)
      if (!search || search.trim() === '') {
        filteredProducts.sort((a, b) => {
          const order = sortOrder === 'desc' ? -1 : 1;
          if (sortBy === 'price') {
            return (a.price - b.price) * order;
          } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name) * order;
          } else { // createdAt
            return (new Date(a.createdAt) - new Date(b.createdAt)) * order;
          }
        });
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return res.json({
        status: 'success',
        data: paginatedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredProducts.length / limit),
          totalProducts: filteredProducts.length,
          limit: parseInt(limit)
        },
        source: 'demo'
      });
    }

    // Build query
    const query = {};

    // Enhanced search in name, description, SKU, and tags
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive regex
      query.$or = [
        { name: { $regex: searchRegex } },
        { sku: { $regex: searchRegex } },
        { short_description: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
        { brand: { $regex: searchRegex } }
      ];
      console.log(`🔍 MongoDB search for "${search}" using regex`);
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by stock availability
    if (inStock === 'true') {
      query['stock.available'] = { $gt: 0 };
    }

    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Filter by low stock
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock.available', '$stock.low_stock_threshold'] };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .populate('supplier', 'name email')
        .populate('created_by', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNextPage: skip + Number(limit) < total,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // If MongoDB is not connected, return demo product
    if (!isMongoConnected()) {
      console.log('🔍 Using demo product (database not connected)');
      const product = demoProducts.find(p => p._id === id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      return res.json({
        status: 'success',
        data: product,
        source: 'demo'
      });
    }
    
    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .populate('subcategory', 'name slug description')
      .populate('supplier', 'name email phone')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // If MongoDB is not connected, simulate product creation
    if (!isMongoConnected()) {
      console.log('🔍 Using demo mode for product creation (database not connected)');
      
      const productData = { ...req.body };
      
      // Generate demo ID and SKU
      const demoId = `demo_product_${Date.now()}`;
      if (!productData.sku) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        productData.sku = `PRD-${timestamp}-${random}`;
      }
      
      const newProduct = {
        _id: demoId,
        ...productData,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: productData.status || 'draft'
      };
      
      // Add to demo products array (in memory)
      demoProducts.push(newProduct);
      
      return res.status(201).json({
        status: 'success',
        message: 'Product created successfully (demo mode)',
        data: newProduct,
        source: 'demo'
      });
    }

    const productData = {
      ...req.body,
      created_by: req.user.id
    };

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      productData.sku = `PRD-${timestamp}-${random}`;
    }

    // Handle image uploads to Cloudinary if images are provided
    if (productData.images && productData.images.length > 0) {
      try {
        const uploadedImages = [];
        
        for (const image of productData.images) {
          // Only upload if it's a base64 data URI (starts with data:image/)
          if (image.url && image.url.startsWith('data:image/')) {
            const uploadResult = await uploadProductImage(image.url);
            uploadedImages.push({
              public_id: uploadResult.public_id,
              url: uploadResult.url,
              alt_text: image.alt_text || productData.name,
              is_primary: image.is_primary || false
            });
          } else {
            // Keep existing URL-based images
            uploadedImages.push(image);
          }
        }
        
        productData.images = uploadedImages;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images to Cloudinary',
          error: uploadError.message
        });
      }
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    // Populate references
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'subcategory', select: 'name slug' },
      { path: 'supplier', select: 'name email' },
      { path: 'created_by', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Product with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // If MongoDB is not connected, simulate product update
    if (!isMongoConnected()) {
      console.log('🔍 Using demo mode for product update (database not connected)');
      
      const productIndex = demoProducts.findIndex(p => p._id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Update demo product
      demoProducts[productIndex] = {
        ...demoProducts[productIndex],
        ...req.body,
        updatedAt: new Date()
      };
      
      return res.json({
        status: 'success',
        message: 'Product updated successfully (demo mode)',
        data: demoProducts[productIndex],
        source: 'demo'
      });
    }

    // Get original product to track stock changes
    const originalProduct = await Product.findById(id);
    
    const updateData = {
      ...req.body,
      updated_by: req.user.id
    };

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name slug' },
      { path: 'subcategory', select: 'name slug' },
      { path: 'supplier', select: 'name email' },
      { path: 'created_by', select: 'name email' },
      { path: 'updated_by', select: 'name email' }
    ]);

    // Track stock movement if stock changed
    if (originalProduct && req.body.stock && originalProduct.stock.current !== req.body.stock.current) {
      const previousStock = originalProduct.stock.current || 0;
      const newStock = req.body.stock.current || 0;
      const quantityChange = newStock - previousStock;
      
      try {
        await StockMovement.createMovement({
          product: product._id,
          type: quantityChange > 0 ? 'adjustment_in' : 'adjustment_out',
          quantity: Math.abs(quantityChange),
          previous_stock: previousStock,
          new_stock: newStock,
          reason: req.body.adjustment_reason || 'manual_adjustment',
          notes: req.body.adjustment_notes || `Stock adjusted from ${previousStock} to ${newStock}`,
          created_by: req.user.id,
          unit_cost: product.cost_price || 0,
          reference_type: 'adjustment',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            system_generated: false
          }
        });
      } catch (error) {
        console.error('Error creating stock movement:', error);
        // Don't fail the main update if stock movement fails
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Product with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // If MongoDB is not connected, simulate product deletion
    if (!isMongoConnected()) {
      console.log('🔍 Using demo mode for product deletion (database not connected)');
      
      const productIndex = demoProducts.findIndex(p => p._id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Remove from demo products array
      demoProducts.splice(productIndex, 1);
      
      return res.json({
        status: 'success',
        message: 'Product deleted successfully (demo mode)',
        source: 'demo'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    // If MongoDB is not connected, return demo stats
    if (!isMongoConnected()) {
      console.log('🔍 Using demo product stats (database not connected)');
      
      const totalValue = demoProducts
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + (p.price * p.stock.current), 0);
        
      const recentProducts = demoProducts
        .filter(p => p.status === 'active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(p => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          stock: { current: p.stock.current },
          images: p.images,
          category: p.category
        }));
      
      return res.json({
        status: 'success',
        data: {
          totalProducts: demoStats.totalProducts,
          activeProducts: demoStats.activeProducts,
          lowStockProducts: demoStats.lowStockProducts,
          outOfStockProducts: demoStats.outOfStockProducts,
          totalValue,
          recentProducts
        },
        source: 'demo'
      });
    }

    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      recentProducts
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({
        'stock.track_inventory': true,
        $expr: { $lte: ['$stock.available', '$stock.low_stock_threshold'] }
      }),
      Product.countDocuments({
        'stock.track_inventory': true,
        'stock.available': { $lte: 0 }
      }),
      Product.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock.current'] } } } }
      ]),
      Product.find({ status: 'active' })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name price stock.current images')
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue: totalValue[0]?.total || 0,
        recentProducts
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
};

// Update stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;

    if (!type || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Type, quantity, and reason are required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.addStockHistory(type, quantity, reason, req.user.id);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        current_stock: product.stock.current,
        available_stock: product.stock.available
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Get stock history
export const getStockHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      type, 
      reason 
    } = req.query;

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If MongoDB is not connected, return demo stock history
    if (!isMongoConnected()) {
      console.log('🔍 Using demo stock history (database not connected)');
      
      // Generate demo stock movements for the product
      const demoMovements = [
        {
          _id: 'mov_1',
          type: 'initial_stock',
          quantity: 50,
          previous_stock: 0,
          new_stock: 50,
          reason: 'initial_setup',
          notes: 'Initial stock setup',
          movement_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          created_by: { name: 'System', email: 'system@example.com' },
          description: 'Initial Stock',
          direction: 'in',
          unit_cost: product.cost_price || product.price * 0.6,
          total_cost: 50 * (product.cost_price || product.price * 0.6)
        },
        {
          _id: 'mov_2',
          type: 'sale',
          quantity: 15,
          previous_stock: 50,
          new_stock: 35,
          reason: 'stock_sold',
          notes: 'Online sale - Order #12345',
          movement_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          created_by: { name: 'John Doe', email: 'john@example.com' },
          description: 'Sale',
          direction: 'out',
          unit_cost: product.cost_price || product.price * 0.6,
          total_cost: 15 * (product.cost_price || product.price * 0.6)
        },
        {
          _id: 'mov_3',
          type: 'adjustment_in',
          quantity: 10,
          previous_stock: 35,
          new_stock: 45,
          reason: 'inventory_count',
          notes: 'Stock adjustment after inventory count',
          movement_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          created_by: { name: 'Jane Smith', email: 'jane@example.com' },
          description: 'Stock Adjustment (Increase)',
          direction: 'in',
          unit_cost: product.cost_price || product.price * 0.6,
          total_cost: 10 * (product.cost_price || product.price * 0.6)
        },
        {
          _id: 'mov_4',
          type: 'damage_loss',
          quantity: 3,
          previous_stock: 45,
          new_stock: 42,
          reason: 'damaged_goods',
          notes: 'Items damaged during transport',
          movement_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          created_by: { name: 'Mike Wilson', email: 'mike@example.com' },
          description: 'Damaged/Lost',
          direction: 'out',
          unit_cost: product.cost_price || product.price * 0.6,
          total_cost: 3 * (product.cost_price || product.price * 0.6)
        }
      ];
      
      return res.json({
        status: 'success',
        data: {
          movements: demoMovements,
          pagination: {
            currentPage: Number(page),
            totalPages: 1,
            totalMovements: demoMovements.length,
            hasMore: false
          },
          summary: {
            total_in: 60,
            total_out: 18,
            net_movement: 42,
            current_stock: product.stock?.current || 0
          }
        },
        source: 'demo'
      });
    }

    // Get real stock movements from database
    const options = {
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      startDate,
      endDate,
      type,
      reason
    };

    const movements = await StockMovement.getProductHistory(id, options);
    
    // Get total count for pagination
    const query = { product: id };
    if (startDate || endDate) {
      query.movement_date = {};
      if (startDate) query.movement_date.$gte = new Date(startDate);
      if (endDate) query.movement_date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (reason) query.reason = reason;
    
    const totalMovements = await StockMovement.countDocuments(query);
    const totalPages = Math.ceil(totalMovements / Number(limit));

    // Calculate summary statistics
    const summaryStats = await StockMovement.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$direction',
          total_quantity: { $sum: '$quantity' },
          total_cost: { $sum: '$total_cost' }
        }
      }
    ]);

    const summary = {
      total_in: summaryStats.find(s => s._id === 'in')?.total_quantity || 0,
      total_out: summaryStats.find(s => s._id === 'out')?.total_quantity || 0,
      net_movement: (summaryStats.find(s => s._id === 'in')?.total_quantity || 0) - 
                   (summaryStats.find(s => s._id === 'out')?.total_quantity || 0),
      current_stock: product.stock?.current || 0,
      total_value_in: summaryStats.find(s => s._id === 'in')?.total_cost || 0,
      total_value_out: summaryStats.find(s => s._id === 'out')?.total_cost || 0
    };

    res.json({
      success: true,
      data: {
        movements,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalMovements,
          hasMore: Number(page) < totalPages
        },
        summary
      }
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock history',
      error: error.message
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, category, priceMin, priceMax, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // If MongoDB is not connected, search demo products
    if (!isMongoConnected()) {
      console.log('🔍 Searching demo products (database not connected)');
      
      const queryLower = q.toLowerCase();
      let filteredProducts = demoProducts.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        p.short_description.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.sku.toLowerCase().includes(queryLower)
      );
      
      // Apply category filter
      if (category) {
        filteredProducts = filteredProducts.filter(p => 
          p.category._id === category || p.category.name.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Apply price filters
      if (priceMin || priceMax) {
        filteredProducts = filteredProducts.filter(p => {
          if (priceMin && p.price < Number(priceMin)) return false;
          if (priceMax && p.price > Number(priceMax)) return false;
          return true;
        });
      }
      
      // Limit results
      const results = filteredProducts.slice(0, Number(limit));
      
      return res.json({
        status: 'success',
        data: results,
        source: 'demo'
      });
    }

    const options = {};
    if (category) options.category = category;
    if (priceMin || priceMax) {
      options.priceRange = {};
      if (priceMin) options.priceRange.min = Number(priceMin);
      if (priceMax) options.priceRange.max = Number(priceMax);
    }

    const products = await Product.searchProducts(q, options)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.getLowStockProducts()
      .populate('category', 'name')
      .select('name sku stock price images')
      .limit(50);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.getOutOfStockProducts()
      .populate('category', 'name')
      .select('name sku stock price images')
      .limit(50);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get out of stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch out of stock products',
      error: error.message
    });
  }
};

// Bulk update products
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { ...updateData, updated_by: req.user.id }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update products',
      error: error.message
    });
  }
};

// Duplicate product
export const duplicateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const originalProduct = await Product.findById(id);
    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const duplicateData = originalProduct.toObject();
    delete duplicateData._id;
    delete duplicateData.slug;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.sales;
    delete duplicateData.ratings;
    delete duplicateData.stock_history;

    // Modify name and SKU
    duplicateData.name = `${duplicateData.name} (Copy)`;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    duplicateData.sku = `PRD-${timestamp}-${random}`;
    duplicateData.created_by = req.user.id;
    duplicateData.status = 'draft';

    const newProduct = new Product(duplicateData);
    await newProduct.save();

    await newProduct.populate([
      { path: 'category', select: 'name slug' },
      { path: 'created_by', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate product',
      error: error.message
    });
  }
};

// Get inventory statistics
export const getInventoryStats = async (req, res) => {
  try {
    // If MongoDB is not connected, return demo stats
    if (!isMongoConnected()) {
      console.log('🔍 Using demo inventory stats (database not connected)');
      
      const inventoryStats = {
        totalProducts: demoProducts.length,
        lowStockProducts: demoProducts.filter(p => 
          p.stock?.track_inventory && 
          p.stock?.current <= (p.stock?.low_stock_threshold || 10) && 
          p.stock?.current > 0
        ).length,
        outOfStockProducts: demoProducts.filter(p => 
          p.stock?.track_inventory && 
          (p.stock?.current || 0) <= 0
        ).length,
        totalStockValue: demoProducts.reduce((total, product) => {
          const current = product.stock?.current || 0;
          const costPrice = product.cost_price || product.price * 0.6;
          return total + (current * costPrice);
        }, 0)
      };
      
      return res.json({
        status: 'success',
        data: inventoryStats,
        source: 'demo'
      });
    }

    // Get real inventory stats from database
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      stockValue
    ] = await Promise.all([
      // Total products
      Product.countDocuments(),
      
      // Low stock products
      Product.countDocuments({
        'stock.track_inventory': true,
        $expr: {
          $and: [
            { $gt: ['$stock.current', 0] },
            { $lte: ['$stock.current', '$stock.low_stock_threshold'] }
          ]
        }
      }),
      
      // Out of stock products
      Product.countDocuments({
        'stock.track_inventory': true,
        'stock.current': { $lte: 0 }
      }),
      
      // Total stock value
      Product.aggregate([
        { $match: { 'stock.track_inventory': true } },
        {
          $addFields: {
            stockValue: {
              $multiply: [
                { $ifNull: ['$stock.current', 0] },
                { $ifNull: ['$cost_price', { $multiply: ['$price', 0.6] }] }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$stockValue' }
          }
        }
      ])
    ]);

    const totalStockValue = stockValue.length > 0 ? stockValue[0].totalValue : 0;

    const inventoryStats = {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue
    };

    res.json({
      status: 'success',
      data: inventoryStats
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory statistics',
      error: error.message
    });
  }
};

// Get stock movement statistics
export const getStockMovementStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If MongoDB is not connected, return demo stats
    if (!isMongoConnected()) {
      console.log('🔍 Using demo movement stats (database not connected)');
      
      const demoStats = [
        { _id: 'adjustment_in', total_quantity: 60, total_movements: 2, avg_quantity: 30, total_cost: 600 },
        { _id: 'sale', total_quantity: 15, total_movements: 1, avg_quantity: 15, total_cost: 150 },
        { _id: 'damage_loss', total_quantity: 3, total_movements: 1, avg_quantity: 3, total_cost: 30 }
      ];
      
      return res.json({
        status: 'success',
        data: demoStats,
        source: 'demo'
      });
    }

    const stats = await StockMovement.getMovementStats(id, days);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stock movement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock movement statistics',
      error: error.message
    });
  }
};

// Create manual stock movement
export const createStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      quantity,
      reason,
      notes,
      unit_cost,
      reference_number,
      batch_number,
      expiry_date
    } = req.body;

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Type and quantity are required'
      });
    }

    // If MongoDB is not connected, simulate movement creation
    if (!isMongoConnected()) {
      console.log('🔍 Simulating stock movement creation (database not connected)');
      
      return res.json({
        status: 'success',
        message: 'Stock movement created successfully (demo mode)',
        data: {
          _id: 'demo_movement_' + Date.now(),
          product: { _id: id, name: product.name },
          type,
          quantity: Number(quantity),
          reason: reason || 'other',
          notes,
          movement_date: new Date(),
          created_by: { name: 'Demo User', email: 'demo@example.com' }
        },
        source: 'demo'
      });
    }

    const previousStock = product.stock?.current || 0;
    const isInbound = ['adjustment_in', 'purchase', 'return_in', 'transfer_in', 'production_in', 'initial_stock'].includes(type);
    const newStock = isInbound 
      ? previousStock + Number(quantity)
      : Math.max(0, previousStock - Number(quantity));

    // Update product stock
    await Product.findByIdAndUpdate(id, {
      'stock.current': newStock,
      updated_by: req.user.id
    });

    // Create stock movement record
    const movement = await StockMovement.createMovement({
      product: id,
      type,
      quantity: Number(quantity),
      previous_stock: previousStock,
      new_stock: newStock,
      reason: reason || 'other',
      notes,
      created_by: req.user.id,
      unit_cost: unit_cost || product.cost_price || 0,
      reference_type: 'manual',
      reference_number,
      batch_number,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      metadata: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        system_generated: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Stock movement created successfully',
      data: movement
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stock movement',
      error: error.message
    });
  }
};