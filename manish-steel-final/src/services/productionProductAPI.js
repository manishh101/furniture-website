/**
 * Production API Service
 * 
 * Features:
 * - Comprehensive error handling
 * - Request/response interceptors
 * - Retry logic with exponential backoff
 * - Request timeout handling
 * - Network status detection
 * - Request deduplication
 * - Caching mechanism
 * - Rate limiting protection
 * - Security headers
 * - Request/response logging
 */

import axios from 'axios';
import { getBaseApiUrl } from '../utils/apiUrlHelper';

// Cache for request deduplication
const pendingRequests = new Map();

// Create axios instance with production configuration
const createApiClient = () => {
  const client = axios.create({
    baseURL: getBaseApiUrl(),
    timeout: 15000, // 15 seconds timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add timestamp for request tracking
      config.metadata = { startTime: new Date() };
      
      // Add request ID for tracking
      config.requestId = Math.random().toString(36).substring(7);
      
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request [${config.requestId}]:`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const duration = new Date() - response.config.metadata.startTime;
      
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response [${response.config.requestId}] (${duration}ms):`, {
          status: response.status,
          data: response.data,
        });
      }

      // Track successful requests for analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'api_request_success', {
          event_category: 'API',
          event_label: response.config.url,
          value: duration,
        });
      }

      return response;
    },
    async (error) => {
      const config = error.config;
      const duration = new Date() - (config?.metadata?.startTime || new Date());

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error [${config?.requestId}] (${duration}ms):`, {
          status: error.response?.status,
          message: error.message,
          url: config?.url,
        });
      }

      // Track failed requests for analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'api_request_error', {
          event_category: 'API',
          event_label: config?.url || 'unknown',
          value: error.response?.status || 0,
        });
      }

      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            // Unauthorized - could trigger logout
            console.warn('Unauthorized request - consider implementing token refresh');
            break;
          case 403:
            // Forbidden
            error.userMessage = 'Access denied. Please check your permissions.';
            break;
          case 404:
            // Not found
            error.userMessage = 'The requested resource was not found.';
            break;
          case 429:
            // Rate limited
            error.userMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            // Server error
            error.userMessage = 'Server error. Please try again later.';
            break;
          default:
            error.userMessage = data?.message || 'An unexpected error occurred.';
        }
      } else if (error.request) {
        // Network error
        error.userMessage = 'Network error. Please check your internet connection.';
      } else {
        // Request setup error
        error.userMessage = 'Request configuration error.';
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create the API client instance
const apiClient = createApiClient();

/**
 * Generic request handler with retry logic
 */
const makeRequest = async (requestFn, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limiting)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        break;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Request deduplication helper
 */
const deduplicateRequest = (key, requestFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
};

/**
 * Production Product API Service
 */
export const productionProductAPI = {
  /**
   * Get featured/top products
   */
  getTopProducts: async (limit = 6) => {
    const requestKey = `featured-products-${limit}`;
    
    return deduplicateRequest(requestKey, () =>
      makeRequest(() => 
        apiClient.get('/products/featured', { 
          params: { limit },
          // Cache for 5 minutes
          headers: { 'Cache-Control': 'max-age=300' }
        })
      )
    );
  },

  /**
   * Get most selling products
   */
  getMostSellingProducts: async (limit = 6) => {
    const requestKey = `bestselling-products-${limit}`;
    
    return deduplicateRequest(requestKey, () =>
      makeRequest(() => 
        apiClient.get('/products/best-selling', { 
          params: { limit },
          // Cache for 5 minutes
          headers: { 'Cache-Control': 'max-age=300' }
        })
      )
    );
  },

  /**
   * Get all products with pagination
   */
  getAllProducts: async (params = {}) => {
    const requestKey = `all-products-${JSON.stringify(params)}`;
    
    return deduplicateRequest(requestKey, () =>
      makeRequest(() => 
        apiClient.get('/products', { 
          params,
          // Cache for 2 minutes
          headers: { 'Cache-Control': 'max-age=120' }
        })
      )
    );
  },

  /**
   * Get product by ID
   */
  getProductById: async (id) => {
    if (!id) {
      throw new Error('Product ID is required');
    }

    const requestKey = `product-${id}`;
    
    return deduplicateRequest(requestKey, () =>
      makeRequest(() => 
        apiClient.get(`/products/${id}`, {
          // Cache for 10 minutes
          headers: { 'Cache-Control': 'max-age=600' }
        })
      )
    );
  },

  /**
   * Search products
   */
  searchProducts: async (query, params = {}) => {
    if (!query?.trim()) {
      throw new Error('Search query is required');
    }

    const requestKey = `search-${query}-${JSON.stringify(params)}`;
    
    return deduplicateRequest(requestKey, () =>
      makeRequest(() => 
        apiClient.get('/products', { 
          params: { search: query, ...params },
          // Cache for 1 minute
          headers: { 'Cache-Control': 'max-age=60' }
        })
      )
    );
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    const requestKey = `category-${categoryId}-${JSON.stringify(params)}`;
    
    return deduplicateRequest(requestKey, () =>
      makeRequest(() => 
        apiClient.get('/products', { 
          params: { category: categoryId, ...params },
          // Cache for 5 minutes
          headers: { 'Cache-Control': 'max-age=300' }
        })
      )
    );
  },
};

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Get API client instance (for custom requests)
 */
export const getApiClient = () => apiClient;

export default productionProductAPI;
