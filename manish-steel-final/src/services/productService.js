/**
 * Products API Services
 */
import apiClient from './apiClient';

export const productAPI = {
  /**
   * Get all products
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response with products data
   */
  getAllProducts: (params = {}) => apiClient.get('/products', { params }),

  /**
   * Get product by ID
   * @param {string} id - Product ID 
   * @returns {Promise} - Response with product data
   */
  getProductById: (id) => apiClient.get(`/products/${id}`),

  /**
   * Create new product (admin only)
   * @param {Object} productData - Product data
   * @returns {Promise} - Response with new product
   */
  createProduct: (productData) => apiClient.post('/products', productData),

  /**
   * Update product (admin only)
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} - Response with updated product
   */
  updateProduct: (id, productData) => apiClient.put(`/products/${id}`, productData),

  /**
   * Delete product (admin only)
   * @param {string} id - Product ID
   * @returns {Promise} - Response with success message
   */
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  /**
   * Upload product image
   * @param {FormData} formData - Form data with image file
   * @returns {Promise} - Response with image URL
   */
  uploadImage: (formData) => {
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Get featured/top products (admin curated)
   * @param {number} limit - Number of products to fetch (default: 6)
   * @returns {Promise} - Response with featured products
   */
  getTopProducts: (limit = 6) => apiClient.get('/products/featured', { params: { limit } }),

  /**
   * Get most selling products (by sales data)
   * @param {number} limit - Number of products to fetch (default: 6)
   * @returns {Promise} - Response with best selling products
   */
  getMostSellingProducts: (limit = 6) => apiClient.get('/products/best-selling', { params: { limit } }),

  /**
   * Update product featured status (admin only)
   * @param {string} id - Product ID
   * @param {boolean} featured - Featured status
   * @returns {Promise} - Response with updated product
   */
  updateFeaturedStatus: (id, featured) => apiClient.patch(`/products/${id}/featured`, { featured }),

  /**
   * Update product sales count (for tracking best sellers)
   * @param {string} id - Product ID
   * @param {number} count - Sales count increment
   * @returns {Promise} - Response with updated product
   */
  updateSalesCount: (id, count = 1) => apiClient.patch(`/products/${id}/sales`, { count })
};