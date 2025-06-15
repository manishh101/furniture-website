/**
 * Port Discovery Service
 * 
 * This service attempts to discover which port the backend is running on by
 * trying common ports until it finds the correct one.
 */

import axios from 'axios';

// Common ports to try - start with the most likely port first
const COMMON_PORTS = [5000, 3001, 3000];

// List of possible backend hosts (development environments)
const POSSIBLE_HOSTS = ['localhost'];

// Cache key for discovered API URL
const API_CACHE_KEY = 'manish_steel_api_url';
// Cache expiry time (10 minutes)
const CACHE_EXPIRY = 10 * 60 * 1000;

/**
 * Discover the backend port by trying common ports
 * @returns {Promise<string>} API base URL
 */
const discoverPort = async () => {
  // If we're in production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_BASE_URL || 'https://manish-steel-api.vercel.app/api';
  }
  
  // Check for cached URL and its validity
  const cachedData = localStorage.getItem(API_CACHE_KEY);
  if (cachedData) {
    try {
      const { url, timestamp } = JSON.parse(cachedData);
      // Check if the cached URL is still valid (within expiry time)
      if (timestamp && (Date.now() - timestamp < CACHE_EXPIRY)) {
        console.log(`Using cached API URL: ${url}`);
        
        // Validate that the cached URL is still reachable
        try {
          await axios.get(`${url}/health`, { timeout: 1000 });
          return url;
        } catch (err) {
          console.log('Cached API URL is no longer reachable, will attempt rediscovery');
        }
      }
    } catch (e) {
      console.log('Invalid cached API URL, will rediscover');
    }
  }
  
  // Fast local check for default port
  try {
    const defaultUrl = 'http://localhost:3001/api';
    try {
      await axios.get(`${defaultUrl}/health`, { timeout: 1000 });
      console.log(`✅ Backend discovered at default location: ${defaultUrl}`);
      cacheApiUrl(defaultUrl);
      return defaultUrl;
    } catch (err) {
      // Try regular /health endpoint
      await axios.get(`http://localhost:3001/health`, { timeout: 1000 });
      console.log(`✅ Backend discovered at default location: ${defaultUrl}`);
      cacheApiUrl(defaultUrl);
      return defaultUrl;
    }
  } catch (err) {
    // Continue with port discovery if default port is not working
    console.log('Default port check failed, trying alternative ports');
  }
  
  // If the fast check fails, try a limited set of common ports
  for (const host of POSSIBLE_HOSTS) {
    for (const port of COMMON_PORTS) {
      const apiBaseUrl = `http://${host}:${port}/api`;
      
      try {
        console.log(`Attempting to connect to backend at: ${apiBaseUrl}/health`);
        try {
          await axios.get(`${apiBaseUrl}/health`, { timeout: 1000 });
        } catch (innerErr) {
          // If /api/health fails, try just /health
          await axios.get(`http://${host}:${port}/health`, { timeout: 1000 });
        }
        
        console.log(`✅ Backend discovered at ${apiBaseUrl}`);
        cacheApiUrl(apiBaseUrl);
        return apiBaseUrl;
      } catch (error) {
        // Silently continue to next port
      }
    }
  }
  
  // Fall back to the default URL if discovery fails
  console.log('Falling back to default API URL: http://localhost:3001/api');
  return 'http://localhost:3001/api';
};

/**
 * Cache the discovered API URL with a timestamp
 * @param {string} url - The API base URL to cache
 */
const cacheApiUrl = (url) => {
  localStorage.setItem(API_CACHE_KEY, JSON.stringify({
    url,
    timestamp: Date.now()
  }));
};

export default { discoverPort };
