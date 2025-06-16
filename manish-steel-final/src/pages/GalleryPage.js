import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LightboxGallery from '../components/LightboxGallery';
import ProfessionalGalleryModal from '../components/ProfessionalGalleryModal';
import { galleryAPI } from '../services/galleryAPI';
import api from '../services/api';
import { FaImages, FaEye, FaFilter, FaThLarge, FaList, FaStar, FaHeart, FaAngleUp, FaAngleRight, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { scrollToTop } from '../utils/scrollUtils';
import GalleryHero from '../components/GalleryHero';
import ImageService from '../services/imageService';
import CloudinaryImageService from '../services/cloudinaryImageService';
import OptimizedImage from '../components/common/OptimizedImage';
import { testimonials } from '../data/testimonials';
import GalleryCard from '../components/GalleryCard';
import GalleryListItem from '../components/GalleryListItem';

// Custom CSS for the gallery
import './gallery-page.css';

// Animation variants for Framer Motion
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }
};

const GalleryPage = () => {
  // Page configuration
  const [config, setConfig] = useState({
    title: 'Our Premium Gallery',
    subtitle: 'Discover our master craftsmanship through stunning visuals',
    layout: 'grid',
    showFilters: true,
    showStats: true,
    heroImage: null
  });
  
  // Main data states
  const [categories, setCategories] = useState([]); // Categories from database + custom projects
  const [products, setProducts] = useState({}); // Products organized by category
  const [allProducts, setAllProducts] = useState([]); // All products flat list for "All" view
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [retryCount, setRetryCount] = useState(0);
  
  // Product detail states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailImages, setProductDetailImages] = useState([]);
  
  // Professional Gallery Modal states
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryModalImages, setGalleryModalImages] = useState([]);
  const [galleryModalTitle, setGalleryModalTitle] = useState('');
  const [galleryModalInitialIndex, setGalleryModalInitialIndex] = useState(0);
  
  // Testimonial state - manage testimonial slider
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Load categories and initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Load config, categories and products in parallel
        const [configResponse, categoriesResponse, sectionsResponse, productsResponse] = await Promise.all([
          galleryAPI.getGalleryConfig().catch(() => ({ data: null })),
          api.get('/categories').catch(() => ({ data: [] })),
          galleryAPI.getGallery().catch(() => ({ data: { sections: [] } })),
          galleryAPI.getAllProducts().catch(() => ({ data: [] }))
        ]);

        // Update configuration if available
        if (configResponse && configResponse.data) {
          setConfig(prevConfig => ({...prevConfig, ...configResponse.data}));
        }
        
        // 2. Process categories from database
        let dbCategories = categoriesResponse.data || [];
        
        // Ensure we have valid data structure for each category
        dbCategories = dbCategories.map(cat => ({
          id: cat._id || `cat-${cat.name?.toLowerCase().replace(/\s+/g, '-')}`,
          name: cat.name || 'Unnamed Category',
          description: cat.description || '',
          image: cat.image || null
        }));
        
        // 3. Add Custom Projects category if not already present
        if (!dbCategories.find(cat => cat.name === "Custom Projects")) {
          dbCategories.push({ 
            id: "custom-projects", 
            name: "Custom Projects",
            description: "Custom designed projects tailored to specific needs",
            image: null
          });
        }
        
        // 4. Process gallery sections
        const gallerySections = sectionsResponse.data?.sections || [];
        
        // Format sections for display
        const formattedSections = gallerySections.map(section => ({
          id: section._id || section.id,
          name: section.name,
          description: section.description,
          category: section.category,
          featured: section.featured,
          images: section.images || [],
          imageCount: (section.images || []).length
        }));
        
        // 5. Set up categories based on both database categories and sections
        const sectionCategories = [...new Set(formattedSections.map(s => s.category))];
        const allCategories = [
          { id: 'all', name: 'All', description: 'All gallery sections and products' },
          { id: 'featured', name: 'Featured', description: 'Featured items' },
          // Add database categories
          ...dbCategories,
          // Add section categories not already in database categories
          ...sectionCategories
            .filter(cat => !dbCategories.some(dbCat => dbCat.name === cat))
            .map(cat => ({
              id: cat.toLowerCase().replace(/\s+/g, '-'),
              name: cat,
              description: `${cat} sections`
            }))
        ];
        
        setCategories(allCategories);
        
        // 6. Process products
        const initialProducts = productsResponse.data || [];
        const formattedProducts = initialProducts.map(formatProduct).filter(Boolean);
        
        // 7. Set up products organized by sections and categories
        const productsByCategory = {
          'all': [...formattedProducts, ...formattedSections],
          'featured': [...formattedProducts.filter(p => p && p.featured), ...formattedSections.filter(s => s.featured)]
        };
        
        // Add products by category
        dbCategories.forEach(cat => {
          if (!cat.id || !cat.name) return;
          
          // Find products that match this category
          const categoryProducts = formattedProducts.filter(p => 
            p && p.category && 
            (p.category.toLowerCase() === cat.name.toLowerCase() || 
             p.category.toLowerCase().includes(cat.name.toLowerCase()) ||
             (p.data && p.data.categoryId === cat.id))
          );
          
          productsByCategory[cat.id] = categoryProducts;
        });
        
        // Add sections by category
        sectionCategories.forEach(cat => {
          const categoryId = cat.toLowerCase().replace(/\s+/g, '-');
          const sectionsInCategory = formattedSections.filter(s => s.category === cat);
          
          // Add sections to existing category products or create new category
          if (productsByCategory[categoryId]) {
            productsByCategory[categoryId] = [...productsByCategory[categoryId], ...sectionsInCategory];
          } else {
            productsByCategory[categoryId] = sectionsInCategory;
          }
        });
        
        // 8. Update state with all products and categories
        setProducts(productsByCategory);
        setAllProducts([...formattedProducts, ...formattedSections]);
        
        // Set active category to 'all' initially
        setActiveCategory('all');
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setError(error.message || 'Failed to load gallery data');
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Format product data consistently with optimized images
  const formatProduct = (product) => {
    if (!product) return null;
    
    // Handle different data structures that might come from the API
    // Safely access nested properties with optional chaining
    const categoryInfo = product.categoryId && typeof product.categoryId === 'object' 
      ? product.categoryId.name
      : (product.category || 'uncategorized');
    
    // Get the primary image source
    const primaryImageSrc = product.mainImage || product.image || product.images?.[0] || product.src;
    
    // Get optimized image URL
    const optimizedImageUrl = ImageService.getOptimizedImageUrl(primaryImageSrc, {
      category: categoryInfo,
      width: 600,
      height: 600
    });
      
    return {
      id: product._id || product.id,
      title: product.name || product.title || 'Unnamed Product',
      description: product.description || '',
      category: categoryInfo,
      src: optimizedImageUrl,
      alt: ImageService.getImageAlt(product),
      featured: product.featured || false,
      tags: product.tags || [],
      data: product // Keep the original data for reference
    };
  };

  // Get all products for statistics
  const getAllGalleryProducts = () => {
    return allProducts;
  };

  // Get gallery statistics
  const getGalleryStats = () => {
    const allGalleryProducts = getAllGalleryProducts();
    // Make sure we're using an array and that each item is valid
    const validProducts = Array.isArray(allGalleryProducts) ? allGalleryProducts.filter(Boolean) : [];
    
    return {
      totalImages: validProducts.length,
      totalCategories: categories.length,
      featuredProducts: validProducts.filter(product => product.featured).length
    };
  };

  const stats = getGalleryStats();
  
  // Get products for the current active category
  const getProductsForCategory = (categoryId) => {
    // Make sure allProducts is always an array
    const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
    
    if (categoryId === 'all') {
      return safeAllProducts;
    }
    
    if (categoryId === 'featured') {
      return safeAllProducts.filter(p => p && p.featured);
    }
    
    // If we have already loaded products for this category
    if (products[categoryId] && Array.isArray(products[categoryId]) && products[categoryId].length > 0) {
      return products[categoryId];
    }
    
    // Try to find products by category name as fallback
    const foundByName = safeAllProducts.filter(
      p => p && p.category && typeof p.category === 'string' && 
      (p.category.toLowerCase() === categoryId.toLowerCase() || 
       p.category.toLowerCase().includes(categoryId.toLowerCase().replace(/-/g, ' ')))
    );
    
    if (foundByName.length > 0) {
      // Cache these results for future use
      setProducts(prev => ({
        ...prev,
        [categoryId]: foundByName
      }));
      return foundByName;
    }
    
    return [];
  };

  // Load products for a specific category
  const loadProductsByCategory = async (categoryId) => {
    try {
      if (categoryId === activeCategory) return; // Already loaded
      
      setLoading(true);
      setActiveCategory(categoryId);
      
      // Handle special cases first
      if (categoryId === 'all' || categoryId === 'featured') {
        setLoading(false);
        return;
      }
      
      // Check if we already have products for this category
      if (products[categoryId] && products[categoryId].length > 0) {
        setLoading(false);
        return;
      }
      
      // Fetch products for the specific category
      const response = await galleryAPI.getProductsByCategory(categoryId)
        .catch(() => ({ data: [] }));
      
      const categoryProducts = response.data || [];
      
      // Format and update products for this category
      const formattedProducts = categoryProducts
        .map(formatProduct)
        .filter(Boolean);
      
      setProducts(prev => ({
        ...prev,
        [categoryId]: formattedProducts
      }));
      
      setLoading(false);
    } catch (error) {
      console.error(`Error loading products for category ${categoryId}:`, error);
      setError(error.message || 'Failed to load category products');
      setLoading(false);
    }
  };

  // Get filtered products based on active category - Deprecated, using getVisibleProducts instead
  const getFilteredProducts = () => {
    return getVisibleProducts();
  };

  // This function is no longer used - we're using handleFilterClick instead
  // Removing to avoid duplicate functionality

  // Handle category filter selection
  const handleFilterClick = (categoryId) => {
    console.log('Filter clicked for category:', categoryId);
    setError(null);
    
    // Update the active category immediately for UI feedback
    setActiveCategory(categoryId);
    
    // For special categories, we don't need to load additional data
    if (categoryId === 'all' || categoryId === 'featured') {
      console.log(`Using special category filter: ${categoryId}`);
      setLoading(false);
      return;
    }
    
    // Check if we already have products for this category
    if (products[categoryId] && products[categoryId].length > 0) {
      console.log(`Using ${products[categoryId].length} cached products for category: ${categoryId}`);
      setLoading(false);
      return;
    }
    
    // Get the category details so we can include the name in API calls
    const categoryDetails = categories.find(cat => cat.id === categoryId);
    const categoryName = categoryDetails ? categoryDetails.name : '';
    console.log(`Fetching products for category: ${categoryId} (${categoryName})`);
    
    // Load products for this category
    setLoading(true);
    galleryAPI.getProductsByCategory(categoryId, categoryName)
      .then(response => {
        const categoryProducts = response.data || [];
        
        // Format and update products for this category
        const formattedProducts = categoryProducts
          .map(formatProduct)
          .filter(Boolean);
        
        console.log(`Loaded ${formattedProducts.length} products for category ${categoryId}`);
        
        // Debug info
        if (formattedProducts.length === 0) {
          console.warn(`No products found for category ${categoryId} (${categoryName})`);
        }
        
        setProducts(prev => ({
          ...prev,
          [categoryId]: formattedProducts
        }));
      })
      .catch(error => {
        console.error(`Error loading products for category ${categoryId}:`, error);
        setError(`Failed to load products for ${categoryId}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle product click to show detailed view
  const handleProductClick = async (product) => {
    try {
      console.log("🎯 Product clicked for gallery view:", product);
      
      if (!product) {
        console.error("❌ Invalid product data: product is null or undefined");
        return;
      }
      
      // Extract product information
      const productId = product.id || product._id || (product.data && product.data._id);
      const productName = product.title || product.name || 'Product Gallery';
      
      console.log(`🔍 Loading gallery for "${productName}" (ID: ${productId})`);
      
      // Set loading state for better UX
      setLoading(true);
      setSelectedProduct(product);
      
      // Start with main product image
      let galleryImages = [];
      if (product.src) {
        // Ensure the image URL is properly formatted for Cloudinary
        const processedImageUrl = CloudinaryImageService.isCloudinaryUrl(product.src) 
          ? CloudinaryImageService.optimizeCloudinaryUrl(product.src, { quality: "auto:best", fetch_format: "auto" })
          : product.src;
        galleryImages.push(processedImageUrl);
      }
      
      // Check for data.images if available
      if (product.data && Array.isArray(product.data.images) && product.data.images.length > 0) {
        console.log(`📸 Found ${product.data.images.length} images in product data object`);
        
        // Process all images from product data
        product.data.images.forEach(img => {
          if (!img) return;
          
          const processedUrl = CloudinaryImageService.isCloudinaryUrl(img) 
            ? CloudinaryImageService.optimizeCloudinaryUrl(img, { quality: "auto:best", fetch_format: "auto" })
            : img;
            
          // Don't add duplicates
          if (!galleryImages.includes(processedUrl)) {
            galleryImages.push(processedUrl);
          }
        });
      }
      
      // If we have a product ID, fetch additional images
      if (productId) {
        try {
          console.log(`📸 Fetching detailed images for product ${productId}`);
          const productDetail = await galleryAPI.getProductDetail(productId);
          
          if (productDetail && productDetail.isGalleryReady && productDetail.galleryData) {
            console.log(`✅ Gallery ready with ${productDetail.totalImages} images`);
            
            // Process all images to ensure they're properly formatted for Cloudinary
            const processedImages = CloudinaryImageService.processGalleryImages(
              productDetail.galleryData.map(img => img.url)
            );
            
            setGalleryModalImages(processedImages);
            setGalleryModalTitle(productName);
            setGalleryModalInitialIndex(0);
            setIsGalleryModalOpen(true);
            
          } else if (productDetail && productDetail.images && productDetail.images.length > 0) {
            console.log(`📷 Found ${productDetail.images.length} images in product detail`);
            
            // Use the images array from product detail
            setGalleryModalImages(productDetail.images);
            setGalleryModalTitle(productName);
            setGalleryModalInitialIndex(0);
            setIsGalleryModalOpen(true);
            
          } else {
            console.log(`⚠️ No additional images found, using main image only`);
            
            // Fallback to just the main image
            if (galleryImages.length > 0) {
              setGalleryModalImages(galleryImages);
              setGalleryModalTitle(productName);
              setGalleryModalInitialIndex(0);
              setIsGalleryModalOpen(true);
            } else {
              console.error("❌ No images available for gallery");
            }
          }
          
        } catch (detailError) {
          console.error("❌ Error fetching product details:", detailError);
          
          // Fallback to main image if API fails
          if (galleryImages.length > 0) {
            setGalleryModalImages(galleryImages);
            setGalleryModalTitle(productName);
            setGalleryModalInitialIndex(0);
            setIsGalleryModalOpen(true);
          }
        }
      } else {
        console.log(`ℹ️ No product ID found, using main image only`);
        
        // No product ID, just show the main image
        if (galleryImages.length > 0) {
          setGalleryModalImages(galleryImages);
          setGalleryModalTitle(productName);
          setGalleryModalInitialIndex(0);
          setIsGalleryModalOpen(true);
        }
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Error in handleProductClick:", error);
      setLoading(false);
      
      // Show error message to user or fallback behavior
      if (product.src) {
        setGalleryModalImages([product.src]);
        setGalleryModalTitle(product.title || 'Product Gallery');
        setGalleryModalInitialIndex(0);
        setIsGalleryModalOpen(true);
      }
    }
  };

  // Close gallery modal
  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
    setGalleryModalImages([]);
    setGalleryModalTitle('');
    setGalleryModalInitialIndex(0);
  };
  
  // Get currently visible products based on active category
  const getVisibleProducts = () => {
    // Debug info to help trace filtering issues
    console.log('Getting visible products for category:', activeCategory);
    
    // Ensure we're working with arrays to prevent errors
    const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
    
    // Handle special categories
    if (activeCategory === 'all') {
      console.log(`Showing all products: ${safeAllProducts.length} items`);
      return safeAllProducts;
    }
    
    if (activeCategory === 'featured') {
      const featuredProducts = safeAllProducts.filter(p => p && p.featured);
      console.log(`Showing featured products: ${featuredProducts.length} items`);
      return featuredProducts;
    }
    
    // Get the category details for better matching
    const categoryDetails = categories.find(cat => cat.id === activeCategory);
    const categoryName = categoryDetails ? categoryDetails.name : '';
    
    // For normal categories, check if we have products loaded in our category-specific cache
    if (products[activeCategory] && Array.isArray(products[activeCategory]) && products[activeCategory].length > 0) {
      console.log(`Using cached products for ${categoryName}: ${products[activeCategory].length} items`);
      return products[activeCategory];
    }
    
    // If no products are loaded yet for this category, try multiple matching strategies
    
    // 1. Try matching by category ID (most precise)
    const filteredById = safeAllProducts.filter(p => 
      p && p.data && (p.data.categoryId === activeCategory || 
      (p.data.category && p.data.category._id === activeCategory))
    );
    
    if (filteredById.length > 0) {
      console.log(`Found ${filteredById.length} products by ID match for ${categoryName}`);
      return filteredById;
    }
    
    // 2. Try matching by category name (next best)
    const filteredByName = safeAllProducts.filter(p => 
      p && p.category && categoryName &&
      (p.category.toLowerCase() === categoryName.toLowerCase() || 
       p.category.toLowerCase().includes(categoryName.toLowerCase()) ||
       categoryName.toLowerCase().includes(p.category.toLowerCase()))
    );
    
    if (filteredByName.length > 0) {
      console.log(`Found ${filteredByName.length} products by name match for ${categoryName}`);
      return filteredByName;
    }
    
    // 3. Try matching by activeCategory as fallback
    const filteredByActiveCategory = safeAllProducts.filter(p => 
      p && p.category && 
      (p.category.toLowerCase() === activeCategory.toLowerCase() || 
       p.category.toLowerCase().includes(activeCategory.toLowerCase()))
    );
    
    if (filteredByActiveCategory.length > 0) {
      console.log(`Found ${filteredByActiveCategory.length} products by active category ID match`);
      return filteredByActiveCategory;
    }
    
    console.log(`No products found for category: ${activeCategory} (${categoryName})`);
    // Return empty array if no products match
    return [];
  };
  
  // Define a proper function to update images globally
  const updateGalleryImages = (images) => {
    if (Array.isArray(images) && images.length > 0) {
      // Set the images in our state
      setProductDetailImages(images);
      
      // Set the global variable for the lightbox to access
      window.galleryProductImages = images;
      
      // Directly update the images in the lightbox component
      // This ensures the most up-to-date images are available when opening the lightbox
      try {
        // Force an update of the LightboxGallery component
        const lightboxContainer = document.getElementById('gallery-lightbox-container');
        if (lightboxContainer) {
          console.log("Triggering lightbox component update with new images");
          // Trigger custom event to notify components that might be listening
          const event = new CustomEvent('galleryImagesUpdated', { 
            detail: { 
              images,
              timestamp: new Date().getTime() // Add timestamp to ensure event is unique
            }
          });
          lightboxContainer.dispatchEvent(event);
          window.dispatchEvent(event);
        }
      } catch (e) {
        console.error("Error updating lightbox container:", e);
      }
      
      console.log("GLOBAL UPDATE: Gallery images updated with", images.length, "images");
    }
  };
  
  // Testimonial navigation functions
  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Get current testimonial
  const currentTestimonial = testimonials[currentTestimonialIndex];

  // Auto-advance testimonials every 8 seconds
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle initial load completion for better UX
  useEffect(() => {
    if (allProducts.length > 0 && initialLoad) {
      setInitialLoad(false);
    }
  }, [allProducts, initialLoad]);
  
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 sm:p-10 rounded-xl shadow-xl max-w-md mx-auto">
          <div className="relative h-20 w-20 mx-auto mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-[3px] border-primary/20 border-t-primary absolute inset-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaImages className="w-8 h-8 text-primary/70 animate-pulse" />
            </div>
          </div>
          <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-3">Loading Gallery</h3>
          <p className="text-gray-600 mb-4">Preparing high-quality images for your viewing pleasure...</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          
          {/* Enhanced loading indicators */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="mt-6 text-xs text-gray-400">
            Loading products from all categories...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 sm:p-10 rounded-xl shadow-xl max-w-md mx-auto border border-red-100">
          <div className="bg-red-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
            <FaExclamationTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-3">Gallery Error</h3>
          <p className="text-gray-600 mb-6">{error || 'There was a problem loading the gallery. Please try again.'}</p>
          <button 
            onClick={() => {
              setRetryCount(prev => prev + 1);
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Professional Hero Section */}
      <GalleryHero 
        title={config.title} 
        subtitle={config.subtitle} 
        heroImage={config.heroImage || '/images/gallery-hero-bg.jpg'}
        stats={config.showStats ? stats : null}
      />

      {/* Enhanced Professional Filters and Controls */}
      {config.showFilters && (
        <motion.section 
          className="bg-white py-3 sm:py-5 border-b border-gray-200 sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-white/95"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="container mx-auto px-3 sm:px-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-5">
              {/* Filter Label with Improved Mobile Layout */}
              <div className="w-full flex items-center justify-between mb-2 md:hidden">
                <div className="flex items-center">
                  <button 
                    className="flex items-center px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 
                      transition-colors text-sm font-medium text-gray-700"
                    onClick={() => document.getElementById('mobile-filters').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <FaFilter className="mr-2 w-3 h-3 text-primary" /> 
                    <span className="tracking-wide">Browse Gallery</span>
                  </button>
                </div>
                
                {/* Enhanced View Mode Toggle - Better Touch Target */}
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                    }`}
                    title="Grid View"
                    aria-label="Grid View"
                  >
                    <FaThLarge className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                    }`}
                    title="List View"
                    aria-label="List View"
                  >
                    <FaList className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Improved Scrollable Filter Buttons with Enhanced Mobile Experience */}
              <div id="mobile-filters" className="w-full overflow-x-auto py-1 md:pb-0 hide-scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="flex gap-2 md:gap-3 md:flex-wrap min-w-max md:min-w-0 px-0.5 md:px-0 filter-buttons-container">
                  <motion.button
                    onClick={() => handleFilterClick('all')}
                    className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium 
                      transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-primary/60 category-filter-button ${
                      activeCategory === 'all'
                        ? 'bg-primary text-white shadow-md active'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    All Products
                    {activeCategory === 'all' && <span className="filter-active-indicator"></span>}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleFilterClick('featured')}
                    className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium 
                      transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-primary/60 flex items-center gap-1.5 category-filter-button ${
                      activeCategory === 'featured'
                        ? 'bg-primary text-white shadow-md active'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaStar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Featured
                    {activeCategory === 'featured' && <span className="filter-active-indicator"></span>}
                  </motion.button>
                  
                  {/* Database Categories + Custom Projects - Skip 'all' and 'featured' since they're already shown above */}
                  {categories
                    .filter(category => category.id !== 'all' && category.id !== 'featured')
                    .map((category, index) => (
                    <motion.button
                      key={category.id}
                      onClick={() => handleFilterClick(category.id)}
                      className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium 
                        transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2
                        focus:ring-offset-2 focus:ring-primary/60 category-filter-button ${
                        activeCategory === category.id
                          ? 'bg-primary text-white shadow-md active'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.3 }}
                      data-category-id={category.id}
                      data-category-name={category.name}
                    >
                      {category.name}
                      {activeCategory === category.id && <span className="filter-active-indicator"></span> }
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle - Desktop Only */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                  }`}
                  title="Grid View"
                  aria-label="Switch to grid view"
                >
                  <FaThLarge className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                  }`}
                  title="List View"
                  aria-label="Switch to list view"
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Professional Products Gallery Display */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* Products Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded w-full mb-3 animate-pulse"></div>
                      <div className="h-8 bg-primary/20 rounded animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-red-50 rounded-xl p-8 max-w-md mx-auto border border-red-100">
                  <FaExclamationTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Gallery</h3>
                  <p className="text-red-600 mb-6">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FaSync className="inline-block mr-2" />
                    Retry Loading
                  </button>
                </div>
              </motion.div>
            ) : getVisibleProducts().length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto border border-gray-100">
                  <FaImages className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                  <p className="text-gray-500 mb-6">
                    {activeCategory === 'all' 
                      ? 'No products available in the gallery.' 
                      : <>
                          No products found in the <span className="font-semibold">{
                            categories.find(c => c.id === activeCategory)?.name || activeCategory
                          }</span> category.
                        </>
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button 
                      onClick={() => handleFilterClick('all')}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      View All Products
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <FaSync className="inline-block mr-2 w-3 h-3" />
                      Refresh Page
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={animations.container}
                initial="hidden"
                animate="visible"
              >
                {getVisibleProducts().map((product, index) => (
                  <motion.div
                    key={product.id || index}
                    variants={animations.item}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {/* Category Badge - Top Left */}
                      {(product.category || product.description) && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-block px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                            {product.category || product.description}
                          </span>
                        </div>
                      )}
                      
                      {product.src ? (
                        <img
                          src={product.src}
                          alt={product.alt || product.title || 'Product Image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaImages className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Overlay with Hover Effect */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <FaEye className="w-8 h-8 mx-auto mb-2" />
                          <span className="font-medium">View Images</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {product.title || product.name || 'Product'}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More Button (if needed) */}
          {getVisibleProducts().length > 0 && getVisibleProducts().length >= 12 && (
            <div className="text-center mt-12">
              <button
                onClick={() => {
                  // Implement load more functionality if needed
                  console.log('Load more products');
                }}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Gallery Footer Section */}
      <section className="pt-12 sm:pt-16 pb-14 sm:pb-20 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-primary/5 pattern-dots"></div>
        
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Top Section with Stats */}
            <div className="bg-white rounded-xl shadow-xl p-0 mb-10 sm:mb-12 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-100 to-white px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
                <div className="text-center mb-6 sm:mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block rounded-lg bg-primary/10 px-4 py-2 mb-3"
                  >
                    <h4 className="text-primary font-medium text-sm sm:text-base">Gallery Highlights</h4>
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3"
                  >
                    Bringing Your Vision to Life
                  </motion.h2>
                  <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-5"></div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-gray-600 sm:text-lg max-w-2xl mx-auto"
                  >
                    Explore our extensive collection and discover how we can transform your space with our premium craftsmanship.
                  </motion.p>
                </div>
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7 my-6 px-6 sm:px-8 md:px-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80"
                >
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaImages className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.totalImages}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Total Products</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80"
                >
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaHeart className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                    {stats.featuredProducts}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Featured Products</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80"
                >
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaThLarge className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.totalCategories}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Categories</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80"
                >
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaEye className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Satisfaction</div>
                </motion.div>
              </div>
              
              {/* CTA Buttons with Enhanced Design */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-5 mt-6 sm:mt-8 mb-4 sm:mb-6">
                <a href="/contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/contact';
                    scrollToTop({ instant: true });
                  }}
                  className="w-4/5 sm:w-auto bg-primary hover:bg-primary-dark text-white text-center font-medium sm:font-semibold px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-primary/30 flex items-center justify-center gap-2 group"
                >
                  <span>Start Your Project</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                
                <a href="/products"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/products';
                    scrollToTop({ instant: true });
                  }}
                  className="w-4/5 sm:w-auto bg-white hover:bg-gray-50 text-gray-800 text-center font-medium sm:font-semibold px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow border border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-gray-200 flex items-center justify-center gap-2"
                >
                  <span>Browse Products</span>
                </a>
              </div>
            </div>
            
            {/* Customer Testimonials Section */}
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 mt-6 sm:mt-8 border border-gray-100">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 mb-2 sm:mb-3">
                  <h4 className="text-primary font-medium text-xs sm:text-sm md:text-base">Customer Testimonials</h4>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  What Our Customers Say
                </h3>
                <div className="w-12 sm:w-16 h-1 bg-accent mx-auto rounded-full mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-2">
                  Hear what our satisfied customers have to say about their experience with us.
                </p>
              </div>
              
              <motion.div className="relative overflow-hidden">
                <div className="flex flex-col lg:flex-row bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-inner overflow-hidden">
                  {/* Left Column - Testimonial Info */}
                  <div className="lg:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center max-w-xs">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-md mb-4 sm:mb-5 transform hover:scale-105 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"></path>
                        </svg>
                      </div>
                      
                      <h4 className="font-bold text-base sm:text-lg lg:text-xl text-gray-800 mb-2 sm:mb-3">Client Feedback</h4>
                      <div className="w-10 sm:w-12 h-1 bg-primary/30 mx-auto rounded-full mb-3 sm:mb-4"></div>
                      
                      <div className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 font-medium">
                        {currentTestimonialIndex + 1} of {testimonials.length}
                      </div>
                      
                      {/* Navigation Indicators */}
                      <div className="flex justify-center gap-1 sm:gap-1.5 mt-4 sm:mt-6 mb-2">
                        {testimonials.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTestimonialIndex(index)}
                            className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 transform ${
                              index === currentTestimonialIndex 
                                ? 'bg-primary scale-125 w-4 sm:w-5' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                          />
                        ))}
                      </div>

                      {/* Mobile Navigation Buttons */}
                      <div className="flex justify-center gap-2 mt-4 lg:hidden">
                        <button
                          onClick={() => setCurrentTestimonialIndex(prev => (prev > 0 ? prev - 1 : testimonials.length - 1))}
                          className="p-2 rounded-lg bg-white/80 hover:bg-white text-primary shadow-sm hover:shadow transition-all"
                          aria-label="Previous testimonial"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentTestimonialIndex(prev => (prev < testimonials.length - 1 ? prev + 1 : 0))}
                          className="p-2 rounded-lg bg-white/80 hover:bg-white text-primary shadow-sm hover:shadow transition-all"
                          aria-label="Next testimonial"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Testimonial Content */}
                  <div className="lg:w-2/3 p-4 sm:p-6 lg:p-8 flex items-center">
                    <div className="w-full">
                      <blockquote className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed italic mb-4 sm:mb-6 min-h-[4rem] sm:min-h-[5rem] relative">
                        <div className="absolute -top-2 -left-2 text-primary/20 text-4xl sm:text-5xl font-serif">"</div>
                        <div className="pl-3 sm:pl-4">{testimonials[currentTestimonialIndex].text}</div>
                        <div className="absolute -bottom-4 sm:-bottom-6 right-0 text-primary/20 text-4xl sm:text-5xl font-serif">"</div>
                      </blockquote>
                      
                      <div className="flex items-center mt-6 sm:mt-8 border-t border-gray-200 pt-3 sm:pt-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-md">
                          <span className="font-bold text-white text-base sm:text-lg">{testimonials[currentTestimonialIndex].initials}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonials[currentTestimonialIndex].name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{testimonials[currentTestimonialIndex].location}</p>
                          {testimonials[currentTestimonialIndex].productPurchased && (
                            <p className="text-xs text-primary/80 mt-0.5 sm:mt-1">Purchased: {testimonials[currentTestimonialIndex].productPurchased}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Browse Categories Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mt-8 sm:mt-10 border border-gray-100">
              <div className="text-center mb-6">
                <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 mb-3">
                  <h4 className="text-primary font-medium text-sm sm:text-base">Browse Categories</h4>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  Explore Our Gallery Categories
                </h3>
                <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-8">
                  Browse through our categories to find products tailored to your specific needs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 max-w-5xl mx-auto">
                <button 
                  onClick={() => handleFilterClick('all')}
                  className="group"
                >
                  <div className="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 
                    bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-primary/20 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-inner group-hover:from-primary/30 group-hover:to-primary/20 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                      <FaImages className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-lg font-semibold text-gray-800 group-hover:text-primary transition-all duration-200">
                        All Products
                      </span>
                      <span className="text-xs text-gray-500">View our complete collection</span>
                    </div>
                    <FaAngleRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
                
                <button 
                  onClick={() => handleFilterClick('featured')}
                  className="group"
                >
                  <div className="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 
                    bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-primary/20 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-300/10 text-yellow-500 shadow-inner group-hover:from-yellow-400/30 group-hover:to-yellow-300/20 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                      <FaStar className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-lg font-semibold text-gray-800 group-hover:text-primary transition-all duration-200">
                        Featured
                      </span>
                      <span className="text-xs text-gray-500">Our most popular items</span>
                    </div>
                    <FaAngleRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
                
                {categories.map(category => (
                  <button 
                    key={category.id}
                    onClick={() => handleFilterClick(category.id)}
                    className="group"
                  >
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 
                      bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-primary/20 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-inner group-hover:from-primary/30 group-hover:to-primary/20 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                        <FaThLarge className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-lg font-semibold text-gray-800 group-hover:text-primary transition-all duration-200">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-500">Browse this collection</span>
                      </div>
                      <FaAngleRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Professional Gallery Modal for image-only viewing */}
      <ProfessionalGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={closeGalleryModal}
        images={galleryModalImages}
        initialIndex={galleryModalInitialIndex}
        productName={galleryModalTitle}
      />
    </div>
  );
};

export default GalleryPage;
