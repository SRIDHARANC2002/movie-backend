const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the MongoDB Atlas URI directly
    const mongoUri = 'mongodb+srv://sridharan:sridharan@cluster0.wsrdh.mongodb.net/tamilMovie-DB';
    console.log('🔌 Connecting to MongoDB at: mongodb+srv://sridharan:***@cluster0.wsrdh.mongodb.net/tamilMovie-DB');

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful');

    // Update the user with the specified ID
    const userId = '680fbd8d1fc99308909b511d'; // The user ID from your data
    const username = 'sri'; // The username from your data

    // Create the profile picture path (just the relative path)
    const profilePicture = `/uploads/${username}.bmp`;

    console.log('🔄 Updating user with ID:', userId);
    console.log('🖼️ Setting profile picture to:', profilePicture);

    // Update the user document
    const result = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true }
    );

    if (result) {
      console.log('✅ User updated successfully');
      console.log('📊 Updated user data:', {
        id: result._id,
        username: result.username,
        profilePicture: result.profilePicture
      });
    } else {
      console.log('❌ User not found');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
connectDB();
