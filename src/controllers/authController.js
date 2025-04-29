const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary');

// Comprehensive Registration Controller
exports.register = async (req, res) => {
  try {
    console.log('\n📝 Registration Request Received');
    console.log('Request Body:', req.body);

    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      console.log('❌ Password mismatch');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check existing user
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    console.log('👤 Creating new user...');
    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Save user
    console.log('💾 Saving user to database...');
    const savedUser = await user.save();
    console.log('✅ User saved successfully:', savedUser);

    // Generate token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email
      },
      token
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with 10 hours expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    // Return user data with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name || user.fullName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        username: user.username || '',
        profilePicture: user.profilePicture || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Update User Details Controller
exports.updateUserDetails = async (req, res) => {
  try {
    console.log('\n📝 Update User Details Request Received');
    console.log('Request Body:', req.body);
    console.log('Environment:', process.env.NODE_ENV);

    // User is available from auth middleware
    const userId = req.user._id;

    // Get updated fields from request body
    const { name, email, phone, dateOfBirth, address, username, profilePicture } = req.body;

    // Prepare update object with all fields from the request
    const updateData = {
      name: name !== undefined ? name : req.user.name,
      email: email !== undefined ? email : req.user.email,
      phone: phone !== undefined ? phone : req.user.phone,
      dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : req.user.dateOfBirth,
      address: address !== undefined ? address : req.user.address,
      username: username !== undefined ? username : req.user.username
    };

    // Only update profile picture if we have a new image path or a non-data URL value
    if (profilePicture && !profilePicture.startsWith('data:')) {
      updateData.profilePicture = profilePicture;
      console.log('🖼️ Adding profile picture URL to update data:', profilePicture);
    }

    console.log('🔄 Updating user with data:', updateData);

    // Find user and update in MongoDB Atlas
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated successfully in database');

    // Return updated user data
    return res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        dateOfBirth: updatedUser.dateOfBirth || '',
        address: updatedUser.address || '',
        username: updatedUser.username || '',
        profilePicture: updatedUser.profilePicture || ''
      }
    });

  } catch (error) {
    console.error('❌ Update user error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user details',
      error: error.message
    });
  }
};

// Upload Profile Picture Controller
exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('\n📸 Upload Profile Picture Request Received');

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📁 File details:', req.file);

    const userId = req.user._id;
    // Get the secure URL from Cloudinary
    const fileUrl = req.file.path; // Cloudinary URL is stored in path

    if (!fileUrl) {
      console.error('❌ No URL received from Cloudinary');
      if (req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to get URL from Cloudinary'
      });
    }

    // Update user with Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: fileUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('❌ User not found');
      if (req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile picture updated successfully');
    console.log('🖼️ Profile picture Cloudinary URL:', fileUrl);

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Upload profile picture error:', error);
    if (req.file && req.file.public_id) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (deleteError) {
        console.error('Failed to delete file from Cloudinary:', deleteError);
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// Refresh Token Controller
exports.refreshToken = async (req, res) => {
  try {
    console.log('🔄 Refreshing token for user:', req.user._id);
    
    // Generate a new token with 10 hours expiration
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePicture: req.user.profilePicture
      }
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
};