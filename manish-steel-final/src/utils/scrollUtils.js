/**
 * Professional Scroll Utility System
 * Provides robust, device-aware scroll behaviors with accessibility features
 * Optimized for React applications with modern browser compatibility
 */

// Configuration constants
const SCROLL_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  DESKTOP_SCROLL_DURATION: 800,
  THROTTLE_DELAY: 16,
  DEBOUNCE_DELAY: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 50,
  DEFAULT_OFFSETS: {
    mobile: 0,
    desktop: 0
  },
  EASING: {
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }
};

// Device detection utilities
export const DeviceUtils = {
  isMobile: () => window.innerWidth < SCROLL_CONFIG.MOBILE_BREAKPOINT,
  isTablet: () => window.innerWidth >= SCROLL_CONFIG.MOBILE_BREAKPOINT && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024,
  hasReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  supportsScrollBehavior: () => 'scrollBehavior' in document.documentElement.style,
  isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

// Performance utilities
export const PerformanceUtils = {
  throttle: (func, delay = SCROLL_CONFIG.THROTTLE_DELAY) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  },

  debounce: (func, delay = SCROLL_CONFIG.DEBOUNCE_DELAY) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  requestAnimationFrame: (callback) => {
    return window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || 
           ((cb) => setTimeout(cb, 16));
  }
};

// Header detection utility
export const getHeaderOffset = () => {
  const header = document.querySelector('header, .header, .navbar, .nav-header');
  if (header) {
    const headerHeight = header.offsetHeight;
    const headerStyle = window.getComputedStyle(header);
    const isFixed = headerStyle.position === 'fixed' || headerStyle.position === 'sticky';
    return isFixed ? headerHeight : 0;
  }
  return 0;
};

// Core scroll utilities
export const ScrollCore = {
  /**
   * Get optimal scroll position with header offset consideration
   */
  getOptimalScrollPosition: (targetPosition = 0, customOffset = null) => {
    const headerOffset = getHeaderOffset();
    const deviceOffset = customOffset !== null ? customOffset : 
      (DeviceUtils.isMobile() ? SCROLL_CONFIG.DEFAULT_OFFSETS.mobile : SCROLL_CONFIG.DEFAULT_OFFSETS.desktop);
    
    return Math.max(0, targetPosition - headerOffset - deviceOffset);
  },

  /**
   * Perform immediate scroll with fallback attempts
   */
  performInstantScroll: (position, attempts = SCROLL_CONFIG.RETRY_ATTEMPTS) => {
    const scroll = () => {
      try {
        window.scrollTo(0, position);
        document.documentElement.scrollTop = position;
        document.body.scrollTop = position;
      } catch (error) {
        console.warn('Scroll attempt failed:', error);
      }
    };

    scroll();
    
    // Retry mechanism for reliability
    for (let i = 1; i <= attempts; i++) {
      setTimeout(scroll, i * SCROLL_CONFIG.RETRY_DELAY);
    }
  },

  /**
   * Perform smooth scroll with custom easing
   */
  performSmoothScroll: (targetPosition, duration = SCROLL_CONFIG.DESKTOP_SCROLL_DURATION) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = SCROLL_CONFIG.EASING.easeInOutCubic(progress);
      
      const currentPosition = startPosition + (distance * easedProgress);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }
};

// Main scroll functions
/**
 * Professional scroll to top with device optimization and accessibility
 * @param {Object} options - Configuration options
 * @param {number} options.offset - Custom offset from top
 * @param {boolean} options.smooth - Force smooth scroll (overrides device detection)
 * @param {boolean} options.instant - Force instant scroll (overrides device detection)
 * @param {number} options.duration - Custom scroll duration for smooth scroll
 */
export const scrollToTop = (options = {}) => {
  const {
    offset = null,
    smooth = null,
    instant = null,
    duration = SCROLL_CONFIG.DESKTOP_SCROLL_DURATION
  } = options;

  const optimalPosition = ScrollCore.getOptimalScrollPosition(0, offset);
  const shouldUseSmooth = smooth !== null ? smooth : 
    (instant !== null ? !instant : 
      (!DeviceUtils.isMobile() && DeviceUtils.supportsScrollBehavior() && !DeviceUtils.hasReducedMotion()));

  if (shouldUseSmooth) {
    ScrollCore.performSmoothScroll(optimalPosition, duration);
  } else {
    ScrollCore.performInstantScroll(optimalPosition);
  }
};

/**
 * Enhanced force scroll to top for critical scenarios
 * Uses multiple strategies to ensure scroll succeeds
 */
