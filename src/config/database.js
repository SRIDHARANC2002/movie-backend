const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    const localUri = 'mongodb+srv://sridharan:sridharan@cluster0.wsrdh.mongodb.net/tamilMovie-DB';
    // const localUri = 'mongodb://localhost:27017/tamilMovieDB';
    console.log('📍 Connection URI:', localUri);

    await mongoose.connect(localUri);

    console.log('✅ MongoDB Connected Successfully!');
    
    // Optional: Log database name and connection details
    console.log('📦 Database Name:', mongoose.connection.db.databaseName);
    console.log('🌐 Connection Host:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }

  // Optional: Connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB Reconnected');
  });
};

module.exports = connectDB;
