# MERN Business Dashboard - Authentication System

A complete, production-ready MERN stack authentication system with role-based access control, featuring modern UI, secure JWT authentication, image upload capabilities, and comprehensive user management.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with secure httpOnly cookies
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** on auth endpoints
- **Account Lockout** after failed login attempts
- **Email Verification** system
- **Password Reset** with secure token generation
- **Input Sanitization** and validation
- **CORS Protection** with secure headers

### 👥 Role-Based Access Control
- **User** (default): Regular customers with shopping capabilities
- **Admin**: Full system access and user management
- **Employee**: Staff access with product and order management
- **Supplier**: Vendor access with inventory management
- **Interior Designer**: Professional access with design tools

### 🎨 Modern UI/UX
- **Responsive Design** with Tailwind CSS
- **Dark/Light Mode** support
- **Smooth Animations** and transitions
- **Form Validation** with real-time feedback
- **Loading States** and error handling
- **Toast Notifications** for user feedback
- **Accessible Components** with proper ARIA labels

### 📁 File Upload
- **Cloudinary Integration** for image storage
- **Drag & Drop** file upload
- **Image Compression** and optimization
- **Preview Functionality** 
- **File Type Validation**
- **Size Limits** and error handling

### 📧 Email System
- **Nodemailer Integration** with Gmail
- **HTML Email Templates** 
- **Password Reset Emails**
- **Email Verification**
- **Welcome Emails**

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cloudinary** for image storage
- **Nodemailer** for email service
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection

### Frontend
- **React 19** with hooks
- **Vite** for fast development
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Context API** for state management

## 📁 Project Structure

```
mern-business-dashboard/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── email.js           # Email service configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── userController.js  # User management
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── validation.js     # Input validation
│   ├── models/
│   │   └── User.js           # User model with roles
│   ├── routes/
│   │   ├── authRoutes.js     # Auth endpoints
│   │   └── userRoutes.js     # User endpoints
│   ├── utils/
│   │   └── jwt.js            # JWT utilities
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── server.js             # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Auth components
│   │   │   └── ui/           # Reusable UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── .env.example          # Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.js    # Tailwind configuration
│   └── vite.config.js        # Vite configuration
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image upload)
- Gmail account (for email service)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mern-business-dashboard
```

2. **Backend Setup**
```bash
cd backend
npm install

# Copy environment variables and configure
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Copy environment variables and configure
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mern_business_dashboard

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (Gmail)
EMAIL_FROM=your_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=MERN Business Dashboard
VITE_APP_VERSION=1.0.0
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
# Client will run on http://localhost:5173
```

3. **Open your browser** and navigate to `http://localhost:5173`

## 🔑 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `PUT /update-profile` - Update user profile
- `PUT /change-password` - Change user password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /verify-email/:token` - Verify email address
- `POST /resend-verification` - Resend verification email
- `PUT /upload-avatar` - Upload profile avatar

### User Management Routes (`/api/users`) - Admin/Staff Only
- `GET /` - Get all users (with pagination)
- `GET /profile/:id` - Get user by ID
- `PUT /:id` - Update user (Admin only)
- `DELETE /:id` - Delete user (Admin only)
- `GET /role/:role` - Get users by role
- `GET /stats` - Get user statistics (Admin only)
- `PUT /:id/deactivate` - Deactivate user (Admin only)
- `PUT /:id/activate` - Activate user (Admin only)
- `PUT /:id/unlock` - Unlock user account (Admin only)

## 🎨 UI Components

### Reusable Components
- **Button** - Customizable button with variants and loading states
- **Input** - Form input with validation, icons, and password toggle
- **ImageUpload** - Drag & drop image upload with preview
- **LoadingSpinner** - Loading indicator
- **Modal** - Reusable modal component

### Authentication Components
- **ProtectedRoute** - Route protection with role checking
- **PublicRoute** - Public route with auth redirection
- **RoleBasedAccess** - Component-level role access control

## 🔒 Security Features

### Authentication Security
- JWT tokens with secure httpOnly cookies
- Password hashing with bcrypt (12 salt rounds)
- Account lockout after 5 failed attempts (2-hour lockout)
- Token expiration and refresh handling
- Secure password reset with time-limited tokens

### API Security
- Rate limiting on authentication endpoints
- Input sanitization and validation
- CORS protection with specific origin whitelist
- Helmet.js for security headers
- MongoDB injection prevention

### Frontend Security
- XSS protection with proper input handling
- Secure storage of tokens
- Protected routes with role validation
- Form validation with client and server-side checks

## 📱 User Roles & Permissions

### User (Default)
- Register and login
- Update profile and change password
- Access customer dashboard
- Upload profile picture

### Admin
- All user permissions
- User management (CRUD operations)
- View analytics and statistics
- System configuration
- Access all features

### Employee
- User permissions
- Product management
- Order processing
- Customer support tools

### Supplier
- User permissions
- Inventory management
- Product uploads
- Order fulfillment

### Interior Designer
- User permissions
- Design tools access
- Client management
- Project gallery

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up Cloudinary for image storage
5. Configure email service (Gmail or SendGrid)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables for production API endpoints

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with all roles
- [ ] Email verification flow
- [ ] Login with remember me functionality
- [ ] Password reset flow
- [ ] Profile image upload
- [ ] Role-based access control
- [ ] Account lockout mechanism
- [ ] Form validation
- [ ] Error handling
- [ ] Responsive design

### API Testing
Use tools like Postman or Insomnia to test API endpoints:
- Authentication flows
- Protected routes
- File upload
- Error responses
- Rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing React framework
- **Express.js** for the robust backend framework
- **MongoDB** for the flexible database solution
- **Tailwind CSS** for the utility-first CSS framework
- **Cloudinary** for image storage and optimization
- **JWT** for secure authentication tokens

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.

## 🔄 Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Complete authentication system
- Role-based access control
- Image upload functionality
- Email verification system
- Password reset functionality
- Modern responsive UI
- Comprehensive security features

---

**Built with ❤️ using the MERN Stack**