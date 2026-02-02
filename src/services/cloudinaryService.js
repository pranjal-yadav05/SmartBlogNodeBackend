const cloudinary = require('../config/cloudinary');

/**
 * Cloudinary Service - Matches Spring Boot CloudinaryService
 */
const cloudinaryService = {
  /**
   * Upload image to Cloudinary
   * Matches CloudinaryService.uploadImage(byte[] imageBytes)
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<string>} - Secure URL of uploaded image
   */
  async uploadImage(imageBuffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            console.error('Failed to upload image to Cloudinary:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const Readable = require('stream').Readable;
      const readable = new Readable();
      readable._read = () => {};
      readable.push(imageBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  },

  /**
   * Delete image from Cloudinary
   * Matches CloudinaryService.deleteImage(String imageUrl)
   * @param {string} imageUrl - Cloudinary image URL
   */
  async deleteImage(imageUrl) {
    if (!imageUrl || imageUrl.trim() === '') {
      return;
    }

    try {
      const publicId = this.extractPublicId(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error.message);
    }
  },

  /**
   * Extract public ID from Cloudinary URL
   * Matches CloudinaryService.extractPublicId(String imageUrl)
   * @param {string} imageUrl - Cloudinary image URL
   * @returns {string|null} - Public ID or null
   */
  extractPublicId(imageUrl) {
    try {
      // Example: https://res.cloudinary.com/cloudname/image/upload/v12345/folder/id.jpg
      const uploadMarker = '/upload/';
      let startIndex = imageUrl.indexOf(uploadMarker);
      
      if (startIndex === -1) {
        return null;
      }
      
      startIndex += uploadMarker.length;
      
      // Skip version if present (v12345678/)
      if (imageUrl.charAt(startIndex) === 'v') {
        const nextSlash = imageUrl.indexOf('/', startIndex);
        if (nextSlash !== -1) {
          startIndex = nextSlash + 1;
        }
      }
      
      // End before the extension
      const endIndex = imageUrl.lastIndexOf('.');
      if (endIndex === -1 || endIndex <= startIndex) {
        return null;
      }
      
      return imageUrl.substring(startIndex, endIndex);
    } catch (error) {
      return null;
    }
  }
};

module.exports = cloudinaryService;
