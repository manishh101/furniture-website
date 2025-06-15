/**
 * Cloudinary Upload Middleware
 * 
 * This module configures Cloudinary for image uploads, providing a professional
 * cloud-based image storage and delivery solution.
 */
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const { cloudinary } = require('../utils/cloudinarySetup');

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'manish-steel/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { quality: 'auto:good' }, // Automatic quality optimization
      { fetch_format: 'auto' },  // Deliver images in optimal format
      { width: 1500, crop: 'limit' }, // Limit max width while maintaining aspect ratio
      { dpr: 'auto' } // Automatically adjust for device pixel ratio
    ],
    // Generate unique filename to avoid conflicts
    filename: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      return `product-${uniqueSuffix}${ext}`;
    }
  }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF and WEBP are allowed.'), false);
  }
};

// Create multer upload instance with Cloudinary storage
const cloudinaryUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

module.exports = cloudinaryUpload;
