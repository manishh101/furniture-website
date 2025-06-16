/**
 * API URL Discovery Service
 * 
 * This service determines the API base URL based on the environment.
 * In production, it uses the environment variable.
 * In development, it tries to discover the backend port.
 */

import axios from 'axios';
import { sanitizeApiUrl } from '../utils/apiUrlHelper';

// Common ports to try - start with the most likely port first
const COMMON_PORTS = [5000, 3001, 3000];

// List of possible backend hosts (development environments)
const POSSIBLE_HOSTS = ['localhost'];

// Cache key for discovered API URL
const API_CACHE_KEY = 'manish_steel_api_url';
// Cache expiry time (10 minutes)
const CACHE_EXPIRY = 10 * 60 * 1000;

/**
 * Get the API base URL based on environment
 * @returns {Promise<string>} API base URL
 */
const discoverPort = async () => {
  // If we're in production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    // Added explicit log for debugging
    const apiUrl = process.env.REACT_APP_API_URL || 'https://manish-steel-api.onrender.com/api';
    const sanitizedUrl = sanitizeApiUrl(apiUrl);
    console.log('Production environment detected, using API URL:', sanitizedUrl);
    return sanitizedUrl;
  }
  
  // Check if we have a cached API URL
  const cachedData = getCachedApiUrl();
  if (cachedData) {
    return cachedData.url;
  }
  
  // Fast local check for default port
  try {
    const defaultUrl = 'http://localhost:5000/api';
    try {
      // Ensure URL is properly formatted
      const healthCheckUrl = sanitizeApiUrl(`${defaultUrl.replace('/api', '')}/health`);
      console.log('Checking default health endpoint:', healthCheckUrl);
      await axios.get(healthCheckUrl, { timeout: 1000 });
      cacheApiUrl(defaultUrl);
      return defaultUrl;
    } catch (err) {
      // Try regular /health endpoint
      const backupHealthUrl = sanitizeApiUrl('http://localhost:5000/health');
      console.log('Checking backup health endpoint:', backupHealthUrl);
      await axios.get(backupHealthUrl, { timeout: 1000 });
      cacheApiUrl(defaultUrl);
      return defaultUrl;
    }
  } catch (err) {
    console.log('Default health checks failed, continuing with port discovery');
    // Continue with port discovery if default port is not working
  }
  
  // If the fast check fails, try a limited set of common ports
  for (const host of POSSIBLE_HOSTS) {
    for (const port of COMMON_PORTS) {
      const apiBaseUrl = `http://${host}:${port}/api`;
      
      try {
        try {
          await axios.get(sanitizeApiUrl(`${apiBaseUrl}/health`), { timeout: 1000 });
        } catch (innerErr) {
          // If /api/health fails, try just /health
          await axios.get(sanitizeApiUrl(`http://${host}:${port}/health`), { timeout: 1000 });
        }
        
        cacheApiUrl(apiBaseUrl);
        return apiBaseUrl;
      } catch (error) {
        // Silently continue to next port
      }
    }
  }
  
  // Fall back to the default URL if discovery fails
  return 'http://localhost:5000/api';
};

/**
 * Get cached API URL if it exists and is not expired
 * @returns {Object|null} Cached data or null if not found/expired
 */
const getCachedApiUrl = () => {
  try {
    const cachedData = JSON.parse(localStorage.getItem(API_CACHE_KEY));
    
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_EXPIRY) {
      return cachedData;
    }
  } catch (err) {
    // Invalid cache data
  }
  
  return null;
};

/**
 * Cache the discovered API URL
 * @param {string} url API base URL
 */
const cacheApiUrl = (url) => {
  try {
    localStorage.setItem(API_CACHE_KEY, JSON.stringify({
      url,
      timestamp: Date.now()
    }));
  } catch (err) {
    // Error caching - not critical
  }
};

export default { discoverPort };
