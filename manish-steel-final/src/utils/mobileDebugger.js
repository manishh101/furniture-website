/**
 * Mobile Debugging Utility
 * 
 * This utility provides better debugging tools for mobile devices where
 * accessing the console can be challenging.
 */

// Detect if the device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Log with device context information
const mobileLog = (message, data = null) => {
  const isMobile = isMobileDevice();
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  const context = {
    deviceType,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  if (isMobile) {
    console.log(`📱 [${deviceType}] ${message}`, data, context);
  } else {
    console.log(`🖥️ [${deviceType}] ${message}`, data);
  }
};

// Log errors specifically for mobile debugging
const mobileError = (message, error = null) => {
  const isMobile = isMobileDevice();
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  
  console.error(`❌ [${deviceType}] ${message}`, error);
  
  // On production and on mobile, we might want to send these errors to a logging service
  if (process.env.NODE_ENV === 'production' && isMobile) {
    // Here you could integrate with a logging service
    // logErrorToService(message, error);
  }
};

// Check mobile network status
const checkMobileNetwork = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType, // 4g, 3g, 2g, slow-2g
      rtt: connection.rtt, // Round-trip time
      downlink: connection.downlink, // Bandwidth estimate
      saveData: connection.saveData, // Data saver enabled
    };
  }
  
  return { effectiveType: 'unknown' };
};

export default {
  isMobileDevice,
  mobileLog,
  mobileError,
  checkMobileNetwork,
};
