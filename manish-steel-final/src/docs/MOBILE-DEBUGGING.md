# Mobile Debugging Utility

## Overview

The Mobile Debugging Utility provides enhanced logging and diagnostic tools specifically for debugging issues that occur on mobile devices in production environments. It's designed to provide context-aware logging that includes device information, network status, and more detailed error reporting.

## Features

1. **Device Detection**
   - Automatically detects if the user is on a mobile device
   - Adds device type to all logs

2. **Enhanced Logging**
   - Adds device context information to logs
   - Provides visual indicators for mobile vs desktop logs
   - Includes viewport dimensions and user agent information

3. **Network Information**
   - Reports network connection type (4G, 3G, etc.)
   - Provides bandwidth and latency estimates when available
   - Detects if data saving mode is enabled

4. **Error Handling**
   - Special error logging for mobile environments
   - Capability to send errors to external logging services

## Usage

```javascript
import mobileDebugger from '../utils/mobileDebugger';

// Basic logging with context
mobileDebugger.mobileLog('Component mounted', { additionalData: 'value' });

// Error logging
mobileDebugger.mobileError('API request failed', error);

// Check if user is on mobile
if (mobileDebugger.isMobileDevice()) {
  // Mobile-specific code
}

// Get network information
const networkInfo = mobileDebugger.checkMobileNetwork();
console.log(`User is on ${networkInfo.effectiveType} connection`);
```

## Integration with Components

The utility is integrated with key components like TopProductsSection and MostSellingProductsSection to provide visibility into their behavior on mobile devices.

## Viewing Logs in Production

For production issues:
1. Use browser remote debugging (Chrome DevTools for Android, Safari Web Inspector for iOS)
2. Consider implementing remote logging services like LogRocket, Sentry, or a custom solution

## Future Improvements

- Add automatic error reporting to a backend service
- Implement visual error indicators for users
- Add performance monitoring specific to mobile rendering
