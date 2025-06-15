import { authAPI } from '../services/api';

const TOKEN_KEY = 'manish_steel_auth_token';
const USER_KEY = 'manish_steel_user';

/**
 * Authenticate user with server and store token
 */
export const authenticate = async (email, password) => {
  try {
    // Special handling for admin login with hardcoded credentials
    if (email === '9814379071' && password === 'M@nishsteel') {
      console.log('Admin login with hardcoded credentials detected');
      
      // Special case for admin login - forced auth
      try {
        const response = await authAPI.login(email, password);
        const { token, user } = response.data;
        
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
          
          // Store user info or create default admin user
          const adminUser = user || { 
            id: 'admin-user',
            name: 'Manish Steel Admin', 
            email: '9814379071',
            role: 'admin'
          };
          
          localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
          localStorage.setItem('isAdminLoggedIn', 'true');
          localStorage.setItem('isAuthenticated', 'true');
          
          return { success: true };
        }
      } catch (adminError) {
        console.warn('Admin API login failed, using fallback method');
        
        // Fallback to direct admin login if API fails
        const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tdXNlciIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE3NDk5NzU2OTQsImV4cCI6MTc1MDM3NTY5NH0.psVI6gTPsN92Rg1QN3UH_awhfbxS7yH7uPUyo-PtHQY';
        const adminUser = { 
          id: 'admin-user',
          name: 'Manish Steel Admin', 
          email: '9814379071',
          role: 'admin'
        };
        
        localStorage.setItem(TOKEN_KEY, adminToken);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('isAuthenticated', 'true');
        
        return { success: true };
      }
    }
    
    // Regular login flow
    const response = await authAPI.login(email, password);
    const { token, user } = response.data;

    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { success: true };
    }
    
    return { 
      success: false, 
      message: 'Authentication failed. Invalid response from server.' 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: error.response?.data?.errors?.[0]?.msg || 'Authentication failed' 
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  return !!(token && user);
};

/**
 * Get current auth token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Log out user by removing token and user data
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Update stored user information
 */
export const updateUserInfo = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error updating user info:', error);
    return null;
  }
};
