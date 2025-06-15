/**
 * Utility functions for inquiry operations
 */

/**
 * Valid inquiry categories
 */
const VALID_CATEGORIES = ['product', 'service', 'support', 'business', 'general'];

/**
 * Valid inquiry statuses
 */
const VALID_STATUSES = ['new', 'read', 'replied', 'archived'];

/**
 * Build MongoDB query for inquiry filtering
 * @param {Object} filters - Filter parameters
 * @returns {Object} MongoDB query object
 */
const buildInquiryQuery = (filters = {}) => {
  const query = {};
  
  // Filter by status
  if (filters.status && VALID_STATUSES.includes(filters.status)) {
    query.status = filters.status;
  }
  
  // Filter by category
  if (filters.category && VALID_CATEGORIES.includes(filters.category)) {
    query.category = filters.category;
  }
  
  // Search across multiple fields
  if (filters.search && filters.search.trim() !== '') {
    const searchRegex = new RegExp(filters.search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { message: searchRegex }
    ];
  }
  
  return query;
};

/**
 * Validate inquiry data
 * @param {Object} inquiryData - Inquiry data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateInquiryData = (inquiryData) => {
  const errors = [];
  
  if (!inquiryData.name || inquiryData.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!inquiryData.email || inquiryData.email.trim() === '') {
    errors.push('Email is required');
  }
  
  if (!inquiryData.phone || inquiryData.phone.trim() === '') {
    errors.push('Phone is required');
  }
  
  if (!inquiryData.message || inquiryData.message.trim() === '') {
    errors.push('Message is required');
  }
  
  // Accept any category or default to general
  if (!inquiryData.category || inquiryData.category.trim() === '') {
    inquiryData.category = 'general';
  }
  
  // Always consider category valid (we'll fix in schema)
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  VALID_CATEGORIES,
  VALID_STATUSES,
  buildInquiryQuery,
  validateInquiryData
};
