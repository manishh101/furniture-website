# Mobile Diagnostics Tool

## Overview

The Mobile Diagnostics Tool provides a way to debug API connectivity issues directly on production mobile devices without needing developer tools. It's especially useful for identifying why certain components might not be displaying correctly.

## How to Access

1. Add `?debug=true` to any page URL, for example:
   ```
   https://manish-steel-furniture.vercel.app/?debug=true
   ```

2. A diagnostics panel will appear at the bottom of the screen showing real-time API status information.

## Features

1. **API Endpoint Status**
   - General Products API
   - Featured Products API
   - Best Selling Products API
   - Sorted by Sales API

2. **Network Information**
   - Connection type (4G, 3G, etc.)
   - Bandwidth estimates
   - Data saver mode detection

3. **Visual Indicators**
   - Green: Endpoint working
   - Yellow: Endpoint accessible but no products
   - Red: Endpoint error
   - Gray: Checking status

## When to Use

- When components that depend on API data are not showing on mobile devices
- When you suspect API connectivity issues in production
- To verify which API endpoints are working and which are not
- When you need to debug from a mobile device without developer tools

## Implementation

The diagnostics tools are implemented through:
1. `MobileDiagnostics.js` - The visual component
2. `diagnosticsEnabler.js` - URL parameter handling
3. `mobileDebugger.js` - Enhanced logging utilities

## Security Note

The diagnostics tool does not expose any sensitive information and only shows API connectivity status. It can be safely used in production as it's only activated when explicitly requested via the URL parameter.
