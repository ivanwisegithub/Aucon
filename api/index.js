import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import connectDb from './config/db.js';

// Routes
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import bookingRoutes from './routes/booking.route.js';
import chatRoutes from './routes/chat.route.js';
import faqRoutes from './routes/faq.route.js';

// ✅ Admin route imports
import adminFaqRoutes from './routes/admin/faq.route.js';
import adminUserRoutes from './routes/admin/user.route.js';
import adminAnalyticsRoutes from './routes/admin/analytics.route.js';
// Optional future route
// import adminBookingRoutes from './routes/admin/booking.route.js';

// Middleware
import verifyToken from './middleware/verifyToken.js';
import verifyAdmin from './middleware/verifyAdmin.js';

dotenv.config();

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL || 'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
};

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ Request logging
app.use((req, res, next) => {
  (`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (process.env.NODE_ENV === 'development') {
    ('Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Not present',
      'content-type': req.headers['content-type'],
      cookie: req.headers.cookie ? 'Present' : 'Not present'
    });
    if (['POST', 'PUT'].includes(req.method)) {
      ('Body:', req.body);
    }
  }
  next();
});

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Public routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/faq', faqRoutes);

// ✅ Admin routes (protected)
app.use('/api/admin/faqs', verifyToken, verifyAdmin, adminFaqRoutes);
app.use('/api/admin/users', verifyToken, verifyAdmin, adminUserRoutes);
app.use('/api/admin/analytics', verifyToken, verifyAdmin, adminAnalyticsRoutes);
// app.use('/api/admin/bookings', verifyToken, verifyAdmin, adminBookingRoutes);

// ✅ Debug token route
app.get('/api/debug/token', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'No token found in cookies' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('🔍 Decoded token:', decoded);
    res.status(200).json({ decoded });
  });
});

// ✅ Serve frontend in production (like old code)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
}

// ✅ 404 handler (for APIs only; frontend handled above)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// ✅ Start server
const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ✅ Graceful shutdown
const shutdown = async (signal) => {
  console.log(`🛑 ${signal} received. Shutting down...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

export default app;
