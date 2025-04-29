const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use absolute path for uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');

// Ensure uploads directory exists
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created/verified at:', uploadsDir);
} catch (error) {
  console.error('❌ Error creating uploads directory:', error);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Double-check directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with user ID and timestamp
    const userId = req.user._id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;
