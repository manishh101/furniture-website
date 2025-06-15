import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../utils/scrollUtils';

// Enhanced MobileMenuDrawer component
const MobileMenuDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const drawerRef = useRef(null);

  // Effect to handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset search query when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    } else if (isOpen && searchInputRef.current) {
      // Optional: automatically focus the search input when drawer opens
      // Uncomment if you want this behavior
      // setTimeout(() => searchInputRef.current.focus(), 300);
    }
  }, [isOpen]);

  // Listen for the focus search event
  useEffect(() => {
    const handleOpenWithSearch = (e) => {
      if (e.detail && e.detail.focusSearch) {
        // Toggle menu if not already open
        if (!isOpen) {
          const event = new CustomEvent('mobileMenuStateChanged', { 
            detail: { isOpen: true } 
          });
          window.dispatchEvent(event);
        }
        
        // Focus the search input after a short delay to ensure the drawer is rendered
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 300);
      }
    };
    
    window.addEventListener('openMobileMenuWithSearch', handleOpenWithSearch);
    return () => window.removeEventListener('openMobileMenuWithSearch', handleOpenWithSearch);
  }, [isOpen]);

  // Handle keyboard events for accessibility - close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Check if path matches
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  // Handle navigation with scroll to top
  const handleNavLinkClick = (e, path) => {
    // If it's the same path, just scroll to top with enhanced behavior
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop({ instant: true });
      onClose();
    } else {
      // For new paths, let the navigation happen normally
      // The ScrollToTop component will handle scrolling
      onClose();
    }
  };

  // Clean render without any old code that might be causing overlaps
  if (!isOpen) return null; // Don't render anything when closed
  
  return (
    <aside 
      id="mobile-menu-drawer" 
      className="fixed inset-0 bg-primary/95 z-[100]"
      ref={drawerRef}
    >
      <div className="absolute inset-0 flex flex-col p-8 text-white">
        {/* Header with close button */}
        <div className="relative mb-12">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 text-white hover:text-accent p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close menu"
          >
            <FaTimes className="h-8 w-8" />
          </button>
        </div>

        {/* Search form */}
        <div className="mb-10">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              id="mobile-search-input"
              placeholder="Search products..."
              className="w-full py-2.5 px-4 pr-12 rounded-md border border-white/20 bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 hover:text-accent transition-colors"
              aria-label="Search"
            >
              <FaSearch className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center" aria-label="Mobile navigation">
          <ul className="flex flex-col items-center space-y-5 w-full">
            <li className="w-full text-center">
              <Link 
                to="/" 
                onClick={(e) => handleNavLinkClick(e, '/')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Home
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                to="/products" 
                onClick={(e) => handleNavLinkClick(e, '/products')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/products') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Products
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                to="/gallery" 
                onClick={(e) => handleNavLinkClick(e, '/gallery')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/gallery') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Gallery
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                to="/about" 
                onClick={(e) => handleNavLinkClick(e, '/about')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/about') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                About
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                to="/contact" 
                onClick={(e) => handleNavLinkClick(e, '/contact')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/contact') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Contact
              </Link>
            </li>
            <li className="w-full text-center mt-4">
              <Link 
                to="/custom-order" 
                onClick={(e) => handleNavLinkClick(e, '/custom-order')} 
                className="inline-block py-2 px-6 text-2xl font-semibold bg-accent text-primary rounded-md hover:bg-accent/80 transition-colors"
              >
                Customized Order
              </Link>
            </li>
            <li className="w-full text-center mt-6 border-t border-white/20 pt-6">
              <Link 
                to="/login" 
                onClick={(e) => handleNavLinkClick(e, '/login')} 
                className="flex items-center justify-center py-2 text-xl font-medium text-white hover:text-accent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MobileMenuDrawer;
