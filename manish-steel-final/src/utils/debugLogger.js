/**
 * Simple Debug Utility
 * Replaces the complex mobileDebugger with simple console logging
 */

const debugLogger = {
  log: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.log(`[DEBUG] ${message}`, data);
      } else {
        console.log(`[DEBUG] ${message}`);
      }
    }
  },
  
  error: (message, error = null) => {
    if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  
  warn: (message, data = null) => {
    if (data) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }
};

export default debugLogger;
