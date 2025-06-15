import axios from 'axios';
import authService from './authService';
import portDiscovery from './portDiscovery';
import { getCategories as getLocalCategories } from '../utils/categoryData';
import { defaultProducts } from '../utils/productData';

// Create an initial Axios instance with the correct baseURL
// This will be updated after port discovery but we're starting with port 5000
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Updated to match current backend port
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to track API connectivity
let isApiConnected = false;

// Discover the API port and update the baseURL
(async () => {
  try {
    // Use port 5000 directly (matching our backend server) 
    const discoveredBaseUrl = 'http://localhost:5000/api';
    console.log(`API base URL set to: ${discoveredBaseUrl}`);
    api.defaults.baseURL = discoveredBaseUrl;
    
    // Test the connection
    try {
      console.log('Testing API connection at:', discoveredBaseUrl);
      const healthResponse = await axios.get(`${discoveredBaseUrl}/health`, { timeout: 5000 });
      if (healthResponse && healthResponse.data && healthResponse.data.status === 'healthy') {
        isApiConnected = true;
        console.log('✅ API connection successful:', healthResponse.data);
      } else {
        console.warn('API health check returned unexpected data:', healthResponse.data);
        isApiConnected = false;
      }
    } catch (error) {
      console.warn('API health check failed, will use fallback data:', error.message);
      isApiConnected = false;
    }
  } catch (error) {
    console.error('Failed to set API port:', error);
    // Fall back to environment variable or default
    api.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    isApiConnected = false;
  }
})();

// Helper function to check API connectivity
const checkApiConnection = async (retries = 1) => {
  try {
    console.log(`Checking API connection (attempt ${retries})...`);
    const healthResponse = await axios.get(`${api.defaults.baseURL}/health`, { timeout: 3000 });
    if (healthResponse && healthResponse.data && healthResponse.data.status === 'healthy') {
      console.log('✅ API connection verified:', healthResponse.data);
      isApiConnected = true;
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`❌ API connection check failed (attempt ${retries}):`, error.message);
    isApiConnected = false;
    return false;
  }
};

// Add authentication token to requests
api.interceptors.request.use(
  async config => {
    const token = authService.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If we're about to make an API call but connectivity is false, try to reconnect
    if (!isApiConnected && !config.url.includes('/health')) {
      await checkApiConnection();
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Check if the request has the _preventRetry flag
    const isPreventRetry = originalRequest._preventRetry;
    
    // If unauthorized and we haven't already tried to refresh and not prevented
    if (error.response?.status === 401 && !originalRequest._retry && !isPreventRetry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult.success) {
          // Retry the original request with new token
          const token = authService.getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // Don't log out if the request was marked with _preventRetry
      if (!isPreventRetry) {
        authService.logout();
        window.location.href = '/login';
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
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.get('/products/featured', { params: { limit } });
    } catch (error) {
      console.warn('Using fallback data for featured products:', error.message);
      // Return some featured products from default data
      const featured = defaultProducts.slice(0, limit).map(p => ({ ...p, featured: true }));
      return { data: { success: true, products: featured, count: featured.length } };
    }
  },

  // Get best selling products
  getBestSelling: async (limit = 6) => {
    try {
      if (!isApiConnected) {
        throw new Error('API not connected');
      }
      return await api.get('/products/best-selling', { params: { limit } });
    } catch (error) {
      console.warn('Using fallback data for best selling products:', error.message);
      // Return some best selling products from default data
      const bestSelling = defaultProducts.slice(0, limit).map((p, index) => ({ 
        ...p, 
        salesCount: 300 - (index * 30),
        rating: 4.5 + (Math.random() * 0.5)
      }));
      return { data: { success: true, products: bestSelling, count: bestSelling.length } };
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
        console.log('API appears disconnected. Attempting to reconnect...');
        const reconnected = await checkApiConnection(2);
        if (!reconnected) {
          throw new Error('API connection failed after retry');
        }
      }
      
      const response = await api.get('/categories', { params: { detailed } });
      console.log('Categories API response:', response.data);
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

// Export the API connection checker utility
export { checkApiConnection };

export default api;
