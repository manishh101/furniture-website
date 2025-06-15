/**
 * Secure Authentication Service
 * Handles all authentication operations with enhanced security
 */

import portDiscovery from './portDiscovery';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'manish_steel_auth_token';
    this.USER_KEY = 'manish_steel_user_data';
    this.REFRESH_KEY = 'manish_steel_refresh_token';
    this.tokenCheckInterval = null;
    this.apiBaseUrl = null;
    this.isApiConnected = false;
    this.offlineModeActive = false;
    this.ADMIN_CREDENTIALS = {
      email: '9814379071',
      password: 'M@nishsteel'
    };
    
    this.initializeApiUrl();
    this.initializeTokenValidation();
  }

  /**
   * Initialize API base URL using port discovery
   */
  async initializeApiUrl() {
    try {
      this.apiBaseUrl = await portDiscovery.discoverPort();
      await this.checkApiHealth();
      
      // After checking health, determine if we're in offline mode
      if (!this.isApiConnected && this.getUser() && this.getUser().id === 'admin-local') {
        this.offlineModeActive = true;
      }
    } catch (error) {
      // Handle error silently
    }
  }

  /**
   * Check API health with timeout
   */
  async checkApiHealth(timeout = 2000) {
    try {
      // Try API health endpoints
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${this.apiBaseUrl}/health`, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        this.isApiConnected = response.ok;
        return;
      } catch (err) {
        // Try root health endpoint
        const baseUrl = this.apiBaseUrl.replace('/api', '');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${baseUrl}/health`, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        this.isApiConnected = response.ok;
        return;
      }
    } catch (error) {
      this.isApiConnected = false;
      
      // Always set offline mode active for admin
      if (this.getUser() && this.getUser().id === 'admin-local' && this.getUser().email === this.ADMIN_CREDENTIALS.email) {
        this.offlineModeActive = true;
      }
    }
  }

  /**
   * Create admin user object for offline mode
   */
  createAdminUser() {
    return {
      id: "admin-local",
      name: "Admin User",
      email: this.ADMIN_CREDENTIALS.email,
      role: "admin",
      isAdmin: true
    };
  }

  /**
   * Create a valid JWT-like token for offline mode
   */
  createOfflineToken() {
    // Return a fixed token that exactly matches what the server expects
    // This is the same token checked for in auth-secure.js middleware
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tbG9jYWwifSwiaXNzIjoibWFuaXNoLXN0ZWVsLWFwaSIsImF1ZCI6Im1hbmlzaC1zdGVlbC1mcm9udGVuZCIsImlhdCI6MTYyMDMxMjM0NSwiZXhwIjoxNjIwMzk4NzQ1fQ.mocked-signature-for-local-development-only';
  }

  /**
   * Handle admin offline login
   */
  handleOfflineAdminLogin() {
    try {
      const mockAdminUser = this.createAdminUser();
      // Force static token that will be recognized by server auth-secure middleware
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tbG9jYWwifSwiaXNzIjoibWFuaXNoLXN0ZWVsLWFwaSIsImF1ZCI6Im1hbmlzaC1zdGVlbC1mcm9udGVuZCIsImlhdCI6MTYyMDMxMjM0NSwiZXhwIjoxNjIwMzk4NzQ1fQ.mocked-signature-for-local-development-only';
      
      this.setToken(mockToken);
      this.setUser(mockAdminUser);
      this.offlineModeActive = true;
      
      return {
        success: true,
        user: mockAdminUser,
        message: "Login successful (offline mode)"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to log in offline mode"
      };
    }
  }

  /**
   * Check if credentials are admin credentials
   */
  isAdminCredentials(email, password) {
    return email === this.ADMIN_CREDENTIALS.email && password === this.ADMIN_CREDENTIALS.password;
  }

  /**
   * Check if API is connected
   */
  isApiAvailable() {
    return this.isApiConnected;
  }

  /**
   * Check if offline mode is active
   */
  isOfflineMode() {
    return this.offlineModeActive;
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // For local admin token with admin user, always return true
    if (user.id === 'admin-local' && user.email === this.ADMIN_CREDENTIALS.email) {
      return true;
    }

    // Basic token existence check
    return true;
  }

  /**
   * Make authenticated API request with timeout
   */
  async apiRequest(endpoint, options = {}, timeout = 5000) {
    // If in offline mode and this is an admin user, don't attempt API requests
    if (this.offlineModeActive && this.isAdmin()) {
      throw new Error('API request not available in offline mode');
    }
    
    const token = this.getToken();
    const apiBaseUrl = await this.getApiBaseUrl();
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      config.signal = controller.signal;
      const response = await fetch(`${apiBaseUrl}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', text.substring(0, 150) + '...');
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok && data.code === 'TOKEN_EXPIRED') {
        this.handleTokenExpiration();
      }

      return { response, data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle token expiration
   */
  handleTokenExpiration() {
    this.logout();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  /**
   * Refresh authentication token
   * Attempts to refresh the token or returns offline admin session if available
   */
  async refreshToken() {
    // Check if user is in offline admin mode
    const user = this.getUser();
    if (user && user.id === 'admin-local') {
      // Refresh local admin token
      const tokenData = {
        user: { id: 'admin-local', role: 'admin' },
        iss: 'manish-steel-api',
        aud: 'manish-steel-frontend',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
      };
      
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tbG9jYWwifSwiaXNzIjoibWFuaXNoLXN0ZWVsLWFwaSIsImF1ZCI6Im1hbmlzaC1zdGVlbC1mcm9udGVuZCIsImlhdCI6MTYyMDMxMjM0NSwiZXhwIjoxNjIwMzk4NzQ1fQ.mocked-signature-for-local-development-only';
      this.setToken(token);
      
      return {
        success: true,
        message: 'Offline admin token refreshed'
      };
    }
    
    // Try API token refresh if connected
    if (this.isApiConnected) {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No token to refresh' };
      }
      
      try {
        const apiBaseUrl = await this.getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data.token) {
          this.setToken(data.data.token);
          this.setUser(data.data.user);
          return {
            success: true,
            message: 'Token refreshed successfully'
          };
        }
        
        throw new Error(data.message || 'Failed to refresh token');
      } catch (error) {
        console.error('Token refresh failed:', error);
        return {
          success: false,
          message: 'Failed to refresh authentication token'
        };
      }
    }
    
    return {
      success: false,
      message: 'API not connected and not in offline admin mode'
    };
  }

  /**
   * Login user with email/phone and password
   */
  async login(emailOrPhone, password) {
    if (!emailOrPhone || !password) {
      throw new Error("Email/phone and password are required");
    }

    const sanitizedEmail = emailOrPhone.toString().trim();
    
    // Check for admin credentials first
    if (this.isAdminCredentials(sanitizedEmail, password)) {
      return this.handleOfflineAdminLogin();
    }
    
    // Try API login if connected
    if (this.isApiConnected) {
      try {
        const { response, data } = await this.apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: sanitizedEmail,
            password: password
          })
        });

        if (response.ok && data.success && data.data.token) {
          this.setToken(data.data.token);
          this.setUser(data.data.user);
          this.startTokenValidation();
          
          return {
            success: true,
            user: data.data.user,
            message: data.message || 'Login successful'
          };
        }
        
        throw new Error(data.message || 'Login failed');
      } catch (error) {
        // If API login fails but it's admin credentials, fall back to offline mode
        if (this.isAdminCredentials(sanitizedEmail, password)) {
          return this.handleOfflineAdminLogin();
        }
        throw error;
      }
    }
    
    // If not connected and not admin, throw error
    if (!this.isAdminCredentials(sanitizedEmail, password)) {
      throw new Error('Server is not available. Please try again later.');
    }
    
    // Fallback to offline admin login
    return this.handleOfflineAdminLogin();
  }

  // Token management methods
  getToken() {
    // Get token from local storage
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    // If not found and we're in admin mode, return offline admin token
    if (!token && this.isAdmin()) {
      // Create and store a new token for offline admin
      const offlineToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tbG9jYWwifSwiaXNzIjoibWFuaXNoLXN0ZWVsLWFwaSIsImF1ZCI6Im1hbmlzaC1zdGVlbC1mcm9udGVuZCIsImlhdCI6MTYyMDMxMjM0NSwiZXhwIjoxNjIwMzk4NzQ1fQ.mocked-signature-for-local-development-only';
      localStorage.setItem(this.TOKEN_KEY, offlineToken);
      return offlineToken;
    }
    
    return token;
  }

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  async getApiBaseUrl() {
    if (!this.apiBaseUrl) {
      await this.initializeApiUrl();
    }
    return this.apiBaseUrl;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.stopTokenValidation();
    this.offlineModeActive = false;
  }

  // Token validation methods
  initializeTokenValidation() {
    const token = this.getToken();
    if (token) {
      this.startTokenValidation();
    }
    
    // Check if we're in offline mode with an admin user
    if (this.getUser() && this.getUser().id === 'admin-local') {
      this.offlineModeActive = true;
    }
  }

  /**
   * Check if the current user is an admin
   */
  isAdmin() {
    const user = this.getUser();
    return user && (user.role === 'admin' || user.isAdmin === true);
  }

  /**
   * Check if the user is authenticated as an admin
   */
  isAuthenticatedAdmin() {
    return this.isAuthenticated() && this.isAdmin();
  }

  startTokenValidation() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    this.tokenCheckInterval = setInterval(() => this.validateToken(), 60000); // Check every minute
  }

  stopTokenValidation() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  async validateToken() {
    const token = this.getToken();
    if (!token) {
      this.stopTokenValidation();
      return;
    }

    // Skip validation when in offline mode
    if (this.offlineModeActive) {
      return;
    }

    try {
      await this.apiRequest('/api/auth/validate');
    } catch (error) {
      console.error('Token validation failed:', error);
      if (error.message.includes('expired')) {
        this.handleTokenExpiration();
      }
    }
  }
}

export default new AuthService();
