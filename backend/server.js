import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// Security & Middleware
// ------------------------
app.set('trust proxy', 1);
app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ------------------------
// Database Connection
// ------------------------
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_business_dashboard';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('⚠️  MongoDB connection failed:', err.message);
    console.warn('🔄 Server will continue without database (some features may be limited)');
  }
};

connectDB();

// ------------------------
// Import Routes
// ------------------------
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import demoRoutes from './routes/demoRoutes.js';
import supplierApplicationRoutes from './routes/supplierApplications.js';
import inventoryRoutes from './routes/inventory.js';
import designRoutes from './routes/designRoutes.js'; // Interior Designs
import clientContactRoutes from './routes/clientContactRoutes.js'; // Client Contacts
import notificationRoutes from './routes/notificationRoutes.js'; // Notifications
import reorderRoutes from './routes/reorders.js';
import leaveRoutes from './routes/leaveRoutes.js';


// ------------------------
// API Routes
// ------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/supplier-applications', supplierApplicationRoutes);
app.use('/api/inventory', inventoryRoutes);


app.use('/api/reorders', reorderRoutes);
app.use('/api/leaves', leaveRoutes);

// Demo routes (for development without database)

app.use('/api/demo', demoRoutes);

// Designs routes
app.use('/api/designs', designRoutes);

// Client contacts routes
app.use('/api/client-contacts', clientContactRoutes);

// Notifications routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running properly',
    timestamp: new Date().toISOString()
  });
});

// ------------------------
// Error Handling
// ------------------------
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// ------------------------
// Start Server
// ------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
