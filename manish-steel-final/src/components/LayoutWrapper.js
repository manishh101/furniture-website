import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import BottomNavigation from './BottomNavigation';
import MobileMenuDrawer from './MobileMenuDrawer';
import CategoryDrawer from './CategoryDrawer';
import PageTransition from './PageTransition';

// Enhanced LayoutWrapper component for centralized menu state management
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  const headerRef = useRef(null);

  // Check if we're on the products page
  const isProductsPage = location.pathname === '/products' || location.pathname.startsWith('/products/');
  const navigate = useNavigate();

  // Toggle mobile categories filter drawer
  const toggleCategories = () => {
    // If not on products page, navigate there first and then open categories
    if (!isProductsPage) {
      navigate('/products');
      // Dispatch event to open categories after navigation
      setTimeout(() => {
        const event = new CustomEvent('openCategories');
        window.dispatchEvent(event);
      }, 150);
    } else {
      // Toggle categories visibility if already on products page
      const newState = !mobileFiltersVisible;
      setMobileFiltersVisible(newState);
      
      // Synchronize the global indicator
      const indicator = document.getElementById('mobileFiltersVisibleIndicator');
      if (indicator) {
        indicator.setAttribute('data-visible', newState.toString());
      }
    }
  };

  // Toggle mobile menu drawer - centralized control
  const toggleMenu = () => {
    const newMenuState = !menuDrawerVisible;
    setMenuDrawerVisible(newMenuState);
    
    // Dispatch a custom event to notify other components
    const event = new CustomEvent('mobileMenuStateChanged', { 
      detail: { isOpen: newMenuState } 
    });
    window.dispatchEvent(event);
  };

  // Effect to sync the menu state from all sources
  useEffect(() => {
    // Create a global event listener for menu state changes
    const handleMenuStateChange = (e) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setMenuDrawerVisible(e.detail.isOpen);
      }
    };

    // Listen for categories open intent
    const handleCategoriesIntent = () => {
      setMobileFiltersVisible(true);
      const indicator = document.getElementById('mobileFiltersVisibleIndicator');
      if (indicator) {
        indicator.setAttribute('data-visible', 'true');
      }
    };

    window.addEventListener('mobileMenuStateChanged', handleMenuStateChange);
    window.addEventListener('openCategories', handleCategoriesIntent);
    
    return () => {
      window.removeEventListener('mobileMenuStateChanged', handleMenuStateChange);
      window.removeEventListener('openCategories', handleCategoriesIntent);
    };
  }, []);

  // Close drawers when changing routes (except when going to products with categories intent)
  useEffect(() => {
    if (menuDrawerVisible) {
      setMenuDrawerVisible(false);
      const event = new CustomEvent('mobileMenuStateChanged', { 
        detail: { isOpen: false } 
      });
      window.dispatchEvent(event);
    }
    
    // Only close categories if not navigating to products page
    if (mobileFiltersVisible && !location.pathname.startsWith('/products')) {
      setMobileFiltersVisible(false);
      const indicator = document.getElementById('mobileFiltersVisibleIndicator');
      if (indicator) {
        indicator.setAttribute('data-visible', 'false');
      }
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && (
        <Header 
          ref={headerRef} 
          onMenuStateChange={(isOpen) => setMenuDrawerVisible(isOpen)} 
        />
      )}
      
      <main id="main-content" className="flex-grow" tabIndex="-1" role="main">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppButton />}
      
      {!isAdminRoute && (
        <BottomNavigation 
          toggleCategories={toggleCategories} 
          toggleMenu={toggleMenu} 
        />
      )}
      
      {/* Mobile menu drawer - for all non-admin pages - SINGLE SOURCE OF TRUTH */}
      {!isAdminRoute && (
        <MobileMenuDrawer 
          isOpen={menuDrawerVisible} 
          onClose={toggleMenu}
        />
      )}
      
      {/* Categories drawer - for all non-admin pages */}
      {!isAdminRoute && (
        <CategoryDrawer
          isOpen={mobileFiltersVisible}
          onClose={() => {
            setMobileFiltersVisible(false);
            const indicator = document.getElementById('mobileFiltersVisibleIndicator');
            if (indicator) {
              indicator.setAttribute('data-visible', 'false');
            }
          }}
        />
      )}
      
      {/* This div simply exposes the mobileFiltersVisible state to the global window object
         so our ProductsPage component can listen to it and sync its state */}
      <div id="mobileFiltersVisibleIndicator" data-visible={mobileFiltersVisible} hidden></div>
    </div>
  );
};

export default LayoutWrapper;
