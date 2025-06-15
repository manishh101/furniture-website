import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import newLogo from '../assets/new-logo-1.png';
import { scrollToTop } from '../utils/scrollUtils';

const Header = forwardRef(({ onMenuStateChange }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for mobile menu state changes from LayoutWrapper
  useEffect(() => {
    const handleMenuStateChange = (e) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setIsMenuOpen(e.detail.isOpen);
      }
    };
    
    window.addEventListener('mobileMenuStateChanged', handleMenuStateChange);
    return () => window.removeEventListener('mobileMenuStateChanged', handleMenuStateChange);
  }, []);

  // Handle scroll behavior for mobile header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only apply on mobile devices (screen width < 768px)
      if (window.innerWidth >= 768) {
        setIsHeaderVisible(true);
        return;
      }
      
      // Show header when at top of page
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let timeoutId = null;
    const throttledHandleScroll = () => {
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 10);
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    window.addEventListener('resize', handleScroll); // Reset on window resize
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  // Add body padding for fixed header on mobile
  useEffect(() => {
    const updateBodyPadding = () => {
      if (window.innerWidth < 768) {
        // Add padding to prevent content from hiding behind fixed header
        document.body.style.paddingTop = '80px'; // Adjusted for original logo size + reduced padding
      } else {
        document.body.style.paddingTop = '0px';
      }
    };

    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);
    
    return () => {
      window.removeEventListener('resize', updateBodyPadding);
      document.body.style.paddingTop = '0px'; // Clean up on unmount
    };
  }, []);

  // Check if current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle desktop search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Function to toggle the mobile menu
  const toggleMobileMenu = () => {
    // Instead of handling everything here, just dispatch the event
    // and let LayoutWrapper handle the actual menu state
    const event = new CustomEvent('mobileMenuStateChanged', { 
      detail: { isOpen: !isMenuOpen } 
    });
    window.dispatchEvent(event);
  };
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    toggleMobileMenu
  }));

  // Add a function to handle the mobile search button click
  const handleMobileSearchButtonClick = () => {
    // Dispatch custom event to notify MobileMenuDrawer to open and focus search
    const event = new CustomEvent('openMobileMenuWithSearch', {
      detail: { focusSearch: true }
    });
    window.dispatchEvent(event);
  };

  // Handle link clicks to scroll to top
  const handleNavLinkClick = (e, path) => {
    // If it's the same path, just scroll to top with enhanced behavior
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop({ instant: true });
    }
  };

  return (
    <header 
      className={`bg-white shadow-md z-30 transition-transform duration-300 ease-in-out fixed top-0 left-0 right-0 md:sticky md:top-0 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      } md:translate-y-0`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* Logo Section */}
          <div className="flex-shrink-0 z-40">
            <Link to="/" className="flex items-center" onClick={(e) => handleNavLinkClick(e, '/')}>
              <img src={newLogo} alt="Shree Manish Steel Furniture Industry" className="h-16" />
            </Link>
          </div>

          {/* Mobile Search and Menu Buttons */}
          <div className="md:hidden z-40 flex items-center">
            {/* Mobile Search Button */}
            <button
              onClick={handleMobileSearchButtonClick}
              className="text-primary focus:outline-none p-2 mr-2"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="text-primary hover:text-primary-dark transition-colors focus:outline-none p-2 rounded-full hover:bg-gray-100" 
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex flex-grow items-center justify-end">
            {/* Centered Navigation Links */}
            <nav className="flex-grow">
              <ul className="flex justify-center space-x-8">
                <li><Link to="/" onClick={(e) => handleNavLinkClick(e, '/')} className={`text-lg font-medium transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-text hover:text-primary'}`}>Home</Link></li>
                <li><Link to="/products" onClick={(e) => handleNavLinkClick(e, '/products')} className={`text-lg font-medium transition-colors ${isActive('/products') ? 'text-primary border-b-2 border-primary' : 'text-text hover:text-primary'}`}>Products</Link></li> 
                <li><Link to="/gallery" onClick={(e) => handleNavLinkClick(e, '/gallery')} className={`text-lg font-medium transition-colors ${isActive('/gallery') ? 'text-primary border-b-2 border-primary' : 'text-text hover:text-primary'}`}>Gallery</Link></li>
                <li><Link to="/about" onClick={(e) => handleNavLinkClick(e, '/about')} className={`text-lg font-medium transition-colors ${isActive('/about') ? 'text-primary border-b-2 border-primary' : 'text-text hover:text-primary'}`}>About</Link></li>
                <li><Link to="/contact" onClick={(e) => handleNavLinkClick(e, '/contact')} className={`text-lg font-medium transition-colors ${isActive('/contact') ? 'text-primary border-b-2 border-primary' : 'text-text hover:text-primary'}`}>Contact</Link></li>
                <li><Link to="/custom-order" onClick={(e) => handleNavLinkClick(e, '/custom-order')} className="bg-accent text-primary font-medium px-4 py-2 rounded-md hover:bg-accent/80 transition-colors">Customized Order</Link></li>
              </ul>
            </nav>

            {/* Search Bar (Right Side) */}
            <div className="ml-6 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 bg-primary text-white p-2 rounded-md hover:bg-primary/80 transition-colors"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
