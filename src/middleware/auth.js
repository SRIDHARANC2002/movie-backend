const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
        error: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔑 Token decoded successfully:', decoded);
      
      // Find user by id
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('❌ User not found for token');
        return res.status(401).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Add user to request object
      req.user = user;
      req.token = token;
      
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          error: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          error: 'INVALID_TOKEN'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'AUTH_FAILED'
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: 'SERVER_ERROR'
    });
  }
};
