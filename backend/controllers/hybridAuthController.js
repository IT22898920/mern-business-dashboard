import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

// Demo users for testing without database
const demoUsers = [
  {
    _id: 'demo_admin_id',
    email: 'admin@example.com',
    name: 'Demo Admin',
    role: 'admin',
    password: 'admin123' // In real app, this would be hashed
  },
  {
    _id: 'demo_user_id',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user',
    password: 'user123'
  },
  {
    _id: 'demo_admin_gmail',
    email: 'admin@gmail.com',
    name: 'Admin User',
    role: 'admin',
    password: '123456'
  },
  {
    _id: 'demo_supplier_gmail',
    email: 'supplier@gmail.com',
    name: 'Supplier User',
    role: 'supplier',
    password: 'supplier123'
  }
];


// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Hybrid login that tries database first, then falls back to demo
export const hybridLogin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    let user = null;
    let isFromDatabase = false;

    // Try database authentication first if MongoDB is connected
    if (isMongoConnected()) {
      try {
        console.log('🔍 Trying database authentication for:', email);
        
        // Find user in database
        const dbUser = await User.findByEmail(email.toLowerCase().trim());
        
        if (dbUser && !dbUser.isLocked()) {
          // Check password
          const isPasswordCorrect = await dbUser.comparePassword(password);
          
          if (isPasswordCorrect && dbUser.isActive) {
            // Reset login attempts on successful login
            if (dbUser.loginAttempts > 0) {
              await dbUser.resetLoginAttempts();
            }

            // Update last login
            dbUser.lastLogin = new Date();
            await dbUser.save();

            user = dbUser;
            isFromDatabase = true;
            console.log('✅ Database authentication successful');
          } else if (dbUser) {
            // Increment login attempts for wrong password
            await dbUser.incLoginAttempts();
            console.log('❌ Database authentication failed - wrong password');
          }
        } else {
          console.log('❌ Database authentication failed - user not found or locked');
        }
      } catch (dbError) {
        console.warn('⚠️ Database authentication error:', dbError.message);
        // Continue to demo authentication
      }
    } else {
      console.log('⚠️ MongoDB not connected, skipping database authentication');
    }

    // If database authentication failed or database not available, try demo users
    if (!user) {
      console.log('🔍 Trying demo authentication for:', email);
      
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        user = demoUser;
        isFromDatabase = false;
        console.log('✅ Demo authentication successful');
      } else {
        console.log('❌ Demo authentication failed');
      }
    }

    // If neither worked, return error
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({ 
      userId: user._id, 
      role: user.role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    });

    // Prepare user data (excluding password)
    const userResponse = isFromDatabase ? user.profile : {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
      isActive: true,
      avatar: {
        url: 'https://res.cloudinary.com/dxkufsejm/image/upload/v1625661662/avatars/default_avatar.png'
      }
    };

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        source: isFromDatabase ? 'database' : 'demo'
      }
    });
  } catch (error) {
    console.error('Hybrid login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
};