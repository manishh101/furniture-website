import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaHeart, 
  FaEye, 
  FaChevronDown, 
  FaChevronUp, 
  FaFilter, 
  FaShoppingCart, 
  FaTag, 
  FaStar, 
  FaArrowDown, 
  FaTimes,
  FaList,
  FaImage
} from 'react-icons/fa';
import { useOptimizedProducts } from '../hooks/useOptimizedProducts';
import { useCategoryNavigation } from '../hooks/useCategoryNavigation';
import { scrollToTop, forceScrollToTop, ScrollHandlers } from '../utils/scrollUtils';
import ProductCard from '../components/ProductCard';
import ImageService from '../services/imageService';
import OptimizedImage from '../components/common/OptimizedImage';

const ProductsPage = () => {
  // Use optimized hooks for instant loading
  const { 
    products: filteredAndSortedProducts, 
    loading, 
    error, 
    searchTerm, 
    sortOption,
    selectedCategory, 
    selectedSubcategory,
    updateSearchTerm: setSearchTerm,
    updateSortOption: setSortOption,
    refreshProducts,
    setSelectedCategory,
    setSelectedSubcategory
  } = useOptimizedProducts();
  
  const { categories, getCategoryById, getSubcategoryById } = useCategoryNavigation();
  
  // UI state
  const [expandedCategories, setExpandedCategories] = useState({});
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortDrawerVisible, setSortDrawerVisible] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();

  // Use filtered products from the hook with fallback to empty array for safety
  const products = filteredAndSortedProducts || [];
  const filteredProducts = filteredAndSortedProducts || [];
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Effect to reset to first page if we have fewer products
  useEffect(() => {
    if (filteredProducts.length > 0 && filteredProducts.length <= (currentPage - 1) * itemsPerPage) {
      setCurrentPage(1);
    }
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Effect to scroll to top when search term or filters change
  useEffect(() => {
    // Reset to first page when search term or category changes
    setCurrentPage(1);
    
    // Scroll to top when search term or filters change using enhanced utility
    ScrollHandlers.onFilterChange();
  }, [searchTerm, selectedCategory, selectedSubcategory, sortOption]);

  // Toggle mobile filters visibility
  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };

  // Toggle sort options drawer visibility
  const toggleSortDrawer = () => {
    setSortDrawerVisible(!sortDrawerVisible);
  };
  
  // Open quick view modal for a product
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    document.body.style.overflow = 'hidden';
  };

  // Close quick view modal
  const closeQuickView = () => {
    setQuickViewProduct(null);
    document.body.style.overflow = 'unset';
  };
  
  // Handle background click for modal
  const handleModalBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      closeQuickView();
    }
  };

  // Handle product view details
  const handleViewDetails = (productId) => {
    if (!productId) return;
    closeQuickView();
    
    const formattedId = productId.toString().replace(/^p/, '');
    navigate(`/products/${formattedId}`);
    
    // Ensure we scroll to top when navigating to product details
    scrollToTop({ instant: true });
  };

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Navigation utility for categories/subcategories
  const navigateToProducts = (category, subcategory = null) => {
    let url = '/products';
    const params = new URLSearchParams();
    
    if (category && category !== 'all') {
      params.set('category', category);
      if (subcategory) {
        params.set('subcategory', subcategory);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    navigate(url, { replace: true });
  };

  // Render star ratings
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={`star-${index}`}
            className={`h-4 w-4 ${
              index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating})</span>
      </div>
    );
  };

  // Toggle category expansion in sidebar
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle category filter click
  const handleCategoryFilter = (categoryName) => {
    // Check if we're already on this category to avoid unnecessary navigation
    if (selectedCategory === categoryName) return;
    
    // Navigate - the hook will handle setting the selected category
    navigateToProducts(categoryName);
  };

  // Handle subcategory filter click
  const handleSubcategoryFilter = (categoryName, subcategoryName) => {
    // Check if we're already on this subcategory to avoid unnecessary navigation
    if (selectedCategory === categoryName && selectedSubcategory === subcategoryName) return;
    
    // Navigate - the hook will handle setting the selected subcategory
    navigateToProducts(categoryName, subcategoryName);
  };

  // Calculate products for current page, ensuring filteredProducts is always an array
  const currentProducts = (filteredProducts || []).slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages with enhanced scroll behavior
    scrollToTop({ instant: true });
  };

  // Sort options
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A to Z' },
    { value: 'name-z-a', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' }
  ];

  // --- Minimal, user-friendly header and controls ---
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-primary text-white md:sticky md:top-0 md:z-10">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Shop</h1>
            {selectedCategory !== 'all' && getCategoryById(selectedCategory) && (
              <div className="text-white/90 text-sm mt-1">
                {getCategoryById(selectedCategory)?.name}
                {selectedSubcategory && getSubcategoryById(selectedCategory, selectedSubcategory) && (
                  <> &middot; {getSubcategoryById(selectedCategory, selectedSubcategory)?.name}</>
                )}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="max-w-7xl mx-auto px-4 py-2 text-red-100 bg-red-500/20 border-b border-red-300/50 text-sm flex items-center gap-2">
            <FaTimes />
            <span>Error loading products: {error}</span>
          </div>
        )}
      </header>
      
      
      {/* Mobile Search & Sort Controls - Below Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={toggleSortDrawer}
            className="px-3 py-2 border border-gray-200 rounded bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1"
          >
            <FaArrowDown />
            <span>Sort</span>
          </button>
        </div>
      </div>
      
      {/* Simple Sort Drawer */}
      {sortDrawerVisible && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-gray-700 flex items-center">
                <FaArrowDown className="mr-2" /> Sort by:
              </span>
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    sortOption === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    setSortOption(option.value);
                    setSortDrawerVisible(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setSortDrawerVisible(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 p-2"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar with Search and Categories */}
          <div className={`w-full lg:w-80 ${mobileFiltersVisible ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border p-6 md:sticky md:top-20">
              {/* Desktop Search Controls */}
              <div className="hidden lg:block mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                <button 
                  className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={toggleMobileFilters}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-2">
                {/* All Products */}
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCategoryFilter('all')}
                >
                  All Products
                </button>
                
                {/* Categories */}
                {Array.isArray(categories) && categories.map(category => (
                  <div key={category.id || category._id}>
                    <div className="flex items-center">
                      <button
                        className={`text-left px-4 py-3 rounded-lg flex-1 transition-colors ${
                          selectedCategory === (category.id || category._id) && !selectedSubcategory 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleCategoryFilter(category.id || category._id)}
                      >
                        {category.name}
                      </button>
                      
                      {category.subcategories && category.subcategories.length > 0 && (
                        <button
                          onClick={() => toggleCategoryExpansion(category.id || category._id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedCategories[category.id || category._id] ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && expandedCategories[category.id || category._id] && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.subcategories.map(subcategory => (
                          <button
                            key={subcategory.id || subcategory._id}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === category.name && 
                              selectedSubcategory === subcategory.name
                                ? 'bg-primary text-white' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSubcategoryFilter(
                              category.name, 
                              subcategory.name
                            )}
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={() => navigateToProducts('all')}
                className="mt-6 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimes size={14} />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Product Count and Sort Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <p className="text-gray-600">
                {loading ? (
                  'Loading products...'
                ) : (
                  <>
                    Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {
                      Math.min(currentPage * itemsPerPage, filteredProducts.length)
                    } of {filteredProducts.length} products
                  </>
                )}
              </p>
              
              {/* Desktop Sort Controls */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhanced Loading State with skeleton animations */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                {[...Array(8)].map((_, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-shimmer"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded-lg animate-shimmer"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-shimmer"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
                      <div className="h-10 bg-gray-200 rounded-lg animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Error State */}
            {error && (
              <div className="text-center py-16 animate-fadeIn">
                <div className="text-red-500 mb-6 animate-bounce">
                  <FaTimes className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  onClick={refreshProducts}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Enhanced Products Grid */}
            {!loading && !error && (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 animate-fadeIn">
                    <div className="text-gray-400 mb-6 animate-bounce">
                      <FaSearch className="h-20 w-20 mx-auto opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm ? (
                        <>We couldn't find any products matching "{searchTerm}". Try adjusting your search terms.</>
                      ) : (
                        <>No products available in this category. Try browsing other categories or check back later.</>
                      )}
                    </p>
                    <div className="flex justify-center gap-4">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                        >
                          Clear Search
                        </button>
                      )}
                      <button
                        onClick={() => handleCategoryFilter('all')}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                      >
                        View All Products
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Enhanced Products Grid with staggered animations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {currentProducts.map((product, index) => (
                        <div 
                          key={product._id || product.id}
                          className="animate-fadeIn"
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          <ProductCard
                            product={product}
                            onQuickView={openQuickView}
                            onViewDetails={handleViewDetails}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-16 animate-fadeIn">
                    <div className="flex items-center space-x-3 bg-white rounded-xl shadow-lg p-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              currentPage === pageNumber
                                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg transform scale-110'
                                : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sort Drawer */}
      {sortDrawerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sort By</h3>
              <button
                onClick={toggleSortDrawer}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-3">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortOption(option.value);
                    toggleSortDrawer();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                    sortOption === option.value
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quick View Modal */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={handleModalBackgroundClick}
        >
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 md:p-6 border-b bg-gray-50">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Quick View</h3>
              <button
                onClick={closeQuickView}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-full"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-8 overflow-y-auto max-h-[calc(95vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Enhanced Image Section */}
                <div className="space-y-4">
                  <div className="relative group">
                    <OptimizedImage
                      src={quickViewProduct.image || (quickViewProduct.images && quickViewProduct.images[0])}
                      alt={ImageService.getImageAlt(quickViewProduct)}
                      category={quickViewProduct.category}
                      size="large"
                      className="w-full h-64 md:h-80 lg:h-96 rounded-xl shadow-md transition-transform group-hover:scale-105"
                      lazy={false}
                      onLoad={(e) => setLoadedImages(prev => ({...prev, [quickViewProduct._id || quickViewProduct.id]: true}))}
                    />
                    {/* Full Screen View Button */}
                    <button
                      onClick={() => {
                        const imgSrc = ImageService.getOptimizedImageUrl(
                          quickViewProduct.image || (quickViewProduct.images && quickViewProduct.images[0]),
                          { category: quickViewProduct.category, width: 1600, height: 1600 }
                        );
                        const newWindow = window.open('', '_blank');
                        newWindow.document.write(`
                          <html>
                            <head><title>${quickViewProduct.name}</title></head>
                            <body style="margin:0; background:#000; display:flex; align-items:center; justify-content:center; min-height:100vh;">
                              <img src="${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="${quickViewProduct.name}">
                            </body>
                          </html>
                        `);
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Additional Images Preview (if available) */}
                  {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {quickViewProduct.images.slice(0, 4).map((image, index) => (
                        <OptimizedImage
                          key={index}
                          src={image}
                          alt={`${quickViewProduct.name} ${index + 1}`}
                          category={quickViewProduct.category}
                          size="thumbnail"
                          className="w-16 h-16 rounded-lg border-2 border-gray-200 hover:border-primary cursor-pointer transition-colors flex-shrink-0"
                          lazy={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Product Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      {quickViewProduct.name}
                    </h4>
                    
                    {quickViewProduct.category && (
                      <div className="mb-3">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {quickViewProduct.category}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {quickViewProduct.description || "High-quality furniture crafted with precision and care."}
                    </p>
                    
                    {quickViewProduct.features && (
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-900 mb-2">Features:</h5>
                        <ul className="text-gray-600 space-y-1">
                          {quickViewProduct.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <span className="text-3xl md:text-4xl font-bold text-primary">
                        Rs. {quickViewProduct.price?.toLocaleString() || quickViewProduct.price}
                      </span>
                      {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                        <span className="text-lg text-gray-500 line-through ml-3">
                          Rs. {quickViewProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewDetails(quickViewProduct._id || quickViewProduct.id)}
                      className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      View Full Details
                    </button>
                    
                    <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all duration-300 group">
                      <FaHeart className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
