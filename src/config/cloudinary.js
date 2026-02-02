const cloudinary = require('cloudinary').v2;

// Parse Cloudinary URL and configure
// URL format: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  // Cloudinary auto-configures from CLOUDINARY_URL environment variable
  cloudinary.config({
    secure: true
  });
}

module.exports = cloudinary;
