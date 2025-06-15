/**
 * Database Status Checker for Manish Steel
 * Verifies Cloudinary migration status
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const checkDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to manish-steel database');

    // Get total product count
    const totalProducts = await Product.countDocuments();
    console.log(`\n📊 Total products in database: ${totalProducts}`);

    // Check for local image URLs
    const localImageCount = await Product.countDocuments({
      $or: [
        { image: { $regex: '^/images/' } },
        { images: { $elemMatch: { $regex: '^/images/' } } }
      ]
    });

    // Check for Cloudinary URLs
    const cloudinaryCount = await Product.countDocuments({
      $or: [
        { image: { $regex: 'cloudinary.com' } },
        { images: { $elemMatch: { $regex: 'cloudinary.com' } } }
      ]
    });

    console.log(`🖼️  Products with local images: ${localImageCount}`);
    console.log(`☁️  Products with Cloudinary images: ${cloudinaryCount}`);

    // Get sample products for verification
    console.log('\n📋 Sample product images:');
    const samples = await Product.find({}).limit(3).select('name image images');
    
    samples.forEach((product, i) => {
      console.log(`\n${i + 1}. ${product.name}:`);
      console.log(`   Main: ${product.image}`);
      if (product.images?.length > 0) {
        console.log(`   Gallery: ${product.images.length} images`);
        console.log(`   First: ${product.images[0]}`);
      }
    });

    // Migration status
    console.log('\n🎯 Migration Status:');
    if (localImageCount === 0 && cloudinaryCount === totalProducts) {
      console.log('✅ COMPLETE: All products use Cloudinary');
    } else if (localImageCount > 0) {
      console.log('❌ INCOMPLETE: Some products still use local URLs');
    } else {
      console.log('⚠️  UNKNOWN: Manual verification needed');
    }

    // Check for any mixed cases
    const mixedProducts = await Product.find({
      $and: [
        {
          $or: [
            { image: { $regex: '^/images/' } },
            { images: { $elemMatch: { $regex: '^/images/' } } }
          ]
        },
        {
          $or: [
            { image: { $regex: 'cloudinary.com' } },
            { images: { $elemMatch: { $regex: 'cloudinary.com' } } }
          ]
        }
      ]
    }).select('name image images');

    if (mixedProducts.length > 0) {
      console.log(`\n⚠️  Warning: ${mixedProducts.length} products have mixed URLs`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from database');
  }
};

checkDatabase();
