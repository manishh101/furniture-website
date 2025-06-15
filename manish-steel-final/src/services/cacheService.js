/**
 * High-performance caching service for categories and products
 * Provides instant loading with smart cache management
 */
import { categoryAPI, productAPI } from './api';

class CacheService {
  constructor() {
    this.caches = {
      categories: new Map(),
      products: new Map(),
      categoryProducts: new Map(), // Cache for products by category
      metadata: new Map() // Cache metadata like timestamps, counts
    };
    
    this.cacheDuration = {
      categories: 5 * 60 * 1000, // 5 minutes
      products: 3 * 60 * 1000,   // 3 minutes
      categoryProducts: 2 * 60 * 1000 // 2 minutes
    };
    
    // Initialize cache cleanup
    this.startCacheCleanup();
  }

  /**
   * Cache key generators
   */
  getCategoryKey() {
    return 'all_categories';
  }

  getProductKey(category = 'all', subcategory = null) {
    return `products_${category}_${subcategory || 'none'}`;
  }

  getProductsMetaKey(category = 'all', subcategory = null) {
    return `meta_${this.getProductKey(category, subcategory)}`;
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(key, cacheType) {
    const entry = this.caches[cacheType].get(key);
    if (!entry) return false;
    
    const duration = this.cacheDuration[cacheType];
    const isValid = (Date.now() - entry.timestamp) < duration;
    
    if (!isValid) {
      this.caches[cacheType].delete(key);
    }
    
    return isValid;
  }

  /**
   * Set cache entry with timestamp
   */
  setCache(key, data, cacheType) {
    this.caches[cacheType].set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cache entry
   */
  getCache(key, cacheType) {
    const entry = this.caches[cacheType].get(key);
    return entry ? entry.data : null;
  }

  /**
   * Categories with instant loading
   */
  async getCategories(forceRefresh = false) {
    const key = this.getCategoryKey();
    
    // Return cached data if valid
    if (!forceRefresh && this.isCacheValid(key, 'categories')) {
      console.log('CacheService: Returning cached categories');
      return this.getCache(key, 'categories');
    }

    try {
      console.log('CacheService: Fetching fresh categories from API');
      const response = await categoryAPI.getAll(true);
      
      if (response?.data && Array.isArray(response.data)) {
        const normalizedCategories = response.data.map(this.normalizeCategory);
        
        // Cache the normalized data
        this.setCache(key, normalizedCategories, 'categories');
        
        console.log('CacheService: Cached', normalizedCategories.length, 'categories');
        return normalizedCategories;
      }
      
      throw new Error('Invalid categories response');
    } catch (error) {
      console.warn('CacheService: Categories API failed, using fallback:', error.message);
      
      // Return cached data if available, even if expired
      const cachedData = this.getCache(key, 'categories');
      if (cachedData) {
        console.log('CacheService: Using expired cache as fallback');
        return cachedData;
      }
      
      // Ultimate fallback to empty array
      return [];
    }
  }

  /**
   * Products with intelligent caching and instant loading
   */
  async getProducts(category = 'all', subcategory = null, forceRefresh = false) {
    const key = this.getProductKey(category, subcategory);
    
    // Return cached data if valid
    if (!forceRefresh && this.isCacheValid(key, 'categoryProducts')) {
      console.log('CacheService: Returning cached products for', { category, subcategory });
      return this.getCache(key, 'categoryProducts');
    }

    try {
      console.log('CacheService: Fetching fresh products from API for', { category, subcategory });
      
      let response;
      if (category === 'all') {
        // Get all products
        response = await productAPI.getAll(1, 1000);
      } else {
        // Get products by category
        response = await productAPI.getByCategoryAlternative(category, { 
          subcategory,
          limit: 1000,
          timestamp: Date.now()
        });
      }
      
      if (response?.data) {
        const products = Array.isArray(response.data) ? response.data : response.data.products || [];
        
        // Cache the products
        this.setCache(key, products, 'categoryProducts');
        
        // Cache metadata
        const metaKey = this.getProductsMetaKey(category, subcategory);
        this.setCache(metaKey, {
          count: products.length,
          category,
          subcategory,
          lastFetch: Date.now()
        }, 'metadata');
        
        console.log('CacheService: Cached', products.length, 'products for', { category, subcategory });
        return products;
      }
      
      throw new Error('Invalid products response');
    } catch (error) {
      console.warn('CacheService: Products API failed, using fallback:', error.message);
      
      // Return cached data if available, even if expired
      const cachedData = this.getCache(key, 'categoryProducts');
      if (cachedData) {
        console.log('CacheService: Using expired cache as fallback');
        return Array.isArray(cachedData) ? cachedData : []; // Ensure it's an array
      }
      
      // Ultimate fallback to empty array
      console.log('CacheService: Ultimate fallback - returning empty products array');
      return [];
    }
  }

  /**
   * Preload common products for browsing
   */
  async preloadCommonProducts() {
    // Already preloaded products
    const preloadedCategories = new Set();
    
    try {
      // Get all categories
      const categories = await this.getCategories();
      
      if (!categories || categories.length === 0) {
        console.warn('CacheService: No categories to preload products for');
        return;
      }
      
      // Preload top categories (max 3)
      const topCategories = categories.slice(0, 3);
      
      console.log(`CacheService: Preloading products for ${topCategories.length} top categories`);
      
      for (const category of topCategories) {
        // Skip if already preloaded
        const categoryId = category._id || category.id;
        if (preloadedCategories.has(categoryId)) continue;
        
        // Preload category products
        this.getProducts(categoryId).catch(err => {
          console.warn(`Failed to preload products for ${category.name}:`, err.message);
        });
        
        preloadedCategories.add(categoryId);
      }
      
      // Import and use CategoryImageService to preload thumbnails
      if (typeof window !== 'undefined') {
        import('./categoryImageService').then(module => {
          const CategoryImageService = module.default;
          CategoryImageService.preloadCommonCategoryThumbnails();
        });
      }
      
      console.log(`CacheService: Preloaded products for ${preloadedCategories.size} categories`);
    } catch (err) {
      console.error('CacheService: Error preloading products:', err);
    }
  }

  /**
   * Normalize category data
   */
  normalizeCategory = (category) => {
    const categoryId = category._id || category.id;
    
    let subcategories = [];
    if (Array.isArray(category.subcategories)) {
      subcategories = category.subcategories.map(sub => ({
        id: sub._id || sub.id,
        name: sub.name || '',
        parentId: categoryId
      }));
    }

    return {
      id: categoryId,
      name: category.name || '',
      description: category.description || '',
      image: category.image || null,
      subcategories
    };
  };

  /**
   * Clear specific cache
   */
  clearCache(cacheType, key = null) {
    if (key) {
      this.caches[cacheType].delete(key);
    } else {
      this.caches[cacheType].clear();
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    Object.keys(this.caches).forEach(cacheType => {
      this.caches[cacheType].clear();
    });
    console.log('CacheService: All caches cleared');
  }

  /**
   * Start automatic cache cleanup
   */
  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      let totalCleaned = 0;
      
      Object.entries(this.caches).forEach(([cacheType, cache]) => {
        const duration = this.cacheDuration[cacheType];
        if (!duration) return;
        
        const entriesToDelete = [];
        cache.forEach((entry, key) => {
          if (now - entry.timestamp > duration) {
            entriesToDelete.push(key);
          }
        });
        
        entriesToDelete.forEach(key => {
          cache.delete(key);
          totalCleaned++;
        });
      });
      
      if (totalCleaned > 0) {
        console.log('CacheService: Cleaned', totalCleaned, 'expired cache entries');
      }
    }, 60000); // Clean every minute
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {};
    Object.entries(this.caches).forEach(([cacheType, cache]) => {
      stats[cacheType] = {
        size: cache.size,
        entries: Array.from(cache.keys())
      };
    });
    return stats;
  }
}

// Create and export singleton instance
const cacheService = new CacheService();

// Start preloading on initialization
setTimeout(() => {
  cacheService.preloadCommonProducts();
}, 1000);

export default cacheService;
