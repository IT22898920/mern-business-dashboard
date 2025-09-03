import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  return nodemailer.createTransporter(config);
};

// Email templates
const getEmailTemplate = (type, data) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  const templates = {
    passwordReset: {
      subject: 'Password Reset Request - MERN Business Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MERN Business Dashboard</div>
            </div>
            
            <h2>Password Reset Request</h2>
            
            <p>Hello ${data.name},</p>
            
            <p>We received a request to reset your password for your MERN Business Dashboard account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${baseUrl}/reset-password?token=${data.token}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${baseUrl}/reset-password?token=${data.token}">${baseUrl}/reset-password?token=${data.token}</a></p>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
              If you didn't request this password reset, please ignore this email.
            </div>
            
            <div class="footer">
              <p>Best regards,<br>MERN Business Dashboard Team</p>
              <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    emailVerification: {
      subject: 'Verify Your Email - MERN Business Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MERN Business Dashboard</div>
            </div>
            
            <h2>Welcome! Verify Your Email</h2>
            
            <p>Hello ${data.name},</p>
            
            <p>Thank you for registering with MERN Business Dashboard! Please verify your email address to complete your account setup.</p>
            
            <a href="${baseUrl}/verify-email?token=${data.token}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${baseUrl}/verify-email?token=${data.token}">${baseUrl}/verify-email?token=${data.token}</a></p>
            
            <p>This verification link will expire in 24 hours.</p>
            
            <div class="footer">
              <p>Welcome to MERN Business Dashboard!<br>The Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    welcome: {
      subject: 'Welcome to MERN Business Dashboard!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MERN Business Dashboard</div>
            </div>
            
            <h2>Welcome ${data.name}!</h2>
            
            <p>Your account has been successfully verified and you're now ready to explore all the features of MERN Business Dashboard.</p>
            
            <div class="features">
              <h3>What's Next?</h3>
              <ul>
                <li>Complete your profile setup</li>
                <li>Explore the dashboard features</li>
                <li>Connect with team members</li>
                <li>Start managing your business data</li>
              </ul>
            </div>
            
            <a href="${baseUrl}/dashboard" class="button">Go to Dashboard</a>
            
            <div class="footer">
              <p>Happy to have you on board!<br>MERN Business Dashboard Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[type] || null;
};

// Send email function
export const sendEmail = async (to, type, data) => {
  try {
    const transporter = createTransporter();
    const template = getEmailTemplate(type, data);

    if (!template) {
      throw new Error(`Email template '${type}' not found`);
    }

    const mailOptions = {
      from: `"MERN Business Dashboard" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  return sendEmail(user.email, 'passwordReset', {
    name: user.name,
    token: resetToken
  });
};

// Send email verification email
export const sendEmailVerificationEmail = async (user, verificationToken) => {
  return sendEmail(user.email, 'emailVerification', {
    name: user.name,
    token: verificationToken
  });
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  return sendEmail(user.email, 'welcome', {
    name: user.name
  });
};