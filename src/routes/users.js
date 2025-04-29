const express = require('express');
const router = express.Router();
const { register, login, updateUserDetails, uploadProfilePicture, refreshToken } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Registration Route
router.post('/register', register);

// Login Route
router.post('/login', login);

// Refresh Token Route
router.post('/refresh-token', auth, refreshToken);

// Update User Details Route (Protected)
router.put('/update', auth, updateUserDetails);

// Upload Profile Picture Route (Protected)
router.post('/profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

// Test Route for Token Verification (Protected)
router.get('/test', auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id
    }
  });
});

module.exports = router;
