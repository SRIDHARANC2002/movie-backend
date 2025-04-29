const fs = require('fs');
const path = require('path');

// Function to create a simple colored placeholder image (10x10 pixel)
const createColoredPlaceholder = () => {
  // Create a buffer for a 10x10 pixel BMP image (blue color)
  const width = 10;
  const height = 10;
  const pixelSize = 3; // 3 bytes per pixel (RGB)
  const fileSize = 54 + width * height * pixelSize; // 54 bytes for the header
  
  // Create a buffer for the BMP file
  const buffer = Buffer.alloc(fileSize);
  
  // BMP Header (14 bytes)
  buffer.write('BM', 0); // Signature
  buffer.writeUInt32LE(fileSize, 2); // File size
  buffer.writeUInt32LE(0, 6); // Reserved
  buffer.writeUInt32LE(54, 10); // Offset to pixel data
  
  // DIB Header (40 bytes)
  buffer.writeUInt32LE(40, 14); // DIB header size
  buffer.writeInt32LE(width, 18); // Width
  buffer.writeInt32LE(height, 22); // Height
  buffer.writeUInt16LE(1, 26); // Color planes
  buffer.writeUInt16LE(24, 28); // Bits per pixel (24 for RGB)
  buffer.writeUInt32LE(0, 30); // No compression
  buffer.writeUInt32LE(width * height * pixelSize, 34); // Image size
  buffer.writeInt32LE(0, 38); // X pixels per meter
  buffer.writeInt32LE(0, 42); // Y pixels per meter
  buffer.writeUInt32LE(0, 46); // Colors in color table
  buffer.writeUInt32LE(0, 50); // Important color count
  
  // Pixel data (blue color: BGR format in BMP)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = 54 + (y * width + x) * pixelSize;
      buffer[offset] = 255; // Blue
      buffer[offset + 1] = 0; // Green
      buffer[offset + 2] = 0; // Red
    }
  }
  
  // Define the path where we want to save the image
  const imagePath = path.join(__dirname, '../../uploads/sri.bmp');
  
  // Write the image to the file system
  fs.writeFileSync(imagePath, buffer);
  
  console.log(`✅ Colored placeholder image created at: ${imagePath}`);
};

// Create the colored placeholder image
createColoredPlaceholder();
