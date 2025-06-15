/**
 * Production-ready Image Service
 * Handles image optimization, fallbacks, and responsive loading
 */
import { 
  productPlaceholderImage, 
  householdFurniturePlaceholderImage, 
  officeProductsPlaceholderImage,
  bedsPlaceholderImage
} from '../utils/productPlaceholders';

class ImageService {
  static getCloudinaryUrl(publicId, transformations = {}) {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dwrrja8cz';
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    const {
      width = 800,
      height = 600,
      quality = 'auto:good',
      format = 'auto',
      crop = 'fill'
    } = transformations;
    
    const transformString = `w_${width},h_${height},q_${quality},f_${format},c_${crop}`;
    return `${baseUrl}/${transformString}/${publicId}`;
  }

  static getOptimizedImageUrl(imageUrl, options = {}) {
    // If no image URL provided, use placeholder as last resort
    if (!imageUrl) {
      console.warn('No image URL provided, using placeholder for category:', options.category);
      return this.getPlaceholderImage(options.category);
    }

    // PRIORITY 1: Cloudinary URLs - optimized cloud delivery
    if (this.isCloudinaryUrl(imageUrl)) {
      return this.enhanceCloudinaryUrl(imageUrl, options);
    }
    
    // PRIORITY 2: Server-hosted images - legacy support
    if (imageUrl.startsWith('/uploads/') || (imageUrl.startsWith('http') && !this.isPlaceholder(imageUrl))) {
      return imageUrl;
    }
    
    // PRIORITY 3: Relative paths - ensure proper formatting
    if (!imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  }
  
  // Helper to identify placeholder images
  static isPlaceholder(url) {
    return url && url.includes('/placeholders/');
  }

  static isCloudinaryUrl(url) {
    // More comprehensive check for Cloudinary URLs
    return url && (
      url.includes('res.cloudinary.com') || 
      url.includes('cloudinary.com') ||
      // Also match Cloudinary URLs that might be using custom CNAME
      (url.includes('/upload/') && 
       (url.includes('/v1/') || url.includes('/image/') || url.includes('/video/')))
    );
  }

  static enhanceCloudinaryUrl(url, options = {}) {
    const { width = 800, height = 600, quality = 'auto:good' } = options;
    
    // Check if URL already has transformations
    if (url.includes('/upload/') && !url.includes('w_')) {
      // Insert transformations into existing Cloudinary URL
      return url.replace(
        '/upload/', 
        `/upload/w_${width},h_${height},q_${quality},f_auto,c_fill/`
      );
    }
    return url;
  }

  static ensurePublicAssetUrl(url) {
    if (!url) return '';
    
    // If it's already an absolute URL or a path starting with /, return as is
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Otherwise, ensure it starts with '/'
    return `/${url}`;
  }

  static getPlaceholderImage(category = 'Product') {
    // Map categories to placeholder images - using imported images
    const categoryMap = {
      'beds': bedsPlaceholderImage,
      'chairs': householdFurniturePlaceholderImage,
      'tables': householdFurniturePlaceholderImage,
      'wardrobes': householdFurniturePlaceholderImage,
      'office-chairs': officeProductsPlaceholderImage,
      'office-desks': officeProductsPlaceholderImage,
      'storage': officeProductsPlaceholderImage,
      'lockers': officeProductsPlaceholderImage,
      'counters': officeProductsPlaceholderImage,
      'display-units': officeProductsPlaceholderImage,
      'filing-cabinets': officeProductsPlaceholderImage,
      'commercial-shelving': officeProductsPlaceholderImage,
      'office-storage': officeProductsPlaceholderImage,
      'wood-products': householdFurniturePlaceholderImage,
      'household-furniture': householdFurniturePlaceholderImage,
      'office-products': officeProductsPlaceholderImage
    };

    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
    // Ensure the URL is properly formatted
    return this.ensurePublicAssetUrl(categoryMap[normalizedCategory] || productPlaceholderImage);
  }

  static getResponsiveImageSet(imageUrl, options = {}) {
    const sizes = [400, 800, 1200];
    return sizes.map(size => ({
      url: this.getOptimizedImageUrl(imageUrl, { ...options, width: size, height: size }),
      width: size
    }));
  }

  static generateSrcSet(imageUrl, options = {}) {
    const responsiveSet = this.getResponsiveImageSet(imageUrl, options);
    return responsiveSet.map(img => `${img.url} ${img.width}w`).join(', ');
  }

  static getImageSizes() {
    return "(max-width: 480px) 400px, (max-width: 768px) 600px, (max-width: 1200px) 800px, 1200px";
  }

  static preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  static getImageAlt(product) {
    if (!product) return 'Product image';
    
    const name = product.name || 'Product';
    const category = product.category || '';
    
    return category ? `${name} - ${category}` : name;
  }
}

export default ImageService;