export const forceScrollToTop = (options = {}) => {
  const { offset = 0 } = options;
  const position = ScrollCore.getOptimalScrollPosition(0, offset);
  
  // Multiple immediate attempts with different methods
  ScrollCore.performInstantScroll(position, 5);
  
  // Additional attempts with delays
  const additionalAttempts = [100, 200, 500];
  additionalAttempts.forEach(delay => {
    setTimeout(() => ScrollCore.performInstantScroll(position), delay);
  });
  
  // Final attempt using native browser scroll behavior
  setTimeout(() => {
    try {
      window.scrollTo({ top: position, behavior: 'auto' });
    } catch (error) {
      window.scrollTo(0, position);
    }
  }, 600);
};

/**
 * Scroll to specific element with intelligent offset calculation
 * @param {string|Element} target - Element ID or element reference
 * @param {Object} options - Configuration options
 */
export const scrollToElement = (target, options = {}) => {
  const {
    offset = null,
    smooth = null,
    duration = SCROLL_CONFIG.DESKTOP_SCROLL_DURATION,
    block = 'start'
  } = options;

  let element;
  if (typeof target === 'string') {
    element = document.getElementById(target) || document.querySelector(target);
  } else {
    element = target;
  }

  if (!element) {
    console.warn(`Element not found: ${target}`);
    return;
  }

  const elementRect = element.getBoundingClientRect();
  const elementPosition = elementRect.top + window.pageYOffset;
  const optimalPosition = ScrollCore.getOptimalScrollPosition(elementPosition, offset);

  const shouldUseSmooth = smooth !== null ? smooth : 
    (!DeviceUtils.isMobile() && DeviceUtils.supportsScrollBehavior() && !DeviceUtils.hasReducedMotion());

  if (shouldUseSmooth) {
    ScrollCore.performSmoothScroll(optimalPosition, duration);
  } else {
    ScrollCore.performInstantScroll(optimalPosition);
  }
};

/**
 * Handle section navigation with proper offset calculation
 * @param {Event} e - Click event
 * @param {string} sectionId - Target section ID
 * @param {Object} options - Configuration options
 */
export const handleSectionClick = (e, sectionId, options = {}) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  const defaultOffset = DeviceUtils.isMobile() ? 60 : 80;
  const finalOptions = {
    offset: defaultOffset,
    ...options
  };

  scrollToElement(sectionId, finalOptions);
};

/**
 * Legacy compatibility function - maintained for backward compatibility
 * @deprecated Use scrollToTop with options instead
 */
export const scrollToTopWithOffset = (mobileOffset = 0, desktopOffset = 0) => {
  const offset = DeviceUtils.isMobile() ? mobileOffset : desktopOffset;
  scrollToTop({ offset, instant: DeviceUtils.isMobile() });
};

// Scroll restoration utilities
export const ScrollRestore = {
  save: (key = 'scrollPosition') => {
    sessionStorage.setItem(key, window.pageYOffset.toString());
  },

  restore: (key = 'scrollPosition', options = {}) => {
    const savedPosition = sessionStorage.getItem(key);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!isNaN(position)) {
        setTimeout(() => {
          scrollToElement(null, { 
            ...options, 
            target: position,
            instant: true 
          });
        }, 100);
      }
    }
  },

  clear: (key = 'scrollPosition') => {
    sessionStorage.removeItem(key);
  }
};

// Scroll event handlers
export const ScrollHandlers = {
  onPageLoad: PerformanceUtils.throttle(() => {
    // Ensure page starts at top on load
    if (window.pageYOffset > 0) {
      scrollToTop({ instant: true });
    }
  }),

  onNavigation: () => {
    // Handle navigation scroll - immediate and reliable
    // Use force scroll for navigation to ensure it always works
    console.log('ScrollHandlers.onNavigation: Forcing scroll to top');
    
    // Use multiple strategies to ensure scroll happens
    const performNavigationScroll = () => {
      // Strategy 1: Use our enhanced scroll with instant mode
      scrollToTop({ instant: true });
      
      // Strategy 2: Force scroll as backup
      setTimeout(() => {
        forceScrollToTop({ offset: 0 });
      }, 50);
      
      // Strategy 3: Additional fallback
      setTimeout(() => {
        if (window.pageYOffset > 0) {
          ScrollCore.performInstantScroll(0, 3);
        }
      }, 150);
    };

    // Execute immediately
    performNavigationScroll();
    
    // Additional safety net with RAF
    requestAnimationFrame(() => {
      if (window.pageYOffset > 0) {
        performNavigationScroll();
      }
    });
  },

  onFilterChange: PerformanceUtils.debounce(() => {
    // Handle filter/search result updates
    scrollToTop({ instant: DeviceUtils.isMobile() });
  })
};

// Main exports for backward compatibility
export { scrollToTop as default };

// Export device utilities for external use
export const isMobileDevice = DeviceUtils.isMobile;