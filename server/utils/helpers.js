/**
 * Helper functions for the API
 */

/**
 * Format product data for API response
 * @param {Object} product - Mongoose product object
 * @returns {Object} Formatted product object
 */
const formatProduct = (product) => {
  const formatted = product.toObject();
  
  // Set category name
  formatted.category = product.categoryId ? product.categoryId.name : '';
  
  // For subcategory, prioritize the string value from our fix
  if (product.subcategory && product.subcategory !== product.category) {
    formatted.subcategory = product.subcategory;
  } else if (product.subcategoryId && product.subcategoryId.name) {
    formatted.subcategory = product.subcategoryId.name;
  } else {
    formatted.subcategory = '';
  }
  
  return formatted;
};

/**
 * Helper to create standard response object
 * @param {Boolean} success - Success status
 * @param {String} message - Response message
 * @param {Object} data - Response data
 * @returns {Object} Formatted response
 */
const createResponse = (success = true, message = '', data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  formatProduct,
  createResponse
};
