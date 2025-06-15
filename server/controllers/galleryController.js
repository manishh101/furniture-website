const { GallerySection, GalleryConfig } = require('../models/Gallery');
const mongoose = require('mongoose');

const galleryController = {
  // Get all gallery sections and images
  getGallery: async (req, res) => {
    try {
      const sections = await GallerySection.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 });
      
      const config = await GalleryConfig.getConfig();
      
      res.json({
        success: true,
        data: {
          sections,
          config
        }
      });
    } catch (error) {
      console.error('Error fetching gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery',
        error: error.message
      });
    }
  },

  // Get gallery configuration
  getGalleryConfig: async (req, res) => {
    try {
      const config = await GalleryConfig.getConfig();
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error fetching gallery config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery config',
        error: error.message
      });
    }
  },

  // Update gallery configuration
  updateGalleryConfig: async (req, res) => {
    try {
      const userId = req.user?.id;
      const config = await GalleryConfig.updateConfig(req.body, userId);
      
      res.json({
        success: true,
        data: config,
        message: 'Gallery configuration updated successfully'
      });
    } catch (error) {
      console.error('Error updating gallery config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update gallery config',
        error: error.message
      });
    }
  },

  // Get all sections (admin)
  getSections: async (req, res) => {
    try {
      const sections = await GallerySection.find()
        .sort({ order: 1, createdAt: -1 });
      
      res.json({
        success: true,
        data: sections
      });
    } catch (error) {
      console.error('Error fetching sections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sections',
        error: error.message
      });
    }
  },

  // Create new gallery section
  createSection: async (req, res) => {
    try {
      const sectionData = {
        ...req.body,
        images: req.body.images || []
      };
      
      const section = new GallerySection(sectionData);
      await section.save();
      
      res.status(201).json({
        success: true,
        data: section,
        message: 'Gallery section created successfully'
      });
    } catch (error) {
      console.error('Error creating section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create section',
        error: error.message
      });
    }
  },

  // Update gallery section
  updateSection: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      res.json({
        success: true,
        data: section,
        message: 'Section updated successfully'
      });
    } catch (error) {
      console.error('Error updating section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update section',
        error: error.message
      });
    }
  },

  // Delete gallery section
  deleteSection: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findByIdAndDelete(id);
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Section deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete section',
        error: error.message
      });
    }
  },

  // Add image to section
  addImageToSection: async (req, res) => {
    try {
      const { sectionId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findById(sectionId);
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      const imageData = {
        ...req.body,
        order: section.images.length
      };
      
      section.images.push(imageData);
      await section.save();
      
      res.status(201).json({
        success: true,
        data: section,
        message: 'Image added successfully'
      });
    } catch (error) {
      console.error('Error adding image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add image',
        error: error.message
      });
    }
  },

  // Update image in section
  updateImageInSection: async (req, res) => {
    try {
      const { sectionId, imageId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findById(sectionId);
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      const imageIndex = section.images.findIndex(img => img.id === imageId);
      
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
      
      section.images[imageIndex] = {
        ...section.images[imageIndex].toObject(),
        ...req.body
      };
      
      await section.save();
      
      res.json({
        success: true,
        data: section,
        message: 'Image updated successfully'
      });
    } catch (error) {
      console.error('Error updating image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update image',
        error: error.message
      });
    }
  },

  // Delete image from section
  deleteImageFromSection: async (req, res) => {
    try {
      const { sectionId, imageId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findById(sectionId);
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      section.images = section.images.filter(img => img.id !== imageId);
      await section.save();
      
      res.json({
        success: true,
        data: section,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message
      });
    }
  },

  // Reorder sections
  reorderSections: async (req, res) => {
    try {
      const { sectionOrders } = req.body; // Array of { id, order }
      
      const updatePromises = sectionOrders.map(({ id, order }) => 
        GallerySection.findByIdAndUpdate(id, { order })
      );
      
      await Promise.all(updatePromises);
      
      res.json({
        success: true,
        message: 'Sections reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering sections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder sections',
        error: error.message
      });
    }
  },

  // Direct image upload (standalone)
  uploadImage: async (req, res) => {
    try {
      const { title, description, sectionId, featured = false } = req.body;
      const imageFile = req.file; // Assuming multer middleware for file upload
      
      if (!imageFile) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }
      
      if (!sectionId) {
        return res.status(400).json({
          success: false,
          message: 'Section ID is required'
        });
      }
      
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findById(sectionId);
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      // Create image object
      const newImage = {
        title: title || 'Untitled',
        description: description || '',
        src: `/uploads/${imageFile.filename}`, // Adjust path as needed
        alt: title || 'Gallery image',
        featured: featured === 'true' || featured === true,
        order: section.images.length
      };
      
      section.images.push(newImage);
      await section.save();
      
      res.json({
        success: true,
        data: newImage,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }
  },

  // Update individual image
  updateImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, featured, sectionId } = req.body;
      
      // Find the section containing this image
      const section = await GallerySection.findOne({ 'images._id': id });
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
      
      const image = section.images.id(id);
      
      if (title !== undefined) image.title = title;
      if (description !== undefined) image.description = description;
      if (featured !== undefined) image.featured = featured;
      
      await section.save();
      
      res.json({
        success: true,
        data: image,
        message: 'Image updated successfully'
      });
    } catch (error) {
      console.error('Error updating image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update image',
        error: error.message
      });
    }
  },

  // Delete individual image
  deleteImage: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the section containing this image
      const section = await GallerySection.findOne({ 'images._id': id });
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
      
      section.images.id(id).deleteOne();
      await section.save();
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message
      });
    }
  },

  // Reorder images within a section
  reorderImages: async (req, res) => {
    try {
      const { sectionId } = req.params;
      const { imageOrders } = req.body; // Array of { id, order }
      
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section ID'
        });
      }
      
      const section = await GallerySection.findById(sectionId);
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      // Update image orders
      imageOrders.forEach(({ id, order }) => {
        const imageIndex = section.images.findIndex(img => img.id === id);
        if (imageIndex !== -1) {
          section.images[imageIndex].order = order;
        }
      });
      
      // Sort images by order
      section.images.sort((a, b) => a.order - b.order);
      
      await section.save();
      
      res.json({
        success: true,
        data: section,
        message: 'Images reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder images',
        error: error.message
      });
    }
  }
};

module.exports = galleryController;
