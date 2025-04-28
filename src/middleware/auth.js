const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    console.log('\n🔒 Auth Middleware: Verifying token');

    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('📝 Auth Header:', authHeader);

    if (!authHeader) {
      console.log('❌ No Authorization header found');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted:', token.substring(0, 20) + '...');

    if (!token) {
      console.log('❌ Empty token after Bearer prefix removal');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    console.log('🔍 Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'Secret missing');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully. Decoded payload:', decoded);

    // Find user by id
    console.log('🔍 Finding user with ID:', decoded.id);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('❌ User not found in database with ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }

    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth;
