import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scrollToTop, ScrollHandlers } from '../utils/scrollUtils';

/**
 * BottomNavigation Component for Mobile Devices
 * 
 * Buttons and their distinct functionalities:
 * - Home: Navigates to home page, or scrolls to top if already on home
 * - Shop: Navigates to products page, or scrolls to top if already on products
 * - Categories: Toggles the category filter sidebar (only on products page)
 * - Menu: Opens the main mobile menu drawer
 */
const BottomNavigation = ({ toggleCategories, toggleMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Track scroll position to determine when to scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setIsActive('home');
    } else if (path === '/products' || path.startsWith('/products/')) {
      setIsActive('shop');
    }
  }, [location]);
  
  // Listen for mobile menu state changes
  useEffect(() => {
    const handleMenuStateChange = (event) => {
      if (event.detail && typeof event.detail.isOpen === 'boolean') {
        setIsMenuOpen(event.detail.isOpen);
      }
    };
    
    window.addEventListener('mobileMenuStateChanged', handleMenuStateChange);
    return () => window.removeEventListener('mobileMenuStateChanged', handleMenuStateChange);
  }, []);
  
  // Listen for changes to the categories drawer state
  useEffect(() => {
    const indicator = document.getElementById('mobileFiltersVisibleIndicator');
    
    if (indicator) {
      // Initial state
      setIsCategoriesOpen(indicator.getAttribute('data-visible') === 'true');
      
      // Listen for changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-visible') {
            setIsCategoriesOpen(indicator.getAttribute('data-visible') === 'true');
          }
        }
      });
      
      observer.observe(indicator, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  const handleShopClick = () => {
    if (location.pathname === '/products') {
      // If already on products page, always scroll to top (shop's primary function)
      // Use the enhanced scroll function for better mobile compatibility
      scrollToTop({ instant: true });
    } else {
      // Navigate to products page
      navigate('/products');
    }
  };
  
  const handleHomeClick = () => {
    if (location.pathname === '/') {
      // If already on home page, scroll to top
      scrollToTop({ instant: true });
    } else {
      // Navigate to home page
      navigate('/');
    }
  };
  
  const handleCategoriesClick = () => {
    // Categories button should only handle category filtering
    // Navigate to products page first if not already there
    if (location.pathname !== '/products') {
      navigate('/products');
      // Wait for navigation to complete before toggling categories
      setTimeout(() => {
        toggleCategories();
      }, 100);
    } else {
      // If already on products page, just toggle categories
      toggleCategories();
    }
  };
  
  const handleMenuClick = () => {
    toggleMenu();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-40 md:hidden">
      <div className="grid grid-cols-4 h-16">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center transition-colors relative ${isActive === 'home' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-800'}`}
          aria-label={location.pathname === '/' ? 'Scroll to top' : 'Go to Home'}
          title={location.pathname === '/' ? 'Scroll to top' : 'Go to Home'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
          {scrollPosition > 100 && isActive === 'home' && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-75"></div>
          )}
        </button>

        <button 
          onClick={handleShopClick}
          className={`flex flex-col items-center justify-center transition-colors relative ${isActive === 'shop' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-800'}`}
          aria-label={location.pathname === '/products' ? 'Scroll to top' : 'Go to Shop'}
          title={location.pathname === '/products' ? 'Scroll to top' : 'Go to Shop'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs">Shop</span>
          {scrollPosition > 100 && isActive === 'shop' && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-75"></div>
          )}
        </button>

        <button
          onClick={handleCategoriesClick}
          className={`flex flex-col items-center justify-center w-full transition-colors relative ${isCategoriesOpen ? 'text-primary font-medium bg-blue-50' : 'text-gray-600 hover:text-gray-800'}`}
          aria-label={isCategoriesOpen ? 'Close Categories' : 'Open Categories'}
          title={isCategoriesOpen ? 'Close Categories Filter' : 'Open Categories Filter'}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs">Categories</span>
          {isCategoriesOpen && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
          )}
        </button>

        <button
          onClick={handleMenuClick}
          className={`flex flex-col items-center justify-center w-full transition-colors relative ${isMenuOpen ? 'text-primary font-medium bg-blue-50' : 'text-gray-600 hover:text-gray-800'}`}
          aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
          title={isMenuOpen ? 'Close Main Menu' : 'Open Main Menu'}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs">Menu</span>
          {isMenuOpen && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
