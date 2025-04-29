const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔄 Testing MongoDB Atlas Connection...');
    const mongoUri = process.env.MONGODB_URI;
    console.log('📍 URI:', mongoUri);

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Atlas Connected Successfully!');

    // List all users
    const users = await User.find({}, { password: 0 }); // Exclude password field
    console.log('\n📊 Users in Database:', users.length);
    console.log('👥 User Details:');
    users.forEach(user => {
      console.log(`
      ID: ${user._id}
      Name: ${user.fullName}
      Email: ${user.email}
      Created: ${user.createdAt}
      `);
    });

    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Database Test Error:', error);
  }
}

checkUsers();
