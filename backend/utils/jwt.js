import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mern-business-dashboard',
    audience: 'mern-business-dashboard-users'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    // First try with issuer/audience validation
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'mern-business-dashboard',
      audience: 'mern-business-dashboard-users'
    });
  } catch (error) {
    // If that fails, try without issuer/audience for backward compatibility
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (fallbackError) {
      // Also try with the old demo secret for backward compatibility
      try {
        return jwt.verify(token, 'demo_secret_key');
      } catch (demoError) {
        throw new Error('Invalid or expired token');
      }
    }
  }
};

// Generate token and set cookie
export const createTokenAndSetCookie = (res, userId, rememberMe = false) => {
  const token = generateToken({ 
    userId,
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  });
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
    path: '/'
  };
  
  res.cookie('token', token, cookieOptions);
  return token;
};

// Clear token cookie
export const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: '30d',
      issuer: 'mern-business-dashboard',
      audience: 'mern-business-dashboard-users'
    }
  );
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'password_reset' },
    JWT_SECRET,
    {
      expiresIn: '1h',
      issuer: 'mern-business-dashboard',
      audience: 'mern-business-dashboard-users'
    }
  );
};

// Generate email verification token
export const generateEmailVerificationToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'mern-business-dashboard',
      audience: 'mern-business-dashboard-users'
    }
  );
};