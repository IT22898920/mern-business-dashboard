import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

// Reset passwords for specific users
const resetUserPasswords = async () => {
  try {
    // Common test accounts to reset
    const usersToReset = [
      { email: 'admin@example.com', newPassword: 'admin123', role: 'admin' },
      { email: 'user@example.com', newPassword: 'user123', role: 'user' },
      { email: 'supplier@example.com', newPassword: 'supplier123', role: 'supplier' },
      { email: 'employee@example.com', newPassword: 'employee123', role: 'employee' },
      { email: 'designer@example.com', newPassword: 'designer123', role: 'interior_designer' }
    ];

    for (const userData of usersToReset) {
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        // Update existing user's password
        user.password = userData.newPassword;
        user.isEmailVerified = true; // Auto-verify for test accounts
        user.isActive = true;
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        console.log(`✅ Updated password for existing user: ${userData.email}`);
      } else {
        // Create new user with specified password
        user = new User({
          name: userData.role.charAt(0).toUpperCase() + userData.role.slice(1).replace('_', ' '),
          email: userData.email,
          password: userData.newPassword,
          role: userData.role,
          isEmailVerified: true,
          isActive: true
        });
        await user.save();
        console.log(`✅ Created new user: ${userData.email} with role: ${userData.role}`);
      }
    }

    // List all users in the database
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}, 'name email role isActive isEmailVerified');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Active: ${user.isActive}, Verified: ${user.isEmailVerified}`);
    });

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  }
};

// Fix existing users with potential password issues
const fixExistingUsers = async () => {
  try {
    // Find all users
    const users = await User.find({}).select('+password');
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Check if password exists and is properly hashed
      if (!user.password || user.password.length < 20) {
        console.log(`⚠️  User ${user.email} has invalid password hash`);
        
        // Set a default password for users with invalid passwords
        const defaultPassword = user.email.split('@')[0] + '123';
        user.password = defaultPassword;
        needsUpdate = true;
        console.log(`   → Setting password to: ${defaultPassword}`);
      }
      
      // Ensure all users have required fields
      if (user.isActive === undefined) {
        user.isActive = true;
        needsUpdate = true;
      }
      
      if (user.loginAttempts === undefined) {
        user.loginAttempts = 0;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        console.log(`   ✅ Updated user: ${user.email}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing existing users:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🔧 Starting password reset and user fix process...\n');
  
  // First fix any existing users with issues
  await fixExistingUsers();
  
  // Then reset/create test accounts
  await resetUserPasswords();
  
  console.log('\n✅ Process completed!');
  console.log('\n🔑 You can now login with these test accounts:');
  console.log('   - admin@example.com / admin123');
  console.log('   - user@example.com / user123');
  console.log('   - supplier@example.com / supplier123');
  console.log('   - employee@example.com / employee123');
  console.log('   - designer@example.com / designer123');
  console.log('\n   For other users, password is: [username]123 (e.g., john@example.com → john123)');
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});