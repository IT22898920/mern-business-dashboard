import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.post('/api/auth/login', (req, res) => {
  res.json({
    status: 'success',
    message: 'Test login endpoint',
    data: { token: 'test-token', user: { email: 'test@test.com' } }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});