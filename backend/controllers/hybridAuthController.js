import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import InteriorDesigner from '../models/InteriorDesigner.js';

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
  },
  {
    _id: 'demo_designer_id',
    email: 'designer@example.com',
    name: 'Demo Designer',
    role: 'interior_designer',
    password: 'designer123'
  },
  {
    _id: 'demo_designer_gmail',
    email: 'designer@gmail.com',
    name: 'Interior Designer',
    role: 'interior_designer',
    password: 'designer123'
  }
];


// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Attempt to connect to MongoDB quickly if not connected
const tryQuickConnect = async () => {
  if (isMongoConnected()) return true;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_business_dashboard';
  try {
    // Avoid overlapping connection attempts
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    return isMongoConnected();
  } catch (err) {
    console.warn('⚠️ Quick MongoDB connect failed:', err.message);
    return false;
  }
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

    // Try database authentication (attempt quick connect if needed)
    if (isMongoConnected() || await tryQuickConnect()) {
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

        // If not authenticated as regular user, try InteriorDesigner model
        if (!user) {
          const normalizedEmail = email.toLowerCase().trim();
          const designer = await InteriorDesigner.findOne({ email: normalizedEmail, isActive: true });

          if (designer) {
            const isPasswordCorrect = await designer.comparePassword(password);
            if (isPasswordCorrect) {
              // Normalize response shape similar to User.profile
              const defaultAvatarUrl = 'https://res.cloudinary.com/dxkufsejm/image/upload/v1625661662/avatars/default_avatar.png';
              const profile = {
                _id: designer._id,
                name: designer.name,
                email: designer.email,
                role: 'interior_designer',
                isEmailVerified: designer.isVerified ?? true,
                isActive: designer.isActive,
                avatar: { url: designer.profileImage || defaultAvatarUrl }
              };

              // Attach a profile field so downstream code can use user.profile
              user = { ...designer.toObject(), role: 'interior_designer', profile };
              isFromDatabase = true;
              console.log('✅ Database authentication successful (InteriorDesigner)');
            } else {
              console.log('❌ Database authentication failed (InteriorDesigner) - wrong password');
            }
          }
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

// Direct InteriorDesigner login (DB only)
export const designerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Ensure DB connection is available
    if (!(isMongoConnected() || await tryQuickConnect())) {
      return res.status(503).json({
        status: 'error',
        message: 'Database not connected. Please try again later.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const designer = await InteriorDesigner.findOne({ email: normalizedEmail, isActive: true });

    if (!designer) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await designer.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const token = generateToken({
      userId: designer._id,
      role: 'interior_designer',
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    });

    const defaultAvatarUrl = 'https://res.cloudinary.com/dxkufsejm/image/upload/v1625661662/avatars/default_avatar.png';
    const userResponse = {
      _id: designer._id,
      name: designer.name,
      email: designer.email,
      role: 'interior_designer',
      isEmailVerified: designer.isVerified ?? true,
      isActive: designer.isActive,
      avatar: { url: designer.profileImage || defaultAvatarUrl }
    };

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        source: 'database'
      }
    });
  } catch (error) {
    console.error('Designer login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during designer login'
    });
  }
};