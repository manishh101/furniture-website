/**
 * Enhanced Cloudinary Image Service
 * Specialized service for handling Cloudinary images in production environments
 */

class CloudinaryImageService {
  /**
   * Get cloudinary configuration
   * @returns {Object} Cloudinary configuration
   */
  static getConfig() {
    return {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dwrrja8cz',
      apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY || '',
      uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'manish-steel',
      folder: process.env.REACT_APP_CLOUDINARY_FOLDER || 'manish-steel'
    };
  }

  /**
   * Check if a URL is a Cloudinary URL
   * @param {string} url - The URL to check
   * @returns {boolean} - Whether the URL is a Cloudinary URL
   */
  static isCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // More flexible Cloudinary URL detection
    return (
      url.includes('cloudinary.com') || 
      url.includes('res.cloudinary.com') || 
      url.includes('cloudinary.com/image/upload') ||
      url.includes('/upload/v')
    );
  }

  /**
   * Sanitize and normalize an image URL for consistent processing
   * @param {string|Object} image - The image URL or object
   * @returns {string} - A clean, normalized URL
   */
  static normalizeImageUrl(image) {
    // Handle different image formats
    if (!image) return '';
    
    let url = '';
    if (typeof image === 'string') {
      url = image.trim();
    } else if (typeof image === 'object') {
      // Extract URL from object with multiple possible properties
      url = (
        image.url || 
        image.src || 
        image.path || 
        image.image || 
        image.imageUrl || 
        image.secure_url || 
        ''
      ).trim();
      
      // For Cloudinary image objects, make sure we get the best URL
      if (image.secure_url) {
        return image.secure_url;
      }
    }
    
    // Handle empty URL
    if (!url) return '';
    
    // Handle relative URL paths
    if (url.startsWith('/')) {
      // In production, use the REACT_APP_API_URL environment variable if available
      const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${baseApiUrl}${url}`;
    }
    
    // For Cloudinary URLs, make sure we use HTTPS
    if (url.startsWith('http:') && url.includes('cloudinary.com')) {
      return url.replace('http:', 'https:');
    }
    
    // Return already formed URL
    return url;
  }

  /**
   * Optimize a Cloudinary URL with proper transformations
   * @param {string} url - The Cloudinary URL
   * @param {Object} options - Transformation options
   * @returns {string} - The optimized URL
   */
  static optimizeCloudinaryUrl(url, options = {}) {
    if (!url || !this.isCloudinaryUrl(url)) return url;
    
    // Extract components from the URL
    const { cloudName } = this.getConfig();
    
    try {
      // Parse the URL - be more flexible with URL formats
      let baseUrl, publicId;
      
      // Handle standard cloudinary URLs
      if (url.includes('/upload/')) {
        // Remove any existing transformations for consistency
        const cleanUrl = url.replace(/\/[^/]+\/upload\//, '/upload/');
        const urlParts = cleanUrl.split('/upload/');
        
        if (urlParts.length !== 2) return url; // Not a standard Cloudinary URL
        baseUrl = urlParts[0] + '/upload';
        publicId = urlParts[1];
        
        // Remove any query parameters from the public ID
        if (publicId.includes('?')) {
          publicId = publicId.split('?')[0];
        }
      } else {
        // Fallback for non-standard URLs
        return url;
      }
      
      // Build transformation string
      const {
        width = 1600, // Higher default width for better viewing 
        height = 1600, // Higher default height for better viewing
        quality = 'auto:best', // Use best quality by default
        format = 'auto',
        crop = 'fit' // Use 'fit' instead of 'limit' to ensure no cropping and proper scaling
      } = options;
      
      // Build a comprehensive transformation string that guarantees full image visibility
      const transformations = `w_${width},h_${height},q_${quality},f_${format},c_${crop},dpr_auto`;
      
      // Create the optimized URL
      return `${baseUrl}/${transformations}/${publicId}`;
    } catch (error) {
      console.error('Error optimizing Cloudinary URL:', error);
      return url; // Return original URL if there's an error
    }
  }

  /**
   * Get a properly formatted Cloudinary URL for a public ID
   * @param {string} publicId - The Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} - The formatted Cloudinary URL
   */
  static getUrlFromPublicId(publicId, options = {}) {
    if (!publicId) return '';
    
    const { cloudName } = this.getConfig();
    const {
      width = 800,
      height = 600,
      quality = 'auto:good',
      format = 'auto',
      crop = 'fill'
    } = options;
    
    const transformations = `w_${width},h_${height},q_${quality},f_${format},c_${crop}`;
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Process gallery images to ensure they're properly formatted for display
   * @param {Array} images - Array of image objects or URLs
   * @param {Object} options - Transformation options
   * @returns {Array} - Processed images ready for display
   */
  static processGalleryImages(images, options = {}) {
    if (!Array.isArray(images)) {
      console.warn('Invalid images array provided to processGalleryImages');
      return [];
    }
    
    return images.map(image => {
      // Normalize the URL first
      const normalizedUrl = this.normalizeImageUrl(image);
      
      if (!normalizedUrl) return '';
      
      // Process Cloudinary URLs with optimizations
      if (this.isCloudinaryUrl(normalizedUrl)) {
        return this.optimizeCloudinaryUrl(normalizedUrl, options);
      }
      
      // Return non-Cloudinary URLs as is
      return normalizedUrl;
    }).filter(Boolean); // Remove empty URLs
  }
  
  /**
   * Validate and repair gallery images that might be broken
   * @param {Array} images - Array of image objects or URLs
   * @returns {Array} - Validated and repaired image URLs
   */
  static validateGalleryImages(images) {
    // If input isn't an array, handle gracefully
    if (!Array.isArray(images)) {
      if (!images) return [];
      // Try to convert single item to array
      if (typeof images === 'string' || typeof images === 'object') {
        return this.processGalleryImages([images]);
      }
      return [];
    }
    
    // Filter out invalid entries and normalize URLs
    return this.processGalleryImages(images);
  }
}

export default CloudinaryImageService;
