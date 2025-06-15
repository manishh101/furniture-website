const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/gallery/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.get('/', galleryController.getGallery);
router.get('/config', galleryController.getGalleryConfig);

// Admin routes (require authentication)
router.use(auth); // Apply authentication middleware to all routes below

// Gallery configuration management
router.put('/config', galleryController.updateGalleryConfig);

// Direct image management
router.post('/upload', upload.single('image'), galleryController.uploadImage);
router.put('/images/:id', galleryController.updateImage);
router.delete('/images/:id', galleryController.deleteImage);

// Section management
router.get('/sections', galleryController.getSections);
router.post('/sections', galleryController.createSection);
router.put('/sections/:id', galleryController.updateSection);
router.delete('/sections/:id', galleryController.deleteSection);
router.put('/sections/reorder', galleryController.reorderSections);

// Image management within sections
router.post('/sections/:sectionId/images', galleryController.addImageToSection);
router.put('/sections/:sectionId/images/:imageId', galleryController.updateImageInSection);
router.delete('/sections/:sectionId/images/:imageId', galleryController.deleteImageFromSection);
router.put('/sections/:sectionId/images/reorder', galleryController.reorderImages);

module.exports = router;
