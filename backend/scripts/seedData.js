import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-business-dashboard');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

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

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@gmail.com / 123456');
    console.log('User: user@gmail.com / password123');
    console.log('Supplier: supplier@gmail.com / supplier123');
    console.log('Designer: designer@gmail.com / design123');
    console.log('Employee: employee@gmail.com / employee123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData();