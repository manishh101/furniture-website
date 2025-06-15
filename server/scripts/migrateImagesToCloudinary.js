/**
 * Migrate Existing Images to Cloudinary
 * 
 * This script migrates all existing images from the local filesystem
 * to Cloudinary cloud storage and updates the database references.
 * 
 * Usage:
 * node scripts/migrateImagesToCloudinary.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadDir = path.join(__dirname, '../uploads');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the local file
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadToCloudinary = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'manish-steel/products',
      use_filename: true,
      unique_filename: true
    });
    
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error.message);
    return null;
  }
};

/**
 * Process all local images and migrate to Cloudinary
 */
const migrateImages = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products to process`);
    
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    
    // Process each product
    for (const product of products) {
      console.log(`Processing product: ${product.name}`);
      
      // Handle main image
      if (product.image && (product.image.startsWith('/uploads/') || product.image.startsWith('uploads/'))) {
        // Handle paths with or without leading slash
        const imagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
        const localPath = path.join(__dirname, '..', imagePath);
        console.log(`Uploading main image: ${localPath}`);
        
        const cloudinaryUrl = await uploadToCloudinary(localPath);
        
        if (cloudinaryUrl) {
          product.image = cloudinaryUrl;
          successCount++;
          console.log(`✓ Uploaded to ${cloudinaryUrl}`);
        } else {
          failCount++;
          console.log(`✗ Failed to upload main image`);
        }
      } else if (product.image && product.image.includes('cloudinary')) {
        console.log('Main image already on Cloudinary, skipping');
        skippedCount++;
      } else if (product.image) {
        console.log(`Unrecognized image path format: ${product.image}`);
      }
      
      // Handle additional images
      if (product.images && product.images.length > 0) {
        const updatedImages = [];
        
        for (let i = 0; i < product.images.length; i++) {
          const imgPath = product.images[i];
          
          if (imgPath.startsWith('/uploads/') || imgPath.startsWith('uploads/')) {
            // Handle paths with or without leading slash
            const fixedPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
            const localPath = path.join(__dirname, '..', fixedPath);
            console.log(`Uploading additional image ${i+1}: ${localPath}`);
            
            const cloudinaryUrl = await uploadToCloudinary(localPath);
            
            if (cloudinaryUrl) {
              updatedImages.push(cloudinaryUrl);
              successCount++;
              console.log(`✓ Uploaded to ${cloudinaryUrl}`);
            } else {
              failCount++;
              console.log(`✗ Failed to upload additional image ${i+1}`);
            }
          } else if (imgPath.includes('cloudinary')) {
            updatedImages.push(imgPath);
            console.log(`Additional image ${i+1} already on Cloudinary, skipping`);
            skippedCount++;
          } else {
            updatedImages.push(imgPath);
            console.log(`Unrecognized image path format for additional image ${i+1}: ${imgPath}`);
          }
        }
        
        product.images = updatedImages;
      }
      
      // Save product with updated image URLs
      await product.save();
      console.log(`Updated product: ${product._id}\n`);
    }
    
    console.log('\nMigration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} images`);
    console.log(`❌ Failed to migrate: ${failCount} images`);
    console.log(`⏭️ Skipped (already on Cloudinary): ${skippedCount} images`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Start migration
migrateImages().then(() => {
  console.log('Migration process completed');
});
