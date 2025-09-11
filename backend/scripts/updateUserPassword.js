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

// Update user@gmail.com password to password123
const updateUserPassword = async () => {
  try {
    console.log('🔧 Updating user@gmail.com password to password123...\n');

    let user = await User.findOne({ email: 'user@gmail.com' });
    
    if (user) {
      // Update existing user
      user.password = 'password123';
      user.isEmailVerified = true;
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      console.log(`✅ Updated user@gmail.com password to: password123`);
    } else {
      // Create new user if doesn't exist
      user = new User({
        name: 'Regular User',
        email: 'user@gmail.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      });
      await user.save();
      console.log(`✅ Created new user: user@gmail.com with password: password123`);
    }

    console.log('\n📋 Ready for login:');
    console.log('   Email: user@gmail.com');
    console.log('   Password: password123');
    console.log('   Role: user');

  } catch (error) {
    console.error('❌ Error updating user password:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await updateUserPassword();
  
  console.log('\n✅ Password update completed!');
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});