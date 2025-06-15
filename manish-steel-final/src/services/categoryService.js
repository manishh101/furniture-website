/**
 * Categories API Services
 */
import apiClient from './apiClient';

export const categoryAPI = {
  /**
   * Get all categories
   * @returns {Promise} - Response with categories data
   */
  getAllCategories: () => apiClient.get('/categories'),

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise} - Response with category data
   */
  getCategoryById: (id) => apiClient.get(`/categories/${id}`),

  /**
   * Create new category (admin only)
   * @param {Object} categoryData - Category data
   * @returns {Promise} - Response with new category
   */
  createCategory: (categoryData) => apiClient.post('/categories', categoryData),

  /**
   * Update category (admin only)
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} - Response with updated category
   */
  updateCategory: (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData),

  /**
   * Delete category (admin only)
   * @param {string} id - Category ID
   * @returns {Promise} - Response with success message
   */
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`)
};

export default categoryAPI;
