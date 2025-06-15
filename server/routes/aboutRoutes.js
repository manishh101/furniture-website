const express = require('express');
const router = express.Router();
const { 
  getAboutContent, 
  updateAboutContent,
  updateAboutSection,
  updateWorkshopImages,
  updateCoreValue,
  deleteCoreValue
} = require('../controllers/aboutController');

// Import auth middleware
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAboutContent);

// For development purposes, making all routes accessible 
// In production, uncomment the auth middleware
router.put('/', updateAboutContent);
router.put('/section/:section', updateAboutSection);
router.put('/workshop-images', updateWorkshopImages);
router.put('/core-value/:valueId', updateCoreValue);
router.delete('/core-value/:valueId', deleteCoreValue);

// Production routes with authentication
// router.put('/', auth.protect, auth.admin, updateAboutContent);
// router.put('/section/:section', auth.protect, auth.admin, updateAboutSection);
// router.put('/workshop-images', auth.protect, auth.admin, updateWorkshopImages);
// router.put('/core-value/:valueId', auth.protect, auth.admin, updateCoreValue);
// router.delete('/core-value/:valueId', auth.protect, auth.admin, deleteCoreValue);

module.exports = router;
