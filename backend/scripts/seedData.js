import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Design from '../models/Design.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-business-dashboard');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Design.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: '123456', // Will be hashed by the pre-save middleware
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0
    });

    await adminUser.save();
    console.log('✅ Admin user created: admin@gmail.com / 123456');

    // Create test user
    const testUser = new User({
      name: 'John Doe',
      email: 'user@gmail.com',
      password: 'password123', // Will be hashed by the pre-save middleware
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0
    });

    await testUser.save();
    console.log('✅ Test user created: user@gmail.com / password123');

    // Create supplier user
    const supplierUser = new User({
      name: 'Jane Smith',
      email: 'supplier@gmail.com',
      password: 'supplier123', // Will be hashed by the pre-save middleware
      role: 'supplier',
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0
    });

    await supplierUser.save();
    console.log('✅ Supplier user created: supplier@gmail.com / supplier123');

    // Create interior designer user
    const designerUser = new User({
      name: 'Michael Designer',
      email: 'designer@gmail.com',
      password: 'design123', // Will be hashed by the pre-save middleware
      role: 'interior_designer',
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0
    });

    await designerUser.save();
    console.log('✅ Interior Designer user created: designer@gmail.com / design123');

    // Create employee user
    const employeeUser = new User({
      name: 'Sarah Employee',
      email: 'employee@gmail.com',
      password: 'employee123', // Will be hashed by the pre-save middleware
      role: 'employee',
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0
    });

    await employeeUser.save();
    console.log('✅ Employee user created: employee@gmail.com / employee123');

    // Create Categories
    const categories = [
      {
        name: 'Furniture',
        description: 'All types of furniture including chairs, tables, beds, and storage solutions',
        created_by: adminUser._id,
        sort_order: 1
      },
      {
        name: 'Electronics',
        description: 'Electronic devices, gadgets, and accessories',
        created_by: adminUser._id,
        sort_order: 2
      },
      {
        name: 'Home Decor',
        description: 'Decorative items, artwork, and home accessories',
        created_by: adminUser._id,
        sort_order: 3
      },
      {
        name: 'Lighting',
        description: 'Lamps, ceiling lights, and lighting solutions',
        created_by: adminUser._id,
        sort_order: 4
      },
      {
        name: 'Kitchen',
        description: 'Kitchen appliances, cookware, and dining accessories',
        created_by: adminUser._id,
        sort_order: 5
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories.push(category);
    }
    console.log('✅ Categories created');

    // Create Products
    const products = [
      {
        name: 'Modern Office Chair',
        description: 'Ergonomic office chair with lumbar support and adjustable height. Perfect for long working hours.',
        short_description: 'Ergonomic office chair with lumbar support',
        sku: 'CHAIR-001',
        category: createdCategories[0]._id, // Furniture
        brand: 'ErgoComfort',
        tags: ['office', 'chair', 'ergonomic', 'adjustable'],
        price: 299.99,
        cost_price: 180.00,
        compare_at_price: 399.99,
        stock: {
          current: 15,
          low_stock_threshold: 5,
          track_inventory: true
        },
        images: [{
          public_id: 'chair-001',
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
          alt_text: 'Modern office chair',
          is_primary: true
        }],
        dimensions: {
          length: 60,
          width: 65,
          height: 110,
          weight: 18.5,
          unit: 'cm',
          weight_unit: 'kg'
        },
        status: 'active',
        visibility: 'public',
        featured: true,
        created_by: adminUser._id
      },
      {
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with touch controls and USB charging port. Energy efficient and modern design.',
        short_description: 'Adjustable LED desk lamp with USB charging',
        sku: 'LAMP-001',
        category: createdCategories[3]._id, // Lighting
        brand: 'BrightTech',
        tags: ['lamp', 'led', 'desk', 'adjustable', 'usb'],
        price: 79.99,
        cost_price: 45.00,
        stock: {
          current: 25,
          low_stock_threshold: 10,
          track_inventory: true
        },
        images: [{
          public_id: 'lamp-001',
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
          alt_text: 'LED desk lamp',
          is_primary: true
        }],
        dimensions: {
          length: 20,
          width: 20,
          height: 45,
          weight: 1.2,
          unit: 'cm',
          weight_unit: 'kg'
        },
        status: 'active',
        visibility: 'public',
        featured: false,
        created_by: adminUser._id
      },
      {
        name: 'Wireless Bluetooth Speaker',
        description: 'High-quality portable Bluetooth speaker with 360° sound and 12-hour battery life. Perfect for home or travel.',
        short_description: 'Portable Bluetooth speaker with 360° sound',
        sku: 'SPEAKER-001',
        category: createdCategories[1]._id, // Electronics
        brand: 'SoundMax',
        tags: ['speaker', 'bluetooth', 'wireless', 'portable'],
        price: 149.99,
        cost_price: 89.00,
        stock: {
          current: 8,
          low_stock_threshold: 10,
          track_inventory: true
        },
        images: [{
          public_id: 'speaker-001',
          url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
          alt_text: 'Bluetooth speaker',
          is_primary: true
        }],
        dimensions: {
          length: 10,
          width: 10,
          height: 12,
          weight: 0.8,
          unit: 'cm',
          weight_unit: 'kg'
        },
        status: 'active',
        visibility: 'public',
        featured: true,
        created_by: adminUser._id
      },
      {
        name: 'Decorative Wall Art',
        description: 'Beautiful abstract wall art print on high-quality canvas. Adds a modern touch to any room.',
        short_description: 'Abstract canvas wall art',
        sku: 'ART-001',
        category: createdCategories[2]._id, // Home Decor
        brand: 'ArtStudio',
        tags: ['art', 'wall', 'decorative', 'canvas', 'modern'],
        price: 89.99,
        cost_price: 35.00,
        stock: {
          current: 12,
          low_stock_threshold: 5,
          track_inventory: true
        },
        images: [{
          public_id: 'art-001',
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
          alt_text: 'Abstract wall art',
          is_primary: true
        }],
        dimensions: {
          length: 40,
          width: 60,
          height: 2,
          weight: 0.5,
          unit: 'cm',
          weight_unit: 'kg'
        },
        status: 'active',
        visibility: 'public',
        featured: false,
        created_by: adminUser._id
      },
      {
        name: 'Stainless Steel Coffee Maker',
        description: 'Premium 12-cup programmable coffee maker with thermal carafe and auto-shutoff feature.',
        short_description: '12-cup programmable coffee maker',
        sku: 'COFFEE-001',
        category: createdCategories[4]._id, // Kitchen
        brand: 'BrewMaster',
        tags: ['coffee', 'maker', 'kitchen', 'programmable', 'thermal'],
        price: 199.99,
        cost_price: 120.00,
        stock: {
          current: 6,
          low_stock_threshold: 8,
          track_inventory: true
        },
        images: [{
          public_id: 'coffee-001',
          url: 'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=500',
          alt_text: 'Coffee maker',
          is_primary: true
        }],
        dimensions: {
          length: 25,
          width: 35,
          height: 40,
          weight: 3.2,
          unit: 'cm',
          weight_unit: 'kg'
        },
        status: 'active',
        visibility: 'public',
        featured: true,
        created_by: adminUser._id
      },
      {
        name: 'Dining Table Set',
        description: 'Modern 4-seater dining table set with solid wood construction. Includes table and 4 matching chairs.',
        short_description: '4-seater dining table set',
        sku: 'TABLE-001',
        category: createdCategories[0]._id, // Furniture
        brand: 'WoodCraft',
        tags: ['dining', 'table', 'chairs', 'wood', 'furniture'],
        price: 899.99,
        cost_price: 550.00,
        stock: {
          current: 3,
          low_stock_threshold: 5,
          track_inventory: true
        },
        images: [{
          public_id: 'table-001',
          url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500',
          alt_text: 'Dining table set',
          is_primary: true
        }],
        dimensions: {
          length: 120,
          width: 80,
          height: 75,
          weight: 35.0,
          unit: 'cm',
          weight_unit: 'kg'
        },
        status: 'active',
        visibility: 'public',
        featured: true,
        created_by: adminUser._id
      },
      // Test products for search functionality
      {
        name: 'Test Product Basic',
        description: 'This is a test product used to demonstrate search functionality. It contains various test keywords.',
        short_description: 'Basic test product for search functionality',
        sku: 'TEST-001',
        category: createdCategories[1]._id, // Electronics
        brand: 'TestBrand',
        tags: ['test', 'demo', 'search', 'basic'],
        price: 19.99,
        cost_price: 12.00,
        images: [{
          public_id: 'test-basic-001',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          alt_text: 'Test Product Basic',
          is_primary: true
        }],
        dimensions: {
          length: 10,
          width: 8,
          height: 5,
          weight: 0.5
        },
        stock: {
          current: 100,
          track_inventory: true,
          low_stock_threshold: 10,
          available: 100
        },
        seo: {
          meta_title: 'Test Product Basic - Search Demo',
          meta_description: 'Basic test product for search functionality demonstration'
        },
        status: 'active',
        visibility: 'public',
        featured: false,
        created_by: adminUser._id
      },
      {
        name: 'Test1 Advanced Product',
        description: 'An advanced test1 product designed for comprehensive testing and search demonstrations.',
        short_description: 'Advanced test1 product with more features',
        sku: 'TEST1-002',
        category: createdCategories[1]._id, // Electronics
        brand: 'TestBrand',
        tags: ['test1', 'advanced', 'search', 'demo'],
        price: 39.99,
        cost_price: 24.00,
        images: [{
          public_id: 'test1-advanced-001',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          alt_text: 'Test1 Advanced Product',
          is_primary: true
        }],
        dimensions: {
          length: 12,
          width: 10,
          height: 6,
          weight: 0.8
        },
        stock: {
          current: 75,
          track_inventory: true,
          low_stock_threshold: 15,
          available: 75
        },
        seo: {
          meta_title: 'Test1 Advanced Product - Premium Testing',
          meta_description: 'Advanced test1 product for comprehensive search testing'
        },
        status: 'active',
        visibility: 'public',
        featured: false,
        created_by: adminUser._id
      },
      {
        name: 'Test2 Professional Edition',
        description: 'High-end test2 product with professional-grade features for extensive testing scenarios.',
        short_description: 'Professional test2 edition with premium features',
        sku: 'TEST2-003',
        category: createdCategories[1]._id, // Electronics
        brand: 'TestBrand',
        tags: ['test2', 'professional', 'premium', 'search'],
        price: 79.99,
        cost_price: 48.00,
        images: [{
          public_id: 'test2-pro-001',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          alt_text: 'Test2 Professional Edition',
          is_primary: true
        }],
        dimensions: {
          length: 15,
          width: 12,
          height: 8,
          weight: 1.2
        },
        stock: {
          current: 50,
          track_inventory: true,
          low_stock_threshold: 8,
          available: 50
        },
        seo: {
          meta_title: 'Test2 Professional Edition - Premium Testing Suite',
          meta_description: 'Professional test2 product with premium features'
        },
        status: 'active',
        visibility: 'public',
        featured: true,
        created_by: adminUser._id
      },
      {
        name: 'Super Test3 Ultimate',
        description: 'The ultimate test3 product combining all features in one comprehensive testing package.',
        short_description: 'Ultimate test3 product with all features',
        sku: 'TEST3-004',
        category: createdCategories[1]._id, // Electronics
        brand: 'TestBrand',
        tags: ['test3', 'ultimate', 'comprehensive', 'search'],
        price: 159.99,
        cost_price: 95.00,
        images: [{
          public_id: 'test3-ultimate-001',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          alt_text: 'Super Test3 Ultimate',
          is_primary: true
        }],
        dimensions: {
          length: 20,
          width: 15,
          height: 10,
          weight: 2.0
        },
        stock: {
          current: 25,
          track_inventory: true,
          low_stock_threshold: 5,
          available: 25
        },
        seo: {
          meta_title: 'Super Test3 Ultimate - Complete Testing Solution',
          meta_description: 'Ultimate test3 product with comprehensive features'
        },
        status: 'active',
        visibility: 'public',
        featured: true,
        created_by: adminUser._id
      },
      {
        name: 'Sample Testing Device',
        description: 'A sample testing device used for quality assurance and comprehensive testing procedures.',
        short_description: 'Sample device for testing various functionalities',
        sku: 'SAMPLE-005',
        category: createdCategories[1]._id, // Electronics
        brand: 'TestBrand',
        tags: ['sample', 'testing', 'device', 'search'],
        price: 29.99,
        cost_price: 18.00,
        images: [{
          public_id: 'sample-test-001',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          alt_text: 'Sample Testing Device',
          is_primary: true
        }],
        dimensions: {
          length: 8,
          width: 6,
          height: 4,
          weight: 0.3
        },
        stock: {
          current: 120,
          track_inventory: true,
          low_stock_threshold: 20,
          available: 120
        },
        seo: {
          meta_title: 'Sample Testing Device - Quality Assurance Tool',
          meta_description: 'Sample device for comprehensive testing procedures'
        },
        status: 'active',
        visibility: 'public',
        featured: false,
        created_by: adminUser._id
      }
    ];

    const createdProducts = [];
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      createdProducts.push(product);
    }
    console.log('✅ Products created');

    // Create sample designs
    const designs = [
      {
        projectName: 'Modern Living Room Design',
        clientName: 'Sarah Johnson',
        contact: 'sarah.johnson@email.com',
        status: 'Completed',
        description: 'A contemporary living room design featuring minimalist furniture, neutral color palette, and strategic lighting to create a warm and inviting space.',
        imageURL: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
      },
      {
        projectName: 'Cozy Bedroom Retreat',
        clientName: 'Michael Chen',
        contact: 'michael.chen@email.com',
        status: 'In Progress',
        description: 'Creating a peaceful bedroom sanctuary with soft textures, calming colors, and functional storage solutions for a restful sleep environment.',
        imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
      },
      {
        projectName: 'Elegant Dining Space',
        clientName: 'Emily Davis',
        contact: 'emily.davis@email.com',
        status: 'Review',
        description: 'Sophisticated dining room design with a large wooden table, statement lighting, and elegant decor pieces for entertaining guests.',
        imageURL: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800'
      },
      {
        projectName: 'Home Office Setup',
        clientName: 'David Wilson',
        contact: 'david.wilson@email.com',
        status: 'Completed',
        description: 'Professional home office design with ergonomic furniture, proper lighting, and organized storage to maximize productivity.',
        imageURL: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
      },
      {
        projectName: 'Kitchen Renovation',
        clientName: 'Lisa Anderson',
        contact: 'lisa.anderson@email.com',
        status: 'In Progress',
        description: 'Complete kitchen makeover with modern appliances, custom cabinetry, and an open-concept layout for better functionality.',
        imageURL: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
      },
      {
        projectName: 'Kids Playroom',
        clientName: 'Robert Taylor',
        contact: 'robert.taylor@email.com',
        status: 'Review',
        description: 'Fun and safe playroom design with colorful furniture, creative storage solutions, and educational elements for children.',
        imageURL: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
      }
    ];

    const createdDesigns = [];
    for (const designData of designs) {
      const design = new Design(designData);
      await design.save();
      createdDesigns.push(design);
    }
    console.log('✅ Designs created');

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@gmail.com / 123456');
    console.log('User: user@gmail.com / password123');
    console.log('Supplier: supplier@gmail.com / supplier123');
    console.log('Designer: designer@gmail.com / design123');
    console.log('Employee: employee@gmail.com / employee123');
    console.log('\n📦 Sample Data:');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Designs: ${createdDesigns.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData();