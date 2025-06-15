/**
 * Cloudinary Configuration Setup
 * 
 * This file configures Cloudinary with the provided credentials
 */
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwrrja8cz',
  api_key: process.env.CLOUDINARY_API_KEY || '747568555475638',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ps6vt8q6mtzu2vIPeHEBNFFnkFY',
  secure: true
});

/**
 * Tests the Cloudinary connection
 * @returns {Promise<boolean>} True if connection is successful
 */
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result && result.status === 'ok') {
      console.log('✅ Cloudinary connection successful');
      return true;
    } else {
      console.error('❌ Cloudinary connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary connection error:', error.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  testConnection
}; 