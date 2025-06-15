import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaExpand, FaSearchPlus, FaTimes, FaArrowLeft, FaInfoCircle, FaShare } from 'react-icons/fa';
import { productAPI } from '../services/api';
import { scrollToTop } from '../utils/scrollUtils';
import ImageService from '../services/imageService';
import OptimizedImage from '../components/common/OptimizedImage';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchPosition, setTouchPosition] = useState(null);
  const [fullScreenView, setFullScreenView] = useState(false);
  const imageContainerRef = useRef(null);

  // Get all available images with optimization
  const allImages = useMemo(() => {
    let images = [];
    
    // Get product images
    if (product?.images?.length > 0) {
      images = product.images
        .filter(img => img && typeof img === 'string')
        .map(img => ImageService.getOptimizedImageUrl(img, {
          category: product.category,
          width: 800,
          height: 800
        }));
    }
    
    // Add main image if not already included
    if (product?.image && typeof product.image === 'string') {
      const optimizedMainImage = ImageService.getOptimizedImageUrl(product.image, {
        category: product.category,
        width: 800,
        height: 800
      });
      if (!images.includes(optimizedMainImage)) {
        images.unshift(optimizedMainImage);
      }
    }
    
    // Ensure we have at least 4 images for consistent UI
    const placeholder = ImageService.getPlaceholderImage(product?.category);
    while (images.length < 4) {
      images.push(placeholder);
    }
    
    return images.slice(0, 4);
  }, [product]);
  
  // Debug: Log image loading issues
  useEffect(() => {
    if (allImages.length === 0) {
      console.warn('No images available for product:', product?.id);
    } else {
      console.log('Available images:', allImages.length);
      console.log('Image URLs:', allImages);
    }
  }, [allImages, product?.id]);
  
  // Preload all images when component mounts for smoother experience
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = allImages.slice(0, 4).map(src => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => {
              console.warn(`Failed to load image: ${src}`);
              // Try loading the first default image instead
              img.src = defaultImages[0];
            };
            img.src = src;
          });
        });

        await Promise.all(imagePromises);
        console.log('All thumbnail images preloaded successfully');
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();
  }, [allImages]);
  
  // Add keyboard navigation and scroll management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        // Previous image with left arrow key
        const newIndex = selectedImageIndex > 0 
          ? selectedImageIndex - 1 
          : allImages.length - 1;
        setImageLoading(true);
        setSelectedImageIndex(newIndex);
      } else if (e.key === 'ArrowRight') {
        // Next image with right arrow key
        const newIndex = selectedImageIndex < allImages.length - 1 
          ? selectedImageIndex + 1 
          : 0;
        setImageLoading(true);
        setSelectedImageIndex(newIndex);
      } else if (e.key === 'Escape') {
        // Exit zoom mode with Escape key
        if (isZoomed) {
          setIsZoomed(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Use our enhanced utility function to scroll to top when loading a new product
    scrollToTop({ instant: true });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, allImages.length, isZoomed]);
  
  // Add scroll restoration on image change or zoom
  useEffect(() => {
    // Save scroll position before image change
    const scrollPosition = window.scrollY;
    
    // Restore scroll position after image loads
    if (!imageLoading) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 100);
    }
  }, [selectedImageIndex, imageLoading]);

  // Handle thumbnail click - enhanced for better performance and UX
  const handleThumbnailClick = (index) => {
    // Make sure the index is valid for our array
    const safeIndex = Math.min(Math.max(0, index), allImages.length - 1);
    
    // Only change if selecting a different image
    if (safeIndex !== selectedImageIndex) {
      // Pre-load image before showing loading state
      const img = new Image();
      img.src = allImages[safeIndex];
      
      // If image is already in cache, don't show loading state
      if (img.complete) {
        setSelectedImageIndex(safeIndex);
      } else {
        setImageLoading(true);
        img.onload = () => {
          setSelectedImageIndex(safeIndex);
          setImageLoading(false);
        };
        img.onerror = () => {
          setSelectedImageIndex(safeIndex);
          setImageLoading(false);
        };
      }
    }
  };
  
  // Navigate to previous image with animation
  const handlePrevImage = () => {
    const newIndex = selectedImageIndex > 0 
      ? selectedImageIndex - 1 
      : allImages.length - 1;
    setImageLoading(true);
    setSelectedImageIndex(newIndex);
  };
  
  // Navigate to next image with animation
  const handleNextImage = () => {
    const newIndex = selectedImageIndex < allImages.length - 1 
      ? selectedImageIndex + 1 
      : 0;
    setImageLoading(true);
    setSelectedImageIndex(newIndex);
  };
  
  // Enhanced image zoom functionality with better UX
  const handleImageZoom = () => {
    setIsZoomed(!isZoomed);
  };
  
  const handleMouseMove = (e) => {
    if (!isZoomed || !imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate position percentage with boundaries
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    setZoomPosition({ x, y });
  };
  
  const handleMouseLeave = () => {
    if (isZoomed) {
      setIsZoomed(false);
    }
  };
  
  // Handle touch events for better mobile support
  const handleTouchStart = (e) => {
    // Store the initial touch position for swipe detection
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchMove = (e) => {
    // Skip if no initial position is set
    if (!touchPosition) return;
    
    const touch = e.touches[0];
    const diffX = touchPosition.x - touch.clientX;
    const diffY = touchPosition.y - touch.clientY;
    
    // If horizontal swipe is more significant than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) {
        // Swipe left, show next image
        handleNextImage();
      } else {
        // Swipe right, show previous image
        handlePrevImage();
      }
      // Reset touch position after handling swipe
      setTouchPosition(null);
    }
  };
  
  const handleTouchEnd = () => {
    // Clear the touch position
    setTouchPosition(null);
  };

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(productId);
        setProduct(response.data);
        setLoading(false);
        // Ensure we scroll to top when product loads, using our enhanced utility
        scrollToTop({ instant: true });
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again.');
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Add a function to handle the "Back to Products" button click
  const handleBackToProducts = (e) => {
    e.preventDefault();
    navigate('/products');
    scrollToTop({ instant: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary hover:text-primary-dark">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen mobile-viewport mobile-scroll-smooth py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">
      {/* Mobile Bottom Action Bar - Visible on small screens only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Price</span>
            <span className="font-bold text-primary">NPR {product.price?.toLocaleString()}</span>
          </div>
          
          <a
            href={`https://wa.me/9779824336371?text=I'm interested in ${encodeURIComponent(product.name)}. Please provide more information.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 ml-3 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Inquire Now
          </a>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb - Enhanced for better visibility */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center flex-wrap space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" onClick={handleBackToProducts} className="hover:text-primary transition-colors">Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-primary font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>
        </div>
        
        {/* Product category & quick actions */}
        <div className="flex flex-wrap items-center justify-between mb-4 bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="text-xs sm:text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-700">
              {product.category || "Furniture"}
            </div>
            {product.inStock !== false && (
              <div className="text-xs sm:text-sm px-2 py-1 bg-green-100 rounded-full text-green-700">
                In Stock
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <button 
              className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Share product"
            >
              <FaShare size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Product Images Section - Simplified and more user friendly */}
          <div className="space-y-4">
            {/* Main Product Image Viewer */}
            <div 
              className="relative rounded-lg overflow-hidden bg-white shadow-md"
              ref={imageContainerRef}
            >
              {/* Back button for mobile - always visible */}
              <Link
                to="/products"
                onClick={handleBackToProducts}
                className="absolute top-4 left-4 z-20 flex items-center justify-center bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full w-10 h-10 shadow-md transition-all duration-200"
              >
                <FaArrowLeft className="text-gray-700" />
              </Link>
              
              {/* Main image display area with touch support */}
              <div 
                className="relative w-full aspect-square bg-gray-50 flex items-center justify-center touch-manipulation"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Previous button - always visible on mobile */}
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-md z-10 opacity-75 hover:opacity-100 transition-all duration-200"
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="text-gray-700 text-xl" />
                </button>
                
                {/* Next button - always visible on mobile */}
                <button 
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-md z-10 opacity-75 hover:opacity-100 transition-all duration-200"
                  aria-label="Next image"
                >
                  <FaChevronRight className="text-gray-700 text-xl" />
                </button>
                
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-opacity-40 border-t-primary"></div>
                  </div>
                )}
                
                {/* Main product image */}
                <OptimizedImage
                  src={allImages[selectedImageIndex]}
                  alt={ImageService.getImageAlt(product) || "Product Image"}
                  category={product?.category}
                  size="large"
                  className={`w-full h-full transition-all duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'} ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                  onLoad={() => setImageLoading(false)}
                  onClick={handleImageZoom}
                  lazy={false}
                />
                
                {/* Image counter badge - fixed to always show "1/4" format */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full flex items-center space-x-1">
                  <span className="font-medium">{selectedImageIndex + 1}</span>
                  <span>/</span> 
                  <span>4</span>
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  {/* Zoom button */}
                  <button 
                    onClick={handleImageZoom} 
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-200"
                    aria-label={isZoomed ? "Exit zoom" : "Zoom image"}
                  >
                    {isZoomed ? <FaTimes className="text-gray-700" /> : <FaSearchPlus className="text-gray-700" />}
                  </button>
                </div>
                
                {/* Tap to zoom hint for mobile - disappears after first use */}
                <div className="absolute inset-x-0 bottom-16 flex justify-center pointer-events-none">
                  <div className="bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full flex items-center">
                    <FaInfoCircle className="mr-1" /> Tap image to zoom
                  </div>
                </div>
              </div>
              
              {/* Thumbnail strip - exactly 4 different thumbnails when possible */}
              <div className="bg-white w-full flex justify-center p-2 border-t border-gray-100">
                <div className="flex space-x-3 justify-center overflow-x-auto max-w-full no-scrollbar py-2">
                  {(() => {
                    // Create an array of unique image indices to use - ALWAYS showing exactly 4 thumbnails
                    let imageIndices = [];
                    
                    // Case 1: We have at least 4 images - use the first 4 unique ones
                    if (allImages.length >= 4) {
                      imageIndices = [0, 1, 2, 3];
                    } 
                    // Case 2: We have 3 images - use all 3 plus a variant of the first image
                    else if (allImages.length === 3) {
                      imageIndices = [0, 1, 2, 'v0-1']; // 3 real images + 1 variant
                    }
                    // Case 3: We have 2 images - use both plus variants of each
                    else if (allImages.length === 2) {
                      imageIndices = [0, 1, 'v0-1', 'v1-1']; // 2 real images + 2 variants
                    }
                    // Case 4: We have 1 image - use it plus three different variants
                    else if (allImages.length === 1) {
                      imageIndices = [0, 'v0-1', 'v0-2', 'v0-3']; // 1 real image + 3 variants
                    }
                    // Case 5: No real images - use 4 default images or variants
                    else {
                      imageIndices = ['d0', 'd1', 'd2', 'd3']; // Use all 4 default images
                    }
                    
                    return imageIndices.map((indexKey, displayIndex) => {
                      // Determine the image URL and other properties based on the index key
                      let imageUrl;
                      let imageIndex;
                      let isPlaceholder = false;
                      let variantStyle = {};
                      let variantClass = '';
                      
                      if (typeof indexKey === 'number') {
                        // Regular number index - direct image from allImages array
                        imageUrl = allImages[indexKey];
                        imageIndex = indexKey;
                      } 
                      else if (typeof indexKey === 'string' && indexKey.startsWith('v')) {
                        // Variant of a real image: v0-1, v0-2, etc.
                        const parts = indexKey.substring(1).split('-');
                        const baseIndex = parseInt(parts[0], 10);
                        const variantNum = parseInt(parts[1], 10);
                        
                        // Make sure we have a valid base image to work with
                        const availableImages = allImages.length > 0 ? allImages : defaultImages;
                        const safeBaseIndex = baseIndex % availableImages.length;
                        
                        // For variants, try to use a different real image if available
                        if (allImages.length >= 2) {
                          // When we have multiple images, use different ones for variants
                          const rotatedIndex = (safeBaseIndex + variantNum) % allImages.length;
                          imageUrl = allImages[rotatedIndex];
                          imageIndex = rotatedIndex;
                        } else {
                          // When we only have one image or none, use the default image with styling
                          imageUrl = availableImages[safeBaseIndex];
                          imageIndex = 0;
                        }
                        
                        // Apply visual variations based on position
                        isPlaceholder = false;
                        switch (variantNum) {
                          case 1:
                            variantStyle = { filter: 'brightness(1.1) contrast(1.1)' };
                            variantClass = 'object-cover scale-110';
                            break;
                          case 2:
                            variantStyle = { filter: 'sepia(0.3) brightness(1.05)' };
                            variantClass = 'object-cover scale-105 rotate-1';
                            break;
                          case 3:
                            variantStyle = { filter: 'hue-rotate(5deg) brightness(1.05)' };
                            variantClass = 'object-cover scale-110 -rotate-1';
                            break;
                          default:
                            variantStyle = {};
                            variantClass = 'object-cover';
                        }
                        
                        // Add visual differentiation through CSS classes
                        switch(variantNum) {
                          case 1: variantClass = 'object-cover scale-110'; break;
                          case 2: variantClass = 'object-contain rotate-5'; break;
                          case 3: variantClass = 'object-cover scale-125'; break;
                          default: variantClass = '';
                        }
                      }
                      else if (typeof indexKey === 'string' && indexKey.startsWith('d')) {
                        // Default image: d0, d1, d2, d3
                        const index = parseInt(indexKey.substring(1), 10);
                        const safeIndex = index % defaultImages.length;
                        
                        // Always use a valid default image
                        imageUrl = defaultImages[safeIndex];
                        imageIndex = 0; // Default to first image position
                        
                        // Apply different styles to make default images look unique
                        switch (index % 4) {
                          case 0:
                            variantStyle = { filter: 'none' };
                            variantClass = 'object-cover';
                            break;
                          case 1:
                            variantStyle = { filter: 'brightness(1.1) contrast(1.1)' };
                            variantClass = 'object-cover scale-110';
                            break;
                          case 2:
                            variantStyle = { filter: 'sepia(0.2) brightness(1.05)' };
                            variantClass = 'object-cover scale-105 rotate-1';
                            break;
                          case 3:
                            variantStyle = { filter: 'brightness(0.95) contrast(1.1)' };
                            variantClass = 'object-cover scale-110 -rotate-1';
                            break;
                        }
                        
                        isPlaceholder = false;
                        
                        // Apply different styles to make default images look visually distinct
                        variantStyle = getPlaceholderStyle(index % 4 + 1);
                        
                        // Add visual differentiation
                        switch(index % 4) {
                          case 0: variantClass = 'object-contain'; break;
                          case 1: variantClass = 'object-cover'; break;
                          case 2: variantClass = 'object-cover scale-110'; break;
                          case 3: variantClass = 'object-contain scale-90 rotate-2'; break;
                          default: variantClass = 'object-cover';
                        }
                      }
                      
                      return (
                        <button
                          key={`thumb-${displayIndex}`}
                          onClick={() => handleThumbnailClick(imageIndex)}
                          className={`flex-shrink-0 w-16 h-16 rounded-md transition-all duration-200 ${
                            selectedImageIndex === imageIndex
                              ? 'ring-2 ring-primary scale-105 shadow-md' 
                              : 'ring-1 ring-gray-200 hover:opacity-100 hover:shadow-sm hover:scale-105'
                          }`}
                          aria-label={`View product image ${displayIndex + 1}`}
                        >
                          <div className="w-full h-full overflow-hidden rounded-md relative bg-gray-50">
                            {/* Background color added for visibility */}
                            <OptimizedImage
                              src={imageUrl}
                              alt={`Product view ${displayIndex + 1}`}
                              category={product?.category}
                              size="small"
                              className={`w-full h-full ${variantClass}`}
                              style={variantStyle}
                              onLoad={() => {
                                console.log("Image loaded:", imageUrl);
                                // Clear loading state when image loads
                                if (displayIndex === selectedImageIndex) {
                                  setImageLoading(false);
                                }
                              }}
                              lazy={false}
                            />
                            {selectedImageIndex === imageIndex && (
                              <div className="absolute inset-0 border-2 border-primary rounded-md"></div>
                            )}
                            {/* Always visible number indicator */}
                            <div className="absolute bottom-0 right-0 bg-white bg-opacity-70 px-1 text-xs font-medium text-gray-800">
                              {displayIndex + 1}
                            </div>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section - Enhanced for better UX */}
          <div className="space-y-6">
            {/* Product header with price */}
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <div className="hidden sm:flex items-center space-x-2">
                  <Link 
                    to="/products"
                    className="flex items-center text-sm text-gray-600 hover:text-primary"
                  >
                    <FaArrowLeft className="mr-1" /> Back to Products
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between mt-2">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  NPR {product.price?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ID: {product._id}
                </div>
              </div>
            </div>
            
            {/* Product description - cleaner, more readable */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Description</h3>
              <p className="text-gray-600 text-base leading-relaxed">{product.description}</p>
            </div>
            
            {/* Key features with visual enhancements */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-primary bg-opacity-10 text-primary p-1 rounded-full mr-2">
                    <FaInfoCircle />
                  </span>
                  Key Features
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Call to action buttons - enhanced for better visibility and mobile experience */}
            <div className="pt-3 space-y-3">
              <a
                href={`https://wa.me/9779824336371?text=I'm interested in ${encodeURIComponent(product.name)} (ID: ${product._id}). Please provide more information.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Inquire on WhatsApp
              </a>
              
              {/* Action buttons row */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link 
                  to="/products"
                  className="sm:w-1/2 flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Back to Products
                </Link>
                
                <Link 
                  to="/custom-order"
                  className="sm:w-1/2 flex items-center justify-center px-6 py-4 border border-primary rounded-lg shadow-sm text-base font-medium text-primary hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Request Customization
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Product Information - Accordion Style */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {/* Specifications Section */}
            <details className="group">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <h3 className="text-lg font-medium text-gray-800">Specifications</h3>
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                  </svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Material</span>
                    <span className="font-medium">{product.material || "Steel"}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Dimensions</span>
                    <span className="font-medium">{product.dimensions || "Contact for details"}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Finish</span>
                    <span className="font-medium">{product.finish || "Premium"}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Weight</span>
                    <span className="font-medium">{product.weight || "Varies by model"}</span>
                  </div>
                </div>
              </div>
            </details>
            
            {/* Delivery Information Section */}
            <details className="group">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <h3 className="text-lg font-medium text-gray-800">Delivery Information</h3>
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                  </svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-gray-600">
                <p className="mb-3">Delivery options and timeframes may vary based on your location and product availability.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">✓</span>
                    <span>Free delivery within Kathmandu Valley</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">✓</span>
                    <span>Installation services available</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">✓</span>
                    <span>Contact us for shipping to other locations</span>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
        
        {/* You might also like - Related Products */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              // Create an array of indices for different images to display
              const relatedIndices = [];
              const titles = [
                "Similar Style", 
                "You may like", 
                "Also consider", 
                "Popular choice"
              ];

              // Use the same approach as thumbnails for consistency
              // Case 1: We have at least 4 images - use the first 4 unique ones
              if (allImages.length >= 4) {
                relatedIndices.push(0, 1, 2, 3);
              } 
              // Case 2: We have 3 images - use all 3 plus a variant of the first image
              else if (allImages.length === 3) {
                relatedIndices.push(0, 1, 2, 'v0-1'); // 3 real images + 1 variant
              }
              // Case 3: We have 2 images - use both plus variants of each
              else if (allImages.length === 2) {
                relatedIndices.push(0, 1, 'v0-1', 'v1-1'); // 2 real images + 2 variants
              }
              // Case 4: We have 1 image - use it plus three different variants
              else if (allImages.length === 1) {
                relatedIndices.push(0, 'v0-1', 'v0-2', 'v0-3'); // 1 real image + 3 variants
              }
              // Case 5: No real images - use 4 default images or variants
              else {
                relatedIndices.push('d0', 'd1', 'd2', 'd3'); // Use all 4 default images
              }
              
              return relatedIndices.map((indexKey, displayIndex) => {
                // Determine the image URL and other properties based on the index key
                let imageUrl;
                let isPlaceholder = false;
                let variantStyle = {};
                let variantClass = '';
                
                if (typeof indexKey === 'number') {
                  // Regular number index - direct image from allImages array
                  imageUrl = allImages[indexKey];
                } 
                else if (typeof indexKey === 'string' && indexKey.startsWith('v')) {
                  // Variant of a real image: v0-1, v0-2, etc.
                  const parts = indexKey.substring(1).split('-');
                  const baseIndex = parseInt(parts[0], 10);
                  const variantNum = parseInt(parts[1], 10);
                  
                  // Make sure baseIndex is valid
                  const safeBaseIndex = baseIndex < allImages.length ? baseIndex : 0;
                  
                  // Use a different image for each position when possible
                  if (allImages.length >= 2) {
                    // When we have at least 2 images, select a different one for each position
                    const rotatedIndex = (safeBaseIndex + variantNum) % allImages.length;
                    imageUrl = allImages[rotatedIndex];
                  } else {
                    // When we only have 1 image, use it with visual variations
                    imageUrl = allImages[safeBaseIndex];
                  }
                  
                  isPlaceholder = false; // These are real images with style variations
                  variantStyle = getPlaceholderStyle(variantNum);
                  
                  // Add visual differentiation through CSS classes
                  switch(variantNum) {
                    case 1: variantClass = 'object-cover scale-110'; break;
                    case 2: variantClass = 'object-contain rotate-3'; break;
                    case 3: variantClass = 'object-cover scale-125'; break;
                    default: variantClass = '';
                  }
                }
                else if (typeof indexKey === 'string' && indexKey.startsWith('d')) {
                  // Default image: d0, d1, d2, d3
                  // Extract the index number from d0, d1, etc.
                  const index = parseInt(indexKey.substring(1), 10);
                  // Use modulo to ensure we don't go out of bounds
                  const safeIndex = index % defaultImages.length;
                  
                  // Use the default image, but try to use a different one for each position
                  imageUrl = defaultImages[safeIndex];
                  
                  // For the related products section we want different thumbnails
                  isPlaceholder = false; // For UI purposes, don't show placeholder overlay
                  
                  // Apply different styles to make default images look visually distinct
                  variantStyle = getPlaceholderStyle(index % 4 + 1);
                  
                  // Add visual differentiation
                  switch(index % 4) {
                    case 0: variantClass = 'object-contain'; break;
                    case 1: variantClass = 'object-cover'; break;
                    case 2: variantClass = 'object-cover scale-110'; break;
                    case 3: variantClass = 'object-contain scale-90 rotate-2'; break;
                    default: variantClass = 'object-cover';
                  }
                }
                
                return (
                  <Link 
                    key={`related-${displayIndex}`}
                    to="/products" 
                    className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                      <OptimizedImage 
                        src={imageUrl} 
                        alt={`Related product - ${titles[displayIndex]}`}
                        category={product?.category}
                        size="small"
                        className={`w-full h-full group-hover:scale-105 transition-transform duration-300 ${variantClass}`}
                        style={variantStyle}
                        lazy={true}
                      />
                      {/* Use a more subtle indicator for different product suggestions */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-12 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                        <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                          {displayIndex + 1} / 4
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {titles[displayIndex]} {isPlaceholder ? '(similar)' : ''}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">View similar items</p>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
