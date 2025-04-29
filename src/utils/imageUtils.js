const fs = require('fs');
const path = require('path');

/**
 * Saves a data URL as a BMP file
 * @param {string} dataUrl - The data URL to save
 * @param {string} userId - The user ID to use in the filename
 * @param {string} username - The username to use in the filename
 * @returns {string} The path to the saved file (relative to the server root)
 */
const saveDataUrlAsImage = (dataUrl, userId, username) => {
  console.log('📸 Starting saveDataUrlAsImage function...');
  console.log('👤 User ID:', userId);
  console.log('👤 Username:', username);

  // Ensure the uploads directory exists
  const uploadsDir = path.join(__dirname, '../../uploads');
  console.log('📁 Uploads directory:', uploadsDir);

  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Extract the base64 data from the data URL
  console.log('🔍 Extracting base64 data from data URL...');
  const matches = dataUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    console.error('❌ Invalid data URL format');
    throw new Error('Invalid data URL format');
  }

  console.log('✅ Data URL format is valid');
  console.log('🖼️ Image format:', matches[1]);

  // Create a filename based on username
  // Sanitize username to make it safe for filenames
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filename = `${sanitizedUsername}.bmp`;
  const filePath = path.join(uploadsDir, filename);

  console.log('📄 Generated filename:', filename);
  console.log('📄 Full file path:', filePath);

  // Convert base64 to binary and save as BMP
  console.log('💾 Converting base64 to binary and saving as BMP...');
  const imageData = Buffer.from(matches[2], 'base64');
  fs.writeFileSync(filePath, imageData);

  console.log('✅ File saved successfully');

  // Return just the relative path to be stored in the database
  const imagePath = `/uploads/${filename}`;
  console.log('🔗 Image path to be stored in database:', imagePath);

  return imagePath;
};

module.exports = {
  saveDataUrlAsJpg: saveDataUrlAsImage
};
