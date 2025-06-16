import axios from 'axios';
import authService from './authService';
import portDiscovery from './portDiscovery';
import { getCategories as getLocalCategories } from '../utils/categoryData';
import { defaultProducts } from '../utils/productData';
import { sanitizeApiUrl } from '../utils/apiUrlHelper';

// Create an initial Axios instance with the correct baseURL based on environment
const getInitialBaseUrl = () => {
  let baseUrl;
  
  // In production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    baseUrl = process.env.REACT_APP_API_URL || 'https://manish-steel-api.onrender.com/api';
  } else {
    // In development, start with localhost
    baseUrl = 'http://localhost:5000/api';
  }
  
  // Use the sanitizeApiUrl utility to ensure proper formatting
  baseUrl = sanitizeApiUrl(baseUrl);
  
  console.log('API Client using base URL:', baseUrl);
  return baseUrl;
};

const api = axios.create({
  baseURL: getInitialBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to track API connectivity
let isApiConnected = false;

// Discover the API port and update the baseURL
(async () => {
  try {
    const discoveredBaseUrl = await portDiscovery.discoverPort();
    api.defaults.baseURL = discoveredBaseUrl;
    
    // Test the connection
    try {
      const healthResponse = await axios.get(`${discoveredBaseUrl}/health`, { timeout: 5000 });
      if (healthResponse.status === 200) {
        isApiConnected = true;
      }
    } catch (healthError) {
      // Health check failed, API may be unreachable
      isApiConnected = false;
    }
  } catch (error) {
    // Use default baseURL if port discovery fails
    isApiConnected = false;
  }
})();

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshed = await authService.refreshToken();
        
        if (refreshed) {
          // Update the token in the request and retry
          originalRequest.headers['Authorization'] = `Bearer ${authService.getToken()}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh failed, logout the user
        authService.logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API Services
export const authAPI = {
  login: (email, password) => {
    // If the email is a phone number (10 digits), use the admin login endpoint
    if (/^\d{10}$/.test(email)) {
      return api.post('/auth/admin', { phone: email, password });
    } else {
      return api.post('/auth', { email, password });
    }
  },
  getCurrentUser: () => api.get('/auth'),
  register: (userData) => api.post('/users', userData)
};

// Product API Services with fallback
export const productAPI = {
  getAll: async (page = 1, limit = 100, params = {}) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.get('/products', { params: { page, limit, ...params } });
    } catch (error) {
      console.warn('Using fallback product data:', error.message);
      // Return a mock response with the default products
      return {
        data: {
          products: defaultProducts,
          currentPage: 1,
          totalPages: 1,
          totalProducts: defaultProducts.length
        }
      };
    }
  },
  
  getById: async (id) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.get(`/products/${id}`);
    } catch (error) {
      console.warn('Using fallback product data for ID:', id, error.message);
      const product = defaultProducts.find(p => p.id === id || p._id === id);
      if (product) {
        return { data: product };
      }
      throw new Error('Product not found in fallback data');
    }
  },
  
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  
  // Enhanced filter endpoint for better category filtering
  getByCategory: async (categoryId, extraParams = {}) => {
    console.log('API: Getting products by category via enhanced filter:', { categoryId, extraParams });
    
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      // Use the regular products endpoint with a category parameter
      return await api.get('/products', { 
        params: { 
          category: categoryId,
          subcategory: extraParams.subcategory,
          limit: 100
        } 
      });
    } catch (error) {
      console.warn('Using fallback product data for category:', categoryId, error.message);
      // Filter the default products by category and subcategory
      let filtered = defaultProducts;
      
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter(p => p.categoryId === categoryId || p.category === categoryId);
      }
      
      if (extraParams.subcategory) {
        filtered = filtered.filter(p => p.subcategoryId === extraParams.subcategory || p.subcategory === extraParams.subcategory);
      }
      
      return { data: filtered };
    }
  },
  
  // Alternative category filter endpoint for specialized filtering
  getByCategoryAlternative: async (categoryId, extraParams = {}) => {
    console.log('API: Getting products by alternative filter:', { categoryId, extraParams });
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      
      // ENHANCED: Ensure we're sending the correct parameters to the filter endpoint
      const response = await api.get('/products/filter', { 
        params: { 
          category: categoryId,
          subcategory: extraParams.subcategory,
          limit: 100,
          ...extraParams 
        } 
      });
      
      // Detailed logging to diagnose filtering issues
      if (extraParams.debug) {
        console.log('API detailed response for product filter:', {
          category: categoryId,
          productCount: response.data?.products?.length || (Array.isArray(response.data) ? response.data.length : 0),
          firstProduct: response.data?.products?.[0] || (Array.isArray(response.data) && response.data[0] ? {
            name: response.data[0].name,
            category: response.data[0].category || response.data[0].categoryId
          } : 'none')
        });
      } else {
        console.log('API response for product filter:', response.data);
      }
      
      return response;
    } catch (error) {
      console.warn('Using fallback product data for category:', categoryId, error.message);
      // Filter the default products by category and subcategory
      let filtered = defaultProducts;
      
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter(p => p.categoryId === categoryId || p.category === categoryId);
      }
      
      if (extraParams.subcategory) {
        filtered = filtered.filter(p => p.subcategoryId === extraParams.subcategory || p.subcategory === extraParams.subcategory);
      }
      
      return { data: filtered };
    }
  },
  
  search: async (query) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.get('/products', { params: { search: query, limit: 100 } });
    } catch (error) {
      console.warn('Using fallback product data for search:', query, error.message);
      // Search in the default products
      const filtered = defaultProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      );
      return { data: filtered };
    }
  },

  // Get featured products
  getFeatured: async (limit = 6) => {
    try {
      return await api.get('/products/featured', { params: { limit } });
    } catch (error) {
      console.warn('Error fetching featured products:', error.message);
      throw error; // Let the component handle the error
    }
  },

  // Get best selling products
  getBestSelling: async (limit = 6) => {
    try {
      return await api.get('/products/best-selling', { params: { limit } });
    } catch (error) {
      console.warn('Error fetching best selling products:', error.message);
      throw error; // Let the component handle the error
    }
  },

  // Update featured status
  updateFeaturedStatus: async (id, featured) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.patch(`/products/${id}/featured`, { featured });
    } catch (error) {
      console.warn('Featured status update fallback:', error.message);
      // Simulate successful response for demo
      return { data: { success: true, msg: 'Featured status updated (demo mode)' } };
    }
  },

  // Update sales count
  updateSalesCount: async (id, count) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.patch(`/products/${id}/sales`, { count });
    } catch (error) {
      console.warn('Sales count update fallback:', error.message);
      // Simulate successful response for demo
      return { data: { success: true, msg: 'Sales count updated (demo mode)' } };
    }
  }
};

// Category API Services with fallback
export const categoryAPI = {
  getAll: async (detailed = false) => {
    try {
      // If API is not connected, try to reconnect once
      if (!isApiConnected) {
        const reconnected = await checkApiConnection(2);
        if (!reconnected) {
          throw new Error('API connection failed after retry');
        }
      }
      
      const response = await api.get('/categories', { params: { detailed } });
      return response;
    } catch (error) {
      console.warn('Using fallback category data:', error.message);
      const localCategories = getLocalCategories();
      return { data: localCategories };
    }
  },
  
  getById: async (id, withSubcategories = false) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.get(`/categories/${id}`, {
        params: { subcategories: withSubcategories }
      });
    } catch (error) {
      console.warn('Using fallback category data for ID:', id, error.message);
      const localCategories = getLocalCategories();
      const category = localCategories.find(c => c.id === id || c._id === id);
      if (category) {
        return { data: category };
      }
      throw new Error('Category not found in fallback data');
    }
  },
  
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Subcategory API Services
export const subcategoryAPI = {
  getAll: () => api.get('/subcategories'),
  getByCategoryId: (categoryId) => api.get('/subcategories', {
    params: { categoryId }
  }),
  getById: (id) => api.get(`/subcategories/${id}`),
  create: (subcategoryData) => api.post('/subcategories', subcategoryData),
  update: (id, subcategoryData) => api.put(`/subcategories/${id}`, subcategoryData),
  delete: (id) => api.delete(`/subcategories/${id}`)
};

// Upload API Service
export const uploadAPI = {
  uploadImages: (formData) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Inquiry API Service
export const inquiryAPI = {
  // Get all inquiries with pagination and filtering
  getAll: async (page = 1, limit = 10, status = null, search = null) => {
    try {
      // Get token or refresh if needed
      let token = authService.getToken();
      
      if (!token) {
        await authService.refreshToken();
        token = authService.getToken();
      }

      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit
      });
      
      if (status) {
        params.append('status', status);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      // Make request with proper authorization header
      const response = await api.get(`/inquiries?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        _preventRetry: true
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      // Return empty data instead of throwing
      return {
        data: {
          inquiries: [],
          totalPages: 0,
          currentPage: page,
          totalInquiries: 0
        }
      };
    }
  },
  
  // Get a single inquiry by ID
  getById: async (id) => {
    try {
      return await api.get(`/inquiries/${id}`, {
        _preventRetry: true
      });
    } catch (error) {
      console.error('Error fetching inquiry details:', error);
      throw error;
    }
  },
  
  // Create a new inquiry (from contact form)
  create: async (inquiryData) => {
    try {
      // Basic validation for required fields
      const requiredFields = ['name', 'email', 'phone', 'message'];
      const validCategories = ['product', 'service', 'support', 'business', 'general'];
      const errors = [];
      
      // Check required fields
      for (const field of requiredFields) {
        if (!inquiryData[field] || inquiryData[field].trim() === '') {
          errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }
      
      // Set default category if missing
      if (!inquiryData.category || inquiryData.category.trim() === '') {
        inquiryData.category = 'general';
      } else if (!validCategories.includes(inquiryData.category)) {
        inquiryData.category = 'general';
        errors.push('Invalid category');
      }
      
      // Handle validation errors
      if (errors.length > 0) {
        throw new Error(`Please correct the following: ${errors.join(', ')}`);
      }
      
      // Clean input data
      const validatedData = {
        name: inquiryData.name.trim(),
        email: inquiryData.email.trim(),
        phone: inquiryData.phone.trim(),
        message: inquiryData.message.trim(),
        category: inquiryData.category,
      };
      
      // Send inquiry via the API
      const response = await api.post('/inquiries', validatedData);
      return response;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw error;
    }
  },
  
  // Update inquiry status
  updateStatus: async (id, status) => {
    try {
      return await api.put(`/inquiries/${id}`, { status }, {
        _preventRetry: true
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  },
  
  // Delete an inquiry
  delete: async (id) => {
    try {
      return await api.delete(`/inquiries/${id}`, {
        _preventRetry: true
      });
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      throw error;
    }
  }
};

// About Page API Service
export const aboutAPI = {
  // Get about page content
  getContent: async () => {
    try {
      const response = await api.get('/about');
      return response;
    } catch (error) {
      console.error('Error fetching about page content:', error);
      // Return default about page content in case of error
      return {
        data: {
          success: true,
          data: null
        }
      };
    }
  },
  
  // Update entire about page content
  updateContent: async (aboutData) => {
    try {
      // Try to get the authentication token
      let headers = {};
      try {
        const token = await authService.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Auth token not available, proceeding without authentication');
      }
      
      const response = await api.put('/about', aboutData, { headers });
      return response;
    } catch (error) {
      console.error('Error updating about page content:', error);
      
      // Provide a structured error response
      if (error.response) {
        // Server responded with an error status
        return error.response;
      } else {
        // Return a formatted error for consistency
        return {
          data: {
            success: false,
            message: error.message || 'Network error occurred',
            error: error
          }
        };
      }
    }
  },
  
  // Update a specific section of the about page
  updateSection: async (section, sectionData) => {
    try {
      // Try to get the authentication token
      let headers = {};
      try {
        const token = await authService.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Auth token not available, proceeding without authentication');
      }
      
      const data = {};
      data[section] = sectionData;
      
      const response = await api.put(`/about/section/${section}`, data, { headers });
      return response;
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      throw error;
    }
  },
  
  // Update workshop images
  updateWorkshopImages: async (images) => {
    try {
      // Try to get the authentication token
      let headers = {};
      try {
        const token = await authService.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Auth token not available, proceeding without authentication');
      }
      
      const response = await api.put('/about/workshop-images', { images }, { headers });
      return response;
    } catch (error) {
      console.error('Error updating workshop images:', error);
      throw error;
    }
  },
  
  // Add or update a core value
  updateCoreValue: async (valueId, value) => {
    try {
      // Try to get the authentication token
      let headers = {};
      try {
        const token = await authService.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Auth token not available, proceeding without authentication');
      }
      
      const response = await api.put(`/about/core-value/${valueId}`, { value }, { headers });
      return response;
    } catch (error) {
      console.error('Error updating core value:', error);
      throw error;
    }
  },
  
  // Delete a core value
  deleteCoreValue: async (valueId) => {
    try {
      // Try to get the authentication token
      let headers = {};
      try {
        const token = await authService.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Auth token not available, proceeding without authentication');
      }
      
      const response = await api.delete(`/about/core-value/${valueId}`, { headers });
      return response;
    } catch (error) {
      console.error('Error deleting core value:', error);
      throw error;
    }
  }
};

/**
 * Check API connection and try to reconnect if needed
 * @param {number} retryCount - Number of connection attempts to make
 * @returns {Promise<boolean>} - Whether connection was successful
 */
const checkApiConnection = async (retryCount = 1) => {
  for (let i = 0; i < retryCount; i++) {
    try {
      const baseUrl = await portDiscovery.discoverPort();
      const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 3000 });
      
      if (healthResponse.status === 200) {
        isApiConnected = true;
        return true;
      }
    } catch (error) {
      console.warn(`API connection attempt ${i + 1} failed`);
    }
    
    // Wait a bit before retrying
    if (i < retryCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
};

// Export the API axios instance as default for backward compatibility
export default api;
