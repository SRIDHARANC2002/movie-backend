const express = require('express');
const router = express.Router();

// Since we're using Cloudinary, this middleware just handles fallback cases
router.use((req, res, next) => {
  // If the URL is a Cloudinary URL, skip this middleware
  if (req.url.includes('cloudinary.com')) {
    return next();
  }

  // For any other requests, return a 404
  res.status(404).json({
    success: false,
    message: 'File not found'
  });
});

module.exports = router;