/**
 * Production-ready Image Service
 * Handles image optimization, fallbacks, and responsive loading
 */

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
    if (!imageUrl) {
      return this.getPlaceholderImage(options.category);
    }

    // Check if it's already a Cloudinary URL
    if (this.isCloudinaryUrl(imageUrl)) {
      return this.enhanceCloudinaryUrl(imageUrl, options);
    }
    
    // For legacy server URLs, return as-is
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // For relative paths, ensure they start with /
    if (!imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  }

  static isCloudinaryUrl(url) {
    return url && (url.includes('res.cloudinary.com') || url.includes('cloudinary.com'));
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

  static getPlaceholderImage(category = 'Product') {
    // Map categories to placeholder images
    const categoryMap = {
      'beds': '/placeholders/Beds.png',
      'chairs': '/placeholders/Chairs.png',
      'tables': '/placeholders/Tables.png',
      'wardrobes': '/placeholders/Almirahs-Wardrobes.png',
      'office-chairs': '/placeholders/Office-Chairs.png',
      'office-desks': '/placeholders/Office-Desks.png',
      'storage': '/placeholders/Storage-Racks.png',
      'lockers': '/placeholders/Lockers.png',
      'counters': '/placeholders/Counters.png',
      'display-units': '/placeholders/Display-Units.png',
      'filing-cabinets': '/placeholders/Filing-Cabinets.png',
      'commercial-shelving': '/placeholders/Commercial-Shelving.png',
      'office-storage': '/placeholders/Office-Storage.png',
      'wood-products': '/placeholders/Wood-Products.png',
      'household-furniture': '/placeholders/Household-Furniture.png',
      'office-products': '/placeholders/Office-Products.png'
    };

    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
    return categoryMap[normalizedCategory] || '/placeholders/Product.png';
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
