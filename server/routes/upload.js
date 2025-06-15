const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-secure').auth;
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

/**
 * @route   POST api/upload
 * @desc    Upload images to Cloudinary
 * @access  Private
 * @returns {Object} urls - Array of Cloudinary image URLs
 */
router.post('/', auth, cloudinaryUpload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files uploaded' 
      });
    }
    
    // Extract Cloudinary URLs from the uploaded files
    const fileUrls = req.files.map(file => file.path);
    
    // Return success response with image URLs
    res.status(200).json({ 
      success: true, 
      urls: fileUrls,
      count: fileUrls.length
    });
  } catch (err) {
    console.error('Image upload error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: err.message
    });
  }
});

module.exports = router;
