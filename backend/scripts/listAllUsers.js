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

// List all users with their login credentials
const listAllUsers = async () => {
  try {
    console.log('📋 All users in database with login credentials:\n');
    
    const users = await User.find({}, 'name email role isActive isEmailVerified').sort({ role: 1, email: 1 });
    
    const groupedUsers = users.reduce((acc, user) => {
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
        // Password is 123456 for most accounts, check if it's a special case
        let password = '123456';
        if (user.email.includes('supplier') && !user.email.includes('example.com')) {
          password = 'supplier123';
        } else if (user.email.includes('employee') && !user.email.includes('example.com')) {
          password = 'employee123';
        } else if (user.email.includes('designer') && !user.email.includes('example.com')) {
          password = 'designer123';
        } else if (user.email === 'ravindupasanjith1542@gmail.com') {
          password = 'ravindu123';
        }
        
        const status = user.isActive ? (user.isEmailVerified ? '✅' : '⚠️ ') : '❌';
        console.log(`   ${status} ${user.email} / ${password}`);
        if (!user.isEmailVerified) console.log(`      └─ Email not verified`);
        if (!user.isActive) console.log(`      └─ Account inactive`);
      });
      console.log('');
    });

    console.log('🔑 QUICK LOGIN TEST ACCOUNTS:');
    console.log('   Admin: admin@gmail.com / 123456');
    console.log('   User:  user@gmail.com / 123456');
    console.log('   User:  user@example.com / 123456');
    console.log('');
    console.log('Legend: ✅ = Active & Verified, ⚠️  = Active but not verified, ❌ = Inactive');
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await listAllUsers();
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});