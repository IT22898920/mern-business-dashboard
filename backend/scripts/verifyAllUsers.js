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

// Verify all users (set isEmailVerified to true)
const verifyAllUsers = async () => {
  try {
    console.log('🔧 Updating all users to verified status...\n');

    // Update all users to have isEmailVerified: true and isActive: true
    const result = await User.updateMany(
      {},
      {
        $set: {
          isEmailVerified: true,
          isActive: true,
          loginAttempts: 0,
          lockUntil: null
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to verified status`);

    // Show updated user list
    console.log('\n📋 All users after verification update:');
    const allUsers = await User.find({}, 'name email role isActive isEmailVerified').sort({ role: 1, email: 1 });
    
    const groupedUsers = allUsers.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});

    Object.keys(groupedUsers).forEach(role => {
      const roleEmoji = {
        'admin': '🔐',
        'user': '👤', 
        'supplier': '🏪',
        'employee': '💼',
        'interior_designer': '🎨'
      };
      
      console.log(`${roleEmoji[role] || '👤'} ${role.toUpperCase()} ACCOUNTS:`);
      
      groupedUsers[role].forEach(user => {
        const status = user.isActive ? (user.isEmailVerified ? '✅' : '⚠️ ') : '❌';
        console.log(`   ${status} ${user.email}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error updating user verification status:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await verifyAllUsers();
  
  console.log('\n✅ All users verified successfully!');
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});