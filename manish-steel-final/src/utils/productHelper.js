// Product helper functions

/**
 * Get product image URL with fallback
 * @param {Object} product - Product object
 * @returns {String} - Image URL
 */
export const getProductImage = (product) => {
  // If product has images, return the first one
  if (product && product.images && product.images.length > 0) {
    return product.images[0];
  }
  
  // Fallback to placeholder
  return '/images/placeholder.jpg';
};

/**
 * Format price with currency
 * @param {Number} price - Price in number format 
 * @param {String} currency - Currency symbol (default: NPR)
 * @returns {String} - Formatted price string
 */
export const formatPrice = (price, currency = 'NPR') => {
  if (typeof price !== 'number') return '';
  return `${currency} ${price.toLocaleString()}`;
};

/**
 * Filter products by category and subcategory
 * @param {Array} products - Array of product objects
 * @param {String} categoryId - Category ID
 * @param {String} subcategoryId - Subcategory ID (optional)
 * @returns {Array} - Filtered products
 */
export const filterProductsByCategory = (products, categoryId, subcategoryId = null) => {
  if (!products || !products.length) return [];
  
  // Return all products if category is 'all'
  if (categoryId === 'all') return products;
  
  // Filter by category
  let filtered = products.filter(product => product.categoryId === categoryId);
  
  // If subcategory is provided, filter further
  if (subcategoryId) {
    filtered = filtered.filter(product => product.subcategoryId === subcategoryId);
  }
  
  return filtered;
};

/**
 * Sort products by different criteria
 * @param {Array} products - Array of product objects
 * @param {String} sortOption - Sort option
 * @returns {Array} - Sorted products
 */
export const sortProducts = (products, sortOption) => {
  if (!products || !products.length) return [];
  
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case 'price-low-high':
      return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      
    case 'price-high-low':
      return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      
    case 'name-a-z':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      
    case 'name-z-a':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    
    case 'rating-high-low':
      return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
    default:
      return sortedProducts;
  }
};

/**
 * Search products by text query
 * @param {Array} products - Array of product objects
 * @param {String} query - Search query
 * @returns {Array} - Matching products
 */
export const searchProducts = (products, query) => {
  if (!products || !products.length || !query) return products;
  
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return products;
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm) ||
    product.subcategory?.toLowerCase().includes(searchTerm) ||
    (product.features && product.features.some(feature => 
      feature.toLowerCase().includes(searchTerm)
    ))
  );
};
