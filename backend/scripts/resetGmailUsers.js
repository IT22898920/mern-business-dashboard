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

// Reset passwords for Gmail users
const resetGmailUsers = async () => {
  try {
    // Gmail accounts to reset
    const gmailUsers = [
      { email: 'admin@gmail.com', newPassword: 'admin123' },
      { email: 'user@gmail.com', newPassword: 'user123' },
      { email: 'supplier@gmail.com', newPassword: 'supplier123' },
      { email: 'designer@gmail.com', newPassword: 'designer123' },
      { email: 'employee@gmail.com', newPassword: 'employee123' },
      { email: 'supplier1@gmail.com', newPassword: 'supplier123' },
      { email: 'user1@gmail.com', newPassword: 'user123' }
    ];

    console.log('🔧 Resetting passwords for Gmail accounts...\n');

    for (const userData of gmailUsers) {
      const user = await User.findOne({ email: userData.email }).select('+password');
      
      if (user) {
        // Update password
        user.password = userData.newPassword;
        user.isEmailVerified = true; // Auto-verify
        user.isActive = true;
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        console.log(`✅ Reset password for: ${userData.email} → Password: ${userData.newPassword}`);
      } else {
        console.log(`⚠️  User not found: ${userData.email}`);
      }
    }

    // Reset ravindupasanjith1542@gmail.com
    const specialUser = await User.findOne({ email: 'ravindupasanjith1542@gmail.com' }).select('+password');
    if (specialUser) {
      specialUser.password = 'ravindu123';
      specialUser.isEmailVerified = true;
      specialUser.isActive = true;
      specialUser.loginAttempts = 0;
      specialUser.lockUntil = null;
      await specialUser.save();
      console.log(`✅ Reset password for: ravindupasanjith1542@gmail.com → Password: ravindu123`);
    }

    console.log('\n📋 Updated Gmail accounts - You can now login with:');
    console.log('   - admin@gmail.com / admin123');
    console.log('   - user@gmail.com / user123');
    console.log('   - supplier@gmail.com / supplier123');
    console.log('   - designer@gmail.com / designer123');
    console.log('   - employee@gmail.com / employee123');
    console.log('   - supplier1@gmail.com / supplier123');
    console.log('   - user1@gmail.com / user123');
    console.log('   - ravindupasanjith1542@gmail.com / ravindu123');

  } catch (error) {
    console.error('❌ Error resetting Gmail passwords:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await resetGmailUsers();
  
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