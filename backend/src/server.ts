import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { connectDB } from './config/database';
import { initializeFirebase } from './config/firebase';
import { initializeSocketIO } from './sockets/socketHandler';
import { setIO } from './sockets/io';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import listingRoutes from './routes/listingRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import reportRoutes from './routes/reportRoutes';

// Load environment variables from backend/.env even when running from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Environment variables with defaults
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Rate limiting
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Rate limiting (only in production)
if (NODE_ENV === 'production') {
  app.use('/api/', rateLimiter);
}

// Logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Campus Resale Hub API',
    version: '1.0.0',
    description: 'RESTful API for campus marketplace with real-time features',
    baseUrl: `/api`,
    endpoints: {
      auth: {
        'POST /auth/verify': 'Verify Firebase ID token',
        'GET /auth/me': 'Get current user info',
      },
      users: {
        'GET /users/profile': 'Get user profile',
        'PUT /users/profile': 'Update user profile',
        'GET /users/:id': 'Get user by ID',
      },
      listings: {
        'GET /listings': 'Get all listings with filters',
        'POST /listings': 'Create new listing',
        'GET /listings/:id': 'Get listing by ID',
        'PUT /listings/:id': 'Update listing',
        'DELETE /listings/:id': 'Delete listing',
        'GET /listings/my': 'Get current user listings',
        'POST /listings/:id/favorite': 'Toggle favorite',
        'GET /listings/favorites': 'Get user favorites',
      },
      chats: {
        'GET /chats': 'Get user chats',
        'POST /chats': 'Create new chat',
        'POST /chats/with': 'Get or create chat with user',
        'GET /chats/:id/messages': 'Get chat messages',
        'POST /chats/:id/messages': 'Send message',
        'PUT /chats/:id/read': 'Mark messages as read',
      },
      admin: {
        'GET /admin/users': 'Get all users (admin only)',
        'GET /admin/listings': 'Get all listings (admin only)',
        'GET /admin/stats': 'Get platform statistics (admin only)',
      },
    },
    websocket: {
      url: process.env.NODE_ENV === 'production' ? 'wss://your-domain.com' : 'ws://localhost:' + PORT,
      events: {
        connect: 'Client connects with Firebase token',
        join_chat: 'Join a chat room',
        send_message: 'Send message to chat',
        typing_start: 'Start typing indicator',
        typing_stop: 'Stop typing indicator',
        user_online: 'Set user online status',
      },
    },
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: '/api/docs',
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      messages: errors,
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not valid',
    });
  }
  
  // JWT/Firebase auth errors
  if (err.code === 'auth/id-token-expired' || err.code === 'auth/invalid-token') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token',
    });
  }
  
  // Default server error
  return res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize services and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Campus Resale Hub Backend...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Initialize Firebase Admin (skip when DEV_AUTH_BYPASS=true)
    if (process.env.DEV_AUTH_BYPASS !== 'true') {
      initializeFirebase();
      console.log('✅ Firebase Admin initialized');
    } else {
      console.log('⚠️ DEV_AUTH_BYPASS enabled: skipping Firebase Admin initialization');
    }
    
// Initialize Socket.IO
    setIO(io);
    initializeSocketIO(io);
    console.log('✅ Socket.IO initialized');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`\n🌟 Server running in ${NODE_ENV} mode`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      
      if (NODE_ENV === 'development') {
        console.log(`🎯 Frontend URL: ${CORS_ORIGIN}`);
      }
      
      console.log('\n✨ Ready to accept connections!\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();