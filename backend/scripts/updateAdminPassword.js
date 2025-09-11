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

// Update admin password
const updateAdminPassword = async () => {
  try {
    const user = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    
    if (user) {
      // Update password to 123456
      user.password = '123456';
      user.isEmailVerified = true;
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      
      console.log('✅ Password updated successfully!');
      console.log('   Email: admin@gmail.com');
      console.log('   New Password: 123456');
      console.log('\n🔑 You can now login with: admin@gmail.com / 123456');
    } else {
      console.log('❌ User admin@gmail.com not found');
    }
  } catch (error) {
    console.error('❌ Error updating password:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await updateAdminPassword();
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});