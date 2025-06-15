/**
 * Service to fetch category thumbnail images from product database
 * Shows actual product images for category thumbnails instead of placeholders
 */
import { productAPI } from './api';
import { getLocalPlaceholder } from '../utils/placeholders';
import ImageService from './imageService';
import cacheService from './cacheService';

// In-memory cache for category thumbnail images
const categoryThumbnailCache = {};

class CategoryImageService {
  /**
   * Get a thumbnail image for a specific category from its products
   * 
   * @param {string} categoryId - The ID of the category
   * @param {string} categoryName - The name of the category (used for fallback)
   * @returns {Promise<string>} URL of an image from a product in this category
   */
  static async getCategoryThumbnailImage(categoryId, categoryName) {
    try {
      // First check if we have this category thumbnail in the cache
      if (categoryThumbnailCache[categoryId]) {
        console.log(`Using cached thumbnail for category ${categoryName}`);
        return categoryThumbnailCache[categoryId];
      }

      console.log(`Fetching thumbnail for category ${categoryName}`);
      
      // Try to get products from cache first for better performance
      let products;
      try {
        products = await cacheService.getProducts(categoryId);
        console.log(`Got ${products.length} products from cache for category ${categoryName}`);
      } catch (cacheError) {
        // If cache fails, fetch from API directly
        console.log(`Cache miss for category ${categoryName}, fetching from API`);
        const response = await productAPI.getByCategory(categoryId, { limit: 4 });
        products = response.data.products || response.data || [];
      }
      
      // Look for a product with a Cloudinary image
      let thumbnailUrl = null;
      
      if (products && products.length > 0) {
        // First, try to find a product with a Cloudinary image
        const productWithCloudinaryImage = products.find(product => 
          product.image && ImageService.isCloudinaryUrl(product.image)
        );
        
        if (productWithCloudinaryImage) {
          thumbnailUrl = ImageService.getOptimizedImageUrl(productWithCloudinaryImage.image, {
            width: 400,
            height: 500,
            category: categoryName
          });
        } 
        // If no product has a Cloudinary main image, check additional images
        else {
          const productWithAdditionalImages = products.find(product => 
            product.images && product.images.length > 0
          );
          
          if (productWithAdditionalImages && productWithAdditionalImages.images[0]) {
            thumbnailUrl = ImageService.getOptimizedImageUrl(productWithAdditionalImages.images[0], {
              width: 400,
              height: 500,
              category: categoryName
            });
          }
        }
      }
      
      // If we couldn't find any suitable product image, use a placeholder
      if (!thumbnailUrl) {
        console.warn(`No suitable product images found for category ${categoryName}, using placeholder`);
        const placeholderUrl = `https://via.placeholder.com/400x500/0057A3/FFFFFF?text=${encodeURIComponent(categoryName)}`;
        thumbnailUrl = getLocalPlaceholder(placeholderUrl);
      } else {
        console.log(`Found product image for category ${categoryName}: ${thumbnailUrl.substring(0, 50)}...`);
      }
      
      // Cache the result
      categoryThumbnailCache[categoryId] = thumbnailUrl;
      
      return thumbnailUrl;
    } catch (error) {
      console.error(`Error fetching thumbnail for category ${categoryName}:`, error);
      // Fallback to placeholder
      const placeholderUrl = `https://via.placeholder.com/400x500/0057A3/FFFFFF?text=${encodeURIComponent(categoryName)}`;
      return getLocalPlaceholder(placeholderUrl);
    }
  }
  
  /**
   * Preload thumbnails for common categories
   */
  static async preloadCommonCategoryThumbnails() {
    try {
      const categories = await cacheService.getCategories();
      
      // Only preload for up to 3 main categories to avoid too many requests
      const categoriesToPreload = categories.slice(0, 3);
      
      console.log(`Preloading thumbnails for ${categoriesToPreload.length} categories`);
      
      // Fetch thumbnails in parallel
      await Promise.all(
        categoriesToPreload.map(category => 
          this.getCategoryThumbnailImage(category._id || category.id, category.name)
        )
      );
      
      console.log('Category thumbnails preloaded successfully');
    } catch (error) {
      console.error('Error preloading category thumbnails:', error);
    }
  }
}

export default CategoryImageService;
