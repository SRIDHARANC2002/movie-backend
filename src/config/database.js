const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const dbType = process.env.DB_TYPE || 'atlas';
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log("Attempting to connect to MongoDB (" + dbType + ")...");
    console.log('Connection URI:', mongoUri);

    let options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000000, // Increased timeout (3000 seconds)
      socketTimeoutMS: 450000,           // Socket inactivity timeout (7.5 mins)
      retryWrites: true,                 // Enable retryable writes
      w: 'majority',                    // Write concern
      directConnection: false           // Let MongoDB choose the best node
    };

    if (dbType === 'local') {
      // Local MongoDB connection options
      options.tls = false;
      options.directConnection = true; // Usually local connection is direct
      console.log('Using local MongoDB connection options');
    } else if (dbType === 'atlas') {
      // Atlas connection options
      options.tls = true;
      console.log('Using MongoDB Atlas connection options');
    } else {
      throw new Error("Unsupported DB_TYPE: " + dbType + ". Use 'local' or 'atlas'.");
    }

    await mongoose.connect(mongoUri, options);

    console.log('MongoDB Connected Successfully!');

    // Log database name and connection details
    console.log('Database Name:', mongoose.connection.db.databaseName);
    console.log('Connection Host:', mongoose.connection.host);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }

  // Connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB Reconnected');
  });
};

module.exports = connectDB;
