const fs = require('fs');
const path = require('path');

const createUploadDirectories = () => {
  const dirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/profiles')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    } else {
      console.log(`✅ Directory exists: ${dir}`);
    }
  });
};

// Run when imported
createUploadDirectories();

module.exports = createUploadDirectories;