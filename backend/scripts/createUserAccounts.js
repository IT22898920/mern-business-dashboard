import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import User model
import User from '../models/User.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create user accounts with 123456 password
const createUserAccounts = async () => {
  try {
    const usersToCreate = [
      { email: 'user@gmail.com', name: 'Regular User', role: 'user', password: '123456' },
      { email: 'user1@gmail.com', name: 'User One', role: 'user', password: '123456' },
      { email: 'user@example.com', name: 'Test User', role: 'user', password: '123456' },
      { email: 'testuser@example.com', name: 'Test User Two', role: 'user', password: '123456' }
    ];

    console.log('🔧 Creating user accounts...\n');

    for (const userData of usersToCreate) {
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        // Update existing user
        user.password = userData.password;
        user.isEmailVerified = true;
        user.isActive = true;
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        console.log(`✅ Updated existing user: ${userData.email} → Role: ${userData.role}, Password: ${userData.password}`);
      } else {
        // Create new user
        user = new User({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          isEmailVerified: true,
          isActive: true
        });
        await user.save();
        console.log(`✅ Created new user: ${userData.email} → Role: ${userData.role}, Password: ${userData.password}`);
      }
    }

    console.log('\n📋 User accounts ready for login:');
    console.log('   🔐 Admin Accounts:');
    console.log('      - admin@gmail.com / 123456 (admin)');
    console.log('      - admin@example.com / 123456 (admin)');
    console.log('   👤 User Accounts:');
    console.log('      - user@gmail.com / 123456 (user)');
    console.log('      - user1@gmail.com / 123456 (user)');
    console.log('      - user@example.com / 123456 (user)');
    console.log('      - testuser@example.com / 123456 (user)');
    console.log('   🏪 Other Roles:');
    console.log('      - supplier@gmail.com / supplier123 (supplier)');
    console.log('      - employee@gmail.com / employee123 (employee)');
    console.log('      - designer@gmail.com / designer123 (interior_designer)');

    // List all users in database
    console.log('\n📊 All users in database:');
    const allUsers = await User.find({}, 'name email role isActive isEmailVerified');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Active: ${user.isActive}, Verified: ${user.isEmailVerified}`);
    });

  } catch (error) {
    console.error('❌ Error creating user accounts:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createUserAccounts();
  
  console.log('\n✅ Process completed!');
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});