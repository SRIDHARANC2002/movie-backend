const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Log the complete user object for debugging
    console.log('✅ Login successful, returning user data:', {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      username: user.username,
      name: user.name
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        username: user.username || '',
        name: user.name || user.fullName || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Update User Details Controller
exports.updateUserDetails = async (req, res) => {
  try {
    console.log('\n📝 Update User Details Request Received');
    console.log('Request Body:', req.body);

    // User is available from auth middleware
    const userId = req.user._id;

    // Get updated fields from request body
    const { name, email, phone, dateOfBirth, address, username } = req.body;

    // Prepare update object with all fields from the request
    // This ensures that even empty strings are saved (to clear fields)
    const updateData = {
      name: name !== undefined ? name : req.user.name,
      email: email !== undefined ? email : req.user.email,
      phone: phone !== undefined ? phone : req.user.phone,
      dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : req.user.dateOfBirth,
      address: address !== undefined ? address : req.user.address,
      username: username !== undefined ? username : req.user.username
    };

    console.log('🔄 Updating user with data:', updateData);
    console.log('👤 User ID:', userId);

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true } // Return updated document and run schema validators
    );

    if (!updatedUser) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated successfully');
    console.log('📊 Updated user data:', {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      address: updatedUser.address,
      username: updatedUser.username,
      name: updatedUser.name
    });

    // Return updated user data
    return res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        dateOfBirth: updatedUser.dateOfBirth || '',
        address: updatedUser.address || '',
        username: updatedUser.username || '',
        name: updatedUser.name || updatedUser.fullName || ''
      }
    });

  } catch (error) {
    console.error('❌ Update user error:', error);

    // Handle MongoDB duplicate key error (e.g., if email already exists)
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
