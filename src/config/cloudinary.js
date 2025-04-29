const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with URL
cloudinary.config({
  cloud_name: 'dd41lxzin',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: "face" },
      { quality: 'auto' }
    ],
    public_id: (req, file) => {
      const userId = req.user._id;
      return `profile-${userId}-${Date.now()}`;
    }
  }
});

// Configure upload middleware
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };