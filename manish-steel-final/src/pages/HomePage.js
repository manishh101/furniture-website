import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import homePageImage from '../assets/home-page-1.png';
import { PlaceholderImage } from '../utils/placeholders';
import { useCategoryNavigation } from '../hooks/useCategoryNavigation';
import cacheService from '../services/cacheService';
import CategoryImageService from '../services/categoryImageService';
import CleanTopProductsSection from '../components/CleanTopProductsSection';
import CleanMostSellingSection from '../components/CleanMostSellingSection';
import { testimonials } from '../data/testimonials';
import ScrollAnimator from '../components/ScrollAnimator';
import OptimizedImage from '../components/common/OptimizedImage';
import ApiDebugger from '../components/ApiDebugger';

const HomePage = () => {
  // Use optimized category navigation hook
  const { categories, loading, navigateToCategory } = useCategoryNavigation();
  // State for category thumbnail images
  const [categoryThumbnails, setCategoryThumbnails] = useState({});
  // Additional loading state for thumbnails
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);
  
  // State for testimonial carousel
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const testimonialsPerPage = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

  // Preload common products when component mounts for instant browsing
  useEffect(() => {
    setTimeout(() => {
      cacheService.preloadCommonProducts();
      // Also preload category thumbnails for better UX
      CategoryImageService.preloadCommonCategoryThumbnails();
    }, 500);
  }, []);
  
  // Load thumbnail images for each category
  useEffect(() => {
    const loadCategoryThumbnails = async () => {
      if (!categories || categories.length === 0) return;
      
      setLoadingThumbnails(true);
      const thumbnails = {};
      
      // Also preload thumbnails for hardcoded fallback category IDs
      const fallbackCategoryIds = ['684c14969550362979fd95a2', '684c14969550362979fd95a3', '684c14969550362979fd95a4'];
      
      // Combine all category IDs to load thumbnails for
      const allCategoryIds = [
        ...categories.map(category => category._id || category.id),
        ...fallbackCategoryIds
      ];
      
      // Process all categories in parallel for better performance
      await Promise.all(allCategoryIds.map(async (categoryId) => {
        try {
          const category = categories.find(c => (c._id || c.id) === categoryId) || 
                          { name: categoryId === '684c14969550362979fd95a2' ? 'Household Furniture' :
                                 categoryId === '684c14969550362979fd95a3' ? 'Office Furniture' : 
                                 'Commercial Furniture' };
                                 
          const thumbnail = await CategoryImageService.getCategoryThumbnailImage(
            categoryId,
            category.name
          );
          thumbnails[categoryId] = thumbnail;
          console.log(`Loaded thumbnail for ${category.name}: ${thumbnail.substring(0, 30)}...`);
        } catch (error) {
          console.error(`Failed to load thumbnail for category ${categoryId}:`, error);
        }
      }));
      
      setCategoryThumbnails(thumbnails);
      setLoadingThumbnails(false);
    };
    
    if (categories && categories.length > 0) {
      loadCategoryThumbnails();
    }
  }, [categories]);

  // Handle category click with instant navigation
  const handleCategoryClick = (categoryId, categoryName) => {
    console.log('HomePage: Category clicked', { categoryId, categoryName });
    // Use category ID for professional API calls - backend supports both ID and name filtering
    navigateToCategory(categoryId);
  };

  // Calculate total pages for carousel
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  
  // Handle window resize for responsive display
  useEffect(() => {
    const handleResize = () => {
      const newTestimonialsPerPage = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      const newTotalPages = Math.ceil(testimonials.length / newTestimonialsPerPage);
      if (currentTestimonialPage >= newTotalPages) {
        setCurrentTestimonialPage(newTotalPages - 1);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTestimonialPage, testimonials.length]);
  
  // Functions to handle testimonial navigation
  const nextTestimonialPage = () => {
    setCurrentTestimonialPage(prev => (prev + 1) % totalPages);
  };
  
  const prevTestimonialPage = () => {
    setCurrentTestimonialPage(prev => (prev - 1 + totalPages) % totalPages);
  };
  
  // Calculate which testimonials to show
  const visibleTestimonials = testimonials.slice(
    currentTestimonialPage * testimonialsPerPage,
    (currentTestimonialPage * testimonialsPerPage) + testimonialsPerPage
  );

  return (
    <div>
      {/* Hero Section with Image on Right */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Content */}
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10 animate-fadeIn">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 animate-slideInLeft">
                <span className="block mb-2">Shree Manish Steel Furniture Industry</span>
                Quality Steel Furniture for Every Space
              </h1>
              <p className="text-lg md:text-xl text-text/80 mb-8 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
                Welcome to Shree Manish Steel Furniture Industry, where we craft durable, 
                stylish, and functional steel furniture for homes and offices across Nepal.
              </p>
              <div className="flex flex-wrap gap-4 animate-slideInLeft" style={{animationDelay: '0.4s'}}>
                <Link 
                  to="/products" 
                  className="bg-primary text-white font-bold px-6 py-3 rounded-md hover:bg-primary/80 transition-all hover:scale-105"
                  style={{minWidth: '140px', textAlign: 'center'}}
                >
                  Explore Products
                </Link>
                <Link 
                  to="/contact" 
                  className="bg-white text-primary font-bold px-6 py-3 rounded-md border-2 border-primary hover:bg-primary/10 transition-all hover:scale-105"
                  style={{minWidth: '140px', textAlign: 'center'}}
                >
                  Contact Us
                </Link>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="md:w-1/2 animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                <img 
                  src={homePageImage} 
                  alt="Manish Steel Furniture Collection" 
                  className="w-full rounded-lg shadow-xl animate-float"
                />
                <div className="absolute -bottom-4 -right-4 bg-accent w-24 h-24 rounded-full flex items-center justify-center text-primary font-bold text-lg z-10 animate-pulse">
                  New<br/>Designs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <ScrollAnimator animation="fadeUp">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Furniture?</h2>
          </ScrollAnimator>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimator animation="fadeUp" delay={0.1}>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto animate-spin-slow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Durability</h3>
                <p className="text-center">
                  Our furniture is built to last, using high-quality steel and precision manufacturing techniques.
                </p>
              </div>
            </ScrollAnimator>
            
            <ScrollAnimator animation="fadeUp" delay={0.2}>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto animate-spin-slow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Design</h3>
                <p className="text-center">
                  Modern, functional designs that blend seamlessly with your decor and lifestyle.
                </p>
              </div>
            </ScrollAnimator>
            
            <ScrollAnimator animation="fadeUp" delay={0.3}>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto animate-spin-slow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Fast Delivery</h3>
                <p className="text-center">
                  Quick and reliable delivery service across Nepal with professional installation support.
                </p>
              </div>
            </ScrollAnimator>
          </div>
        </div>
      </section>
      
      {/* Instant Category Display Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary text-center mb-3 animate-fadeIn">
            Browse Our Collections
          </h2>
          <p className="text-gray-600 text-center mb-12 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Discover our comprehensive range of steel furniture designed for your needs
          </p>
          
          {/* Display loading state or categories */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <div 
                    key={category._id || category.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeInUp group"
                    style={{animationDelay: `${0.1 + (index * 0.1)}s`}}
                  >
                    <div className="h-64 overflow-hidden relative">
                      {categoryThumbnails[category._id || category.id] ? (
                        // Use actual product image from the category's products
                        <OptimizedImage 
                          src={categoryThumbnails[category._id || category.id]}
                          alt={`${category.name} Products`} 
                          category={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        // Fallback to placeholder while loading
                        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">
                          Loading products...
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button 
                          onClick={() => handleCategoryClick(category._id || category.id, category.name)}
                          className="bg-primary text-white px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-primary mb-2">{category.name}</h3>
                      <p className="text-text/80 mb-4 line-clamp-2">
                        {category.description || `Quality ${category.name.toLowerCase()} made with precision and care for your needs.`}
                      </p>
                      <button 
                        onClick={() => handleCategoryClick(category._id || category.id, category.name)}
                        className="text-primary font-medium hover:text-primary/80 flex items-center group"
                      >
                        View Collection
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback categories for instant display
                <>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeInUp group" style={{animationDelay: '0.1s'}}>
                    <div className="h-64 overflow-hidden relative">
                      {/* This will be called when fallback categories are shown */}
                      <OptimizedImage
                        src={categoryThumbnails['684c14969550362979fd95a2'] || '/placeholders/Household-Furniture.png'}
                        alt="Household Furniture"
                        category="Household Furniture"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button 
                          onClick={() => handleCategoryClick('684c14969550362979fd95a2', 'Household Furniture')}
                          className="bg-primary text-white px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-primary mb-2">Household Furniture</h3>
                      <p className="text-text/80 mb-4 line-clamp-2">
                        Quality household furniture made with precision and care for your home.
                      </p>
                      <button 
                        onClick={() => handleCategoryClick('684c14969550362979fd95a2', 'Household Furniture')}
                        className="text-primary font-medium hover:text-primary/80 flex items-center group"
                      >
                        View Collection
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeInUp group" style={{animationDelay: '0.2s'}}>
                    <div className="h-64 overflow-hidden relative">
                      <OptimizedImage 
                        src={categoryThumbnails['684c14969550362979fd95a3'] || '/placeholders/Office-Products.png'} 
                        alt="Office Furniture" 
                        category="Office Furniture"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button 
                          onClick={() => handleCategoryClick('684c14969550362979fd95a3', 'Office Furniture')}
                          className="bg-primary text-white px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-primary mb-2">Office Furniture</h3>
                      <p className="text-text/80 mb-4 line-clamp-2">
                        Professional office furniture for productive workspaces.
                      </p>
                      <button 
                        onClick={() => handleCategoryClick('684c14969550362979fd95a3', 'Office Furniture')}
                        className="text-primary font-medium hover:text-primary/80 flex items-center group"
                      >
                        View Collection
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeInUp group" style={{animationDelay: '0.3s'}}>
                    <div className="h-64 overflow-hidden relative">
                      <OptimizedImage 
                        src={categoryThumbnails['684c14969550362979fd95a4'] || '/placeholders/Commercial-Shelving.png'} 
                        alt="Commercial Furniture" 
                        category="Commercial Furniture"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button 
                          onClick={() => handleCategoryClick('684c14969550362979fd95a4', 'Commercial Furniture')}
                          className="bg-primary text-white px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-primary mb-2">Commercial Furniture</h3>
                      <p className="text-text/80 mb-4 line-clamp-2">
                        Durable commercial furniture for business environments.
                      </p>
                      <button 
                        onClick={() => handleCategoryClick('684c14969550362979fd95a4', 'Commercial Furniture')}
                        className="text-primary font-medium hover:text-primary/80 flex items-center group"
                      >
                        View Collection
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-center mt-10">
            <Link 
              to="/products"
              className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary/80 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Our Top Products Section */}
      <CleanTopProductsSection />
      
      {/* Most Selling Products Section */}
      <CleanMostSellingSection />
      
      {/* Enhanced Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-gray-100 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute transform -rotate-12 -left-10 top-10 text-9xl font-bold text-primary">"</div>
          <div className="absolute transform rotate-12 -right-10 bottom-10 text-9xl font-bold text-primary">"</div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary text-center mb-3 animate-fadeIn">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover why our customers trust us with their furniture needs. Here's what they have to say about their experience with Shree Manish Steel.</p>
          </div>
          
          {/* Testimonial Cards with Navigation */}
          <div className="relative">
            {/* Previous Button */}
            <button 
              onClick={prevTestimonialPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-8 bg-white p-2 rounded-full shadow-lg z-20 hover:bg-primary hover:text-white transition-colors"
              aria-label="Previous testimonials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTestimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white p-6 rounded-lg shadow-md transform hover:-translate-y-1 transition-transform duration-300 border border-gray-100 relative animate-fadeInUp"
                  style={{animationDelay: `${0.1 + (index * 0.2)}s`}}
                >
                  {testimonial.verified && (
                    <div className="absolute -top-3 -right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  )}
                  
                  <div className="flex items-center mb-4">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-primary" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-primary font-bold">{testimonial.initials}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <span className="text-gray-500 text-sm ml-2">• {testimonial.location}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{testimonial.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Purchased: {testimonial.productPurchased}</div>
                    <p className="text-text/80 italic">"{testimonial.text}"</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next Button */}
            <button 
              onClick={nextTestimonialPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-8 bg-white p-2 rounded-full shadow-lg z-20 hover:bg-primary hover:text-white transition-colors"
              aria-label="Next testimonials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentTestimonialPage(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${currentTestimonialPage === i ? 'bg-primary w-8' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial page ${i + 1}`}
              />
            ))}
          </div>
          
          {/* View More Testimonials Link */}
          <div className="text-center mt-8">
            <Link 
              to="/gallery#testimonials"
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors group"
            >
              View More Testimonials
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fadeIn">Ready to Transform Your Space?</h2>
          <p className="text-lg md:text-xl mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Contact us today to discuss your furniture needs or visit our showroom to see our products in person.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <Link 
              to="/contact" 
              className="bg-white text-primary font-bold px-8 py-3 rounded-md hover:bg-white/90 transition-all hover:scale-105"
              style={{minWidth: '140px', textAlign: 'center'}}
            >
              Contact Us
            </Link>
            <Link 
              to="/custom-order" 
              className="bg-accent text-primary font-bold px-8 py-3 rounded-md hover:bg-accent/80 transition-all hover:scale-105"
              style={{minWidth: '140px', textAlign: 'center'}}
            >
              Request Custom Order
            </Link>
          </div>
        </div>
      </section>

      {/* Temporary API Debugger - remove after fixing issues */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="container mx-auto px-4 py-8">
          <ApiDebugger />
        </div>
      )}
    </div>
  );
};

export default HomePage;
