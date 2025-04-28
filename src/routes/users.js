const express = require('express');
const router = express.Router();
const { register, login, updateUserDetails } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Registration Route
router.post('/register', register);

// Login Route
router.post('/login', login);

// Update User Details Route (Protected)
router.put('/update', auth, updateUserDetails);

module.exports = router;
