/**
 * Cloudinary Configuration Checker
 * 
 * This utility verifies that Cloudinary is properly configured
 * and logs information about the setup status.
 */
const cloudinary = require('cloudinary').v2;

/**
 * Verifies Cloudinary configuration and connection
 * @returns {Promise<boolean>} True if configuration is valid
 */
const verifyCloudinaryConfig = async () => {
  try {
    // Check if environment variables are set
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary environment variables missing. Image uploads will fail.');
      console.error('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
      return false;
    }
    
    // Ping Cloudinary to verify credentials
    const result = await cloudinary.api.ping();
    
    if (result && result.status === 'ok') {
      console.log('✅ Cloudinary configuration verified successfully');
      console.log(`   - Cloud name: ${CLOUDINARY_CLOUD_NAME}`);
      console.log(`   - Using folder: manish-steel/products`);
      return true;
    } else {
      console.error('❌ Cloudinary configuration error. Image uploads will fail.');
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary verification failed with error:', error.message);
    console.error('   Please check your Cloudinary credentials');
    return false;
  }
};

module.exports = { verifyCloudinaryConfig };
