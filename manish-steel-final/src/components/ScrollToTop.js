import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop, ScrollHandlers } from '../utils/scrollUtils';

/**
 * Enhanced ScrollToTop component using our professional scroll utilities
 * Automatically scrolls to the top whenever the route changes with device-optimized behavior
 * 
 * Features:
 * - Uses enhanced scroll utilities for consistent behavior
 * - Device-aware scroll optimization
 * - Accessibility support
 * - Proper handling of all page navigation
 * - No exceptions - all pages scroll to top on navigation
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const isInitialMount = useRef(true);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Force scroll to top for any pathname change
    if (lastPathname.current !== pathname) {
      console.log(`ScrollToTop: Navigating from ${lastPathname.current} to ${pathname}`);
      
      // Force immediate scroll to top before any animations
      window.scrollTo(0, 0);
      
      // Use the enhanced scroll handler as backup
      ScrollHandlers.onNavigation();
      
      // Update last pathname
      lastPathname.current = pathname;
      
      // Focus on main content for accessibility after scroll
      setTimeout(() => {
        const mainContent = document.getElementById('main-content') || 
                           document.querySelector('main') || 
                           document.querySelector('[role="main"]');
        if (mainContent) {
          mainContent.focus({ preventScroll: true });
        }
      }, 100);
    }
    
  }, [pathname, search]); // Listen to both pathname and search changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;
