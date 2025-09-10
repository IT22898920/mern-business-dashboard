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

// Update specific user passwords
const updateSpecificPasswords = async () => {
  try {
    console.log('🔧 Updating specific user passwords...\n');

    // Update designer@gmail.com password to design123
    let designer = await User.findOne({ email: 'designer@gmail.com' });
    if (designer) {
      designer.password = 'design123';
      designer.isEmailVerified = true;
      designer.isActive = true;
      designer.loginAttempts = 0;
      designer.lockUntil = null;
      await designer.save();
      console.log(`✅ Updated designer@gmail.com password to: design123`);
    } else {
      // Create new designer if doesn't exist
      designer = new User({
        name: 'Interior Designer',
        email: 'designer@gmail.com',
        password: 'design123',
        role: 'interior_designer',
        isEmailVerified: true,
        isActive: true
      });
      await designer.save();
      console.log(`✅ Created new designer: designer@gmail.com with password: design123`);
    }

    // Update ravindupasanjith1542@gmail.com password to Dinuka@111
    let ravindu = await User.findOne({ email: 'ravindupasanjith1542@gmail.com' });
    if (ravindu) {
      ravindu.password = 'Dinuka@111';
      ravindu.isEmailVerified = true;
      ravindu.isActive = true;
      ravindu.loginAttempts = 0;
      ravindu.lockUntil = null;
      await ravindu.save();
      console.log(`✅ Updated ravindupasanjith1542@gmail.com password to: Dinuka@111`);
    } else {
      // Create new user if doesn't exist
      ravindu = new User({
        name: 'Ravindu Pasanjith',
        email: 'ravindupasanjith1542@gmail.com',
        password: 'Dinuka@111',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      });
      await ravindu.save();
      console.log(`✅ Created new user: ravindupasanjith1542@gmail.com with password: Dinuka@111`);
    }

    console.log('\n📋 Updated login credentials:');
    console.log('   designer@gmail.com / design123 (interior_designer)');
    console.log('   ravindupasanjith1542@gmail.com / Dinuka@111');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await updateSpecificPasswords();
  
  console.log('\n✅ Password updates completed!');
  
  // Close database connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});