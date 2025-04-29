// Load environment variables
require('dotenv').config();

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not defined in environment variables!');
  console.error('Please check your .env file and ensure JWT_SECRET is set.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'Not defined');
console.log('🌐 NODE_ENV:', process.env.NODE_ENV || 'development');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const userRoutes = require('./src/routes/users');
const favoriteRoutes = require('./src/routes/favorites');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());

// ✅ Correct CORS Configuration - Allow both local and deployed frontends
const allowedOrigins = [
  'http://localhost:3000',                    // local frontend
  'http://localhost:5005',                    // local backend (if needed)
  'http://localhost:5006',                    // alternate local backend
  'http://localhost:5007',                    // alternate local backend
  'https://movie-frontend-ikui.vercel.app',   // new production frontend
  'https://movie-backend-4-qrw2.onrender.com'  // production backend
];

// For production, use a strict CORS policy
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);  // allow non-browser clients like Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
} else {
  // For development, allow all origins
  console.log('🔓 Development mode: CORS allowing all origins');
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
}

// Optional: CORS pre-flight logging
app.use((req, _res, next) => {
  console.log('\n🔒 CORS Pre-flight Request:');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  next();
});

// Body parser middleware - IMPORTANT: Place this BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n📨 Incoming Request Details:');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Log body but mask sensitive data
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
  if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[HIDDEN]';
  console.log('Body:', JSON.stringify(sanitizedBody, null, 2));

  // Add response logging
  const oldSend = res.send;
  res.send = function(data) {
    console.log('\n📤 Outgoing Response:');
    console.log('Status:', res.statusCode);
    console.log('Body:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    oldSend.apply(res, arguments);
  };

  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);

// Test route
app.get('/api/test', (_req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  try {
    // First check if port is available
    const server = app.listen(PORT);
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
      }
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    // Then connect to MongoDB
   // const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamilMovieDB';
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sridharan:sridharan@cluster0.wsrdh.mongodb.net/tamilMovie-DB';
    console.log('🔌 Connecting to MongoDB at:', mongoUri);

    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connection successful');
    } catch (dbError) {
      console.error('❌ MongoDB connection error:', dbError);
      throw dbError;
    }

    console.log(`
🚀 Server Running!
==================
📡 Port: ${PORT}
🔑 Environment: ${process.env.NODE_ENV || 'development'}
🗄️ Database: Connected
==================
    `);

  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});
