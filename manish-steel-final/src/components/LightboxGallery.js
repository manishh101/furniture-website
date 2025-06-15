import React, { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import { FaPlay, FaImage, FaExpand, FaHeart } from 'react-icons/fa';
import GalleryCard from './GalleryCard';
import GalleryListItem from './GalleryListItem';

const LightboxGallery = ({ 
  images = [], 
  title,
  layout = 'grid', // 'grid', 'masonry', 'slider'
  columns = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  spacing = 'md', // 'sm', 'md', 'lg'
  showTitles = false,
  showDescriptions = false,
  aspectRatio = 'square', // 'square', 'landscape', 'portrait', 'auto'
  className = '',
  sectionClassName = '',
  onProductClick = null // Callback function when a product is clicked
}) => {
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      // Make sure images is an array before attempting to iterate
      if (!Array.isArray(images)) {
        console.error("Images prop is not an array:", images);
        return;
      }
      
      images.forEach((image, index) => {
        // Ensure the image is a valid object with a src property
        if (image && image.src && !loadedImages.has(index)) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${image.src}`);
          };
          img.src = image.src;
        }
      });
    };

    if (Array.isArray(images) && images.length > 0) {
      preloadImages();
    }
  }, [images, loadedImages]);
  
  // Listen for global events that should open the gallery
  useEffect(() => {
    // Function to handle the gallery open event
    const handleOpenGallery = (event) => {
      console.log("LightboxGallery: Received openGalleryLightbox event", event);
      if (event.detail && Array.isArray(event.detail.images)) {
        // Update our images with the ones from the event
        setProductImages(event.detail.images);
        // Open the lightbox
        setOpen(true);
      } else if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        // Try to use global images if event doesn't have them
        setProductImages(window.galleryProductImages);
        setOpen(true);
      }
    };
    
    // Listen for galleryImagesUpdated event that might contain updates
    const handleImagesUpdated = (event) => {
      console.log("LightboxGallery: Received galleryImagesUpdated event");
      if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        setProductImages(window.galleryProductImages);
      }
    };
    
    // Add event listeners
    window.addEventListener('openGalleryLightbox', handleOpenGallery);
    window.addEventListener('galleryImagesUpdated', handleImagesUpdated);
    
    // Clean up
    return () => {
      window.removeEventListener('openGalleryLightbox', handleOpenGallery);
      window.removeEventListener('galleryImagesUpdated', handleImagesUpdated);
    };
  }, []);

  const openLightbox = async (index) => {
    console.log(`Opening lightbox for image at index ${index}`);
    
    // Safety check for images array
    if (!Array.isArray(images) || images.length === 0 || !images[index]) {
      console.error("Invalid image index or empty images array", { index, imagesLength: images?.length });
      
      // Try to use global images if available
      if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        console.log("Using global gallery images instead");
        setProductImages(window.galleryProductImages);
        setPhotoIndex(0);
        setOpen(true);
        return;
      }
      
      console.error("Cannot open lightbox without valid images");
      return;
    }
    
    const product = images[index];
    setPhotoIndex(0); // Always start with the main image
    
    // Always have a default image ready for the lightbox
    const defaultImage = {
      src: product.src,
      alt: product.alt || product.title || "Product Image",
      title: product.title || "Product"
    };
    
    // Set the selected product
    setSelectedProduct(product);
    console.log("Selected product:", product);
    
    // Set default images first so lightbox has something to display
    setProductImages([defaultImage]);
    
    if (onProductClick) {
      // If the parent component provides a product click handler, use it
      try {
        console.log("Calling parent's onProductClick handler");
        // Call parent's handler that will fetch all product images
        await onProductClick(product);
        
        // Check if parent set the global variable
        if (window.galleryProductImages && window.galleryProductImages.length > 0) {
          console.log("Successfully received gallery images from parent handler:", window.galleryProductImages.length);
          setProductImages(window.galleryProductImages);
        } else {
          // Fallback to showing just the main image
          console.log("No gallery images received from parent, using default");
          setProductImages([defaultImage]);
        }
      } catch (error) {
        console.error("Error handling product click:", error);
        // Fallback to showing just the main image
        setProductImages([defaultImage]);
      }
    } else {
      // Default behavior - just show the single image
      console.log("No parent handler, showing single image");
      setProductImages([defaultImage]);
      window.galleryProductImages = [defaultImage];
    }
    
    // Make sure to open the lightbox after setting up images
    setTimeout(() => {
      console.log("Opening lightbox modal");
      console.log("LIGHTBOX STATE CHECK:", {
        globalImagesCount: window.galleryProductImages?.length || 0,
        productImagesCount: productImages?.length || 0
      });
      // Force the lightbox to use the latest images
      if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        setProductImages(window.galleryProductImages);
      }
      setOpen(true);
    }, 300); // Added longer delay to ensure images are ready
  };

  // Enhanced responsive column configuration for professional layout on all devices
  const getColumnClasses = () => {
    const { mobile, tablet, desktop, large } = columns;
    
    // Optimized for all device sizes with improved spacing
    // Very small mobile: 1 column for better visibility
    // Mobile: 2 columns (or custom value)
    // Tablets: Responsive grid based on orientation
    // Desktop & larger: More columns for better space utilization
    return `grid-cols-1 
            xs:grid-cols-${Math.max(mobile, 2)} 
            sm:grid-cols-${tablet} 
            md:grid-cols-${Math.min(tablet + 1, desktop)} 
            lg:grid-cols-${large}
            xl:grid-cols-${Math.min(large + 1, 6)}
            2xl:grid-cols-${Math.min(large + 2, 8)}`;
  };

  // Get spacing classes with tighter spacing on mobile
  const getSpacingClasses = () => {
    const spacingMap = {
      sm: 'gap-1 sm:gap-2',
      md: 'gap-2 sm:gap-4',
      lg: 'gap-3 sm:gap-6'
    };
    return spacingMap[spacing] || spacingMap.md;
  };

  // Get aspect ratio classes
  const getAspectRatioClasses = () => {
    const aspectMap = {
      square: 'aspect-square',
      landscape: 'aspect-video',
      portrait: 'aspect-[3/4]',
      auto: 'aspect-auto'
    };
    return aspectMap[aspectRatio] || aspectMap.square;
  };

  // Render professional image overlay with improved mobile experience
  const renderImageOverlay = (image, index) => (
    <div 
      className={`absolute inset-0 bg-black ${hoveredIndex === index ? 'bg-opacity-50' : 'bg-opacity-0'} 
        group-hover:bg-opacity-50 transition-all duration-300 flex flex-col items-center justify-center
        ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className={`transform ${hoveredIndex === index ? 'scale-100 opacity-100' : 'scale-90 opacity-0'} 
        group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 text-center px-3 sm:px-4`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(index);
          }}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-primary p-2.5 sm:p-3.5 
            rounded-full shadow-lg transition-all duration-200 hover:scale-110 mb-2 sm:mb-3
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
            active:scale-95 touch-manipulation"
          aria-label="View image in fullscreen"
        >
          <FaExpand className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        {(showTitles || showDescriptions) && (
          <div className="text-white text-center px-1 py-1 sm:py-2 bg-black bg-opacity-60 backdrop-blur-sm rounded-lg mt-2 max-w-[90%] mx-auto">
            {showTitles && image.title && (
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{image.title}</h3>
            )}
            {showDescriptions && image.description && (
              <p className="text-[10px] sm:text-xs opacity-90 line-clamp-2">{image.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced professional loading placeholder with progressive loading and skeleton UI
  const renderLoadingPlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-md overflow-hidden relative">
      {/* Animated shimmer effect */}
      <div className="absolute inset-0">
        <div className="animate-pulse flex flex-col justify-between h-full p-4">
          {/* Image placeholder */}
          <div className="w-full flex-grow bg-gray-300/50 rounded-md mb-4"></div>
          
          {/* Title placeholder */}
          <div className="h-4 w-4/5 bg-gray-300/60 rounded-full mb-2"></div>
          
          {/* Description placeholder */}
          <div className="h-3 w-3/5 bg-gray-300/60 rounded-full"></div>
        </div>
        
        {/* Shimmer animation overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
          bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
    </div>
  );

  // Handle masonry layout (if needed)
  const renderMasonryLayout = () => {
    // For now, fall back to grid - masonry would need additional library
    return renderGridLayout();
  };

  // Enhanced grid layout with professional aesthetics for all devices
  const renderGridLayout = () => (
    <div className={`grid ${getColumnClasses()} ${getSpacingClasses()}`}>
      {images.map((image, index) => (
        <div 
          key={`gallery-image-${image.id || image.src || index}`}
          className="group h-full"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <GalleryCard 
            product={image}
            isHovered={hoveredIndex === index}
            aspectRatio={aspectRatio}
            showDescription={showDescriptions}
            onClick={() => openLightbox(index)}
          />
        </div>
      ))}
    </div>
  );

  // Render list layout for products
  const renderListLayout = () => (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      {images.map((image, index) => (
        <div 
          key={`gallery-list-item-${image.id || image.src || index}`}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <GalleryListItem 
            product={image}
            showDescription={showDescriptions}
            onClick={() => openLightbox(index)}
          />
        </div>
      ))}
    </div>
  );
  
  // Render slider layout
  const renderSliderLayout = () => {
    // For now, fall back to grid - slider would need additional setup
    return renderGridLayout();
  };

  // Choose layout renderer
  const renderLayout = () => {
    switch (layout) {
      case 'masonry':
        return renderMasonryLayout();
      case 'slider':
        return renderSliderLayout();
      case 'list':
        return renderListLayout();
      default:
        return renderGridLayout();
    }
  };

  // Track when window.galleryProductImages changes
  const [galleryImageTimestamp, setGalleryImageTimestamp] = useState(0);
  const [globalProductImages, setGlobalProductImages] = useState([]);
  
  // Listen for custom event and check global variable
  useEffect(() => {
    const handleGalleryImagesUpdated = (event) => {
      console.log("LightboxGallery: Received galleryImagesUpdated event", event.detail?.images?.length);
      if (event.detail?.images) {
        setGlobalProductImages(event.detail.images);
        setGalleryImageTimestamp(Date.now());
      }
    };
    
    // Also check the global variable directly
    if (window.galleryProductImages && window.galleryProductImages.length > 0) {
      console.log("LightboxGallery: Found global galleryProductImages:", window.galleryProductImages.length);
      setGlobalProductImages(window.galleryProductImages);
      setGalleryImageTimestamp(Date.now());
    }
    
    // Add event listener
    window.addEventListener('galleryImagesUpdated', handleGalleryImagesUpdated);
    
    // Fallback polling (check every 300ms)
    const interval = setInterval(() => {
      if (window.galleryProductImages && 
          window.galleryProductImages.length > 0 && 
          (!globalProductImages.length || globalProductImages.length !== window.galleryProductImages.length)) {
        console.log("LightboxGallery: Detected gallery images update via polling:", window.galleryProductImages.length);
        setGlobalProductImages(window.galleryProductImages);
        setGalleryImageTimestamp(Date.now());
      }
    }, 300);
    
    return () => {
      window.removeEventListener('galleryImagesUpdated', handleGalleryImagesUpdated);
      clearInterval(interval);
    };
  }, [open, globalProductImages.length]);

  // Create safe slides data for lightbox
  const getSafeSlides = () => {
    try {
      // Count available images from all sources
      const availableImages = {
        global: window.galleryProductImages?.length || 0,
        component: productImages?.length || 0,
        gallery: images?.length || 0,
        timestamp: galleryImageTimestamp // Include timestamp to track changes
      };
      
      console.log("Preparing slides for lightbox:", { 
        selectedProduct: !!selectedProduct,
        availableImages
      });
      
      // First priority: Use our component state that's synchronized with global variable
      if (selectedProduct && globalProductImages && globalProductImages.length > 0) {
        console.log("Using globalProductImages from component state:", globalProductImages.length);
        
        // Extract unique images to avoid duplicates
        const uniqueUrls = new Set();
        const uniqueImages = [];
        
        globalProductImages.forEach((img, index) => {
          // Handle different image formats with robust fallbacks
          const imgSrc = typeof img === 'string' ? img : 
                      img.src ? img.src : 
                      img.url ? img.url :
                      img.path ? img.path : '';
          
          if (!imgSrc) {
            console.warn("Invalid image found in galleryProductImages:", img);
            return;
          }
          
          // Only add unique images
          if (!uniqueUrls.has(imgSrc)) {
            uniqueUrls.add(imgSrc);
            uniqueImages.push({
              src: imgSrc,
              alt: (typeof img === 'object' && img.alt) || 
                  (selectedProduct && selectedProduct.title) || 
                  `Product image ${uniqueImages.length + 1}`
            });
          }
        });
        
        console.log(`Prepared ${uniqueImages.length} unique images for lightbox`);
        return uniqueImages;
      } 
      
      // Second priority: Use component's productImages state
      else if (selectedProduct && productImages && productImages.length > 0) {
        console.log("Using productImages from component state:", productImages.length);
        
        // Extract unique images to avoid duplicates
        const uniqueUrls = new Set();
        const uniqueImages = [];
        
        productImages.forEach((img, index) => {
          // Handle different image formats with robust fallbacks
          const imgSrc = typeof img === 'string' ? img : 
                      img.src ? img.src : 
                      img.url ? img.url :
                      img.path ? img.path : 
                      (selectedProduct && selectedProduct.src) || '';
          
          if (!imgSrc) {
            console.warn("Invalid image found in productImages:", img);
            return;
          }
          
          // Only add unique images
          if (!uniqueUrls.has(imgSrc)) {
            uniqueUrls.add(imgSrc);
            uniqueImages.push({
              src: imgSrc,
              alt: (typeof img === 'object' && img.alt) || 
                  (selectedProduct && selectedProduct.title) || 
                  `Product image ${uniqueImages.length + 1}`
            });
          }
        });
        
        console.log(`Prepared ${uniqueImages.length} unique images for lightbox`);
        return uniqueImages;
      } 
      
      // Fallback: Use gallery images
      else {
        console.log("Using fallback gallery images:", Array.isArray(images) ? images.length : 0);
        if (!Array.isArray(images) || images.length === 0) {
          return []; // Return empty array if no images
        }
        
        // Extract unique images to avoid duplicates
        const uniqueUrls = new Set();
        const uniqueImages = [];
        
        images.forEach((img, index) => {
          if (!img) {
            console.warn("Invalid image in gallery at index", index);
            return;
          }
          
          const imgSrc = img.src || img.path || '';
          if (!imgSrc) {
            console.warn("Image missing src:", img);
            return;
          }
          
          // Only add unique images
          if (!uniqueUrls.has(imgSrc)) {
            uniqueUrls.add(imgSrc);
            uniqueImages.push({
              src: imgSrc,
              alt: img.alt || img.title || `Gallery image ${uniqueImages.length + 1}`
            });
          }
        });
        
        console.log(`Prepared ${uniqueImages.length} unique images for lightbox`);
        return uniqueImages;
      }
    } catch (error) {
      console.error("Error preparing slides:", error);
      return []; // Return empty array on error
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="py-12 text-center">
        <FaImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No images available</p>
      </div>
    );
  }

  return (
    <div className={`py-6 ${className}`}>
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
        </div>
      )}
      
      <div className={sectionClassName}>
        {renderLayout()}
      </div>

      {/* Enhanced Professional Lightbox with product images support */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={photoIndex}
        slides={getSafeSlides()}
        plugins={[Zoom, Fullscreen]} /* Removed Download plugin */
        carousel={{
          preload: 5,
          padding: { top: { small: 8, medium: 16, large: 24 }, bottom: { small: 8, medium: 16, large: 24 }, left: { small: 0, medium: 8, large: 16 }, right: { small: 0, medium: 8, large: 16 } },
          spacing: { small: 8, medium: 16, large: 24 },
          imageFit: 'contain',
          finite: false,
          swipeThreshold: 5, // Even easier to swipe/slide
          touchDragThreshold: 50, // More sensitive touch dragging
        }}
        animation={{
          swipe: 200, // Even faster swipe animation for smoother experience
          fade: 150,  // Faster fade for more responsive feel
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
          doubleTapDelay: 250, // Faster double tap
          doubleClickDelay: 250, // Faster double click
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
        }}
        controller={{
          touchAction: 'pan-y',
          closeOnPullDown: true,
          closeOnBackdropClick: true,
          slideMultiple: false, // Ensure single slide movement
          slideShowInterval: 0,  // No automatic slideshow
          swipeVelocityThreshold: 0.1,  // Even lower threshold for easier swiping
          tapAction: "close", // Tap to close
          maxSwipeDistance: 300, // Allow longer swipes
          touchDetection: { drag: true, swipe: true, pinch: true },
        }}
        render={{
          iconZoom: () => <FaExpand className="w-6 h-6" />,
          iconPrev: (props) => (
            <button 
              className={`p-3 sm:p-4 md:p-5 rounded-full bg-black bg-opacity-70 
                ${props && props.disabled ? 'opacity-30 cursor-default' : 'opacity-90 hover:opacity-100'} 
                transition-all duration-200 backdrop-blur-sm
                absolute left-1 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 z-40
                active:scale-95 focus:outline-none`}
              disabled={props && props.disabled}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="sm:w-8 sm:h-8 md:w-10 md:h-10">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          ),
          iconNext: (props) => (
            <button 
              className={`p-3 sm:p-4 md:p-5 rounded-full bg-black bg-opacity-70 
                ${props && props.disabled ? 'opacity-30 cursor-default' : 'opacity-90 hover:opacity-100'} 
                transition-all duration-200 backdrop-blur-sm
                absolute right-1 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 z-40
                active:scale-95 focus:outline-none`}
              disabled={props && props.disabled}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="sm:w-8 sm:h-8 md:w-10 md:h-10">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ),
          slideFooter: (props) => {
            // Calculate total slides safely
            const totalSlides = window.galleryProductImages?.length || 
                              productImages?.length || 
                              getSafeSlides().length || 
                              1;
            
            // Only show image count indicator with improved styling, no product details
            return (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white 
                  text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                <span className="font-medium">{photoIndex + 1}</span>
                <span className="mx-1">/</span>
                <span>{totalSlides}</span>
              </div>
            );
          },
          iconClose: (props) => (
            <div className="p-2 sm:p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          ),
        }}
        className="gallery-lightbox"
        on={{
          view: ({ index }) => setPhotoIndex(index),
          click: () => setOpen(false)
        }}
      />
    </div>
  );
};

export default LightboxGallery;
