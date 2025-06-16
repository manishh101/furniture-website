import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProfessionalGalleryModal.css';
import CloudinaryImageService from '../services/cloudinaryImageService';
import { motion, AnimatePresence } from 'framer-motion';

const ProfessionalGalleryModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  productName = 'Product Gallery' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [processedImages, setProcessedImages] = useState([]);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right, 0 for initial
  const thumbnailsContainerRef = useRef(null);
  
  // Touch gesture handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // Minimum distance in pixels to recognize as swipe
  
  // Process images when they change
  useEffect(() => {
    console.log('ProfessionalGalleryModal received images:', images);
    
    if (Array.isArray(images) && images.length > 0) {
      // For debugging, check the raw image data first
      console.log('Raw image data examples:', 
                 images.slice(0, 3).map(img => typeof img === 'object' ? JSON.stringify(img) : img));
      
      // Process images directly with minimal transformation
      const processedUrls = images.map(img => {
        // Handle different image formats
        if (!img) return null;
        
        // Convert all images to direct URLs with minimal processing
        if (typeof img === 'string') {
          // For Cloudinary URLs, ensure they are using HTTPS
          if (img.includes('cloudinary.com') && img.startsWith('http:')) {
            return img.replace('http:', 'https:');
          }
          return img; // Return string URLs directly
        } else if (typeof img === 'object') {
          // For objects, extract the URL using typical property names
          const url = img.url || img.src || img.path || img.image || img.imageUrl || img.secure_url || '';
          if (url.includes('cloudinary.com') && url.startsWith('http:')) {
            return url.replace('http:', 'https:');
          }
          return url;
        }
        return null;
      }).filter(Boolean); // Remove null/undefined entries
      
      console.log('Raw processed URLs:', processedUrls.slice(0, 3));
      
      // Set images directly without further processing
      setProcessedImages(processedUrls);
      console.log('Image processing complete:', processedUrls.length);
    } else {
      setProcessedImages([]);
      console.log('Gallery modal: No valid images provided');
    }
  }, [images]);
  
  // Reset state when modal opens/closes or images change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoadErrors(new Set());
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case 'Home':
          setCurrentIndex(0);
          break;
        case 'End':
          setCurrentIndex(processedImages.length - 1);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, processedImages.length, onClose]);

  const navigateNext = useCallback(() => {
    if (processedImages.length <= 1) return;
    
    setSlideDirection(1); // Right direction
    setCurrentIndex((prev) => (prev + 1) % processedImages.length);
    setIsLoading(true);
    
    // Scroll to the new thumbnail
    if (thumbnailsContainerRef.current) {
      const nextIndex = (currentIndex + 1) % processedImages.length;
      scrollToThumbnail(nextIndex);
    }
  }, [processedImages.length, currentIndex]);

  const navigatePrevious = useCallback(() => {
    if (processedImages.length <= 1) return;
    
    setSlideDirection(-1); // Left direction
    setCurrentIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);
    setIsLoading(true);
    
    // Scroll to the new thumbnail
    if (thumbnailsContainerRef.current) {
      const prevIndex = (currentIndex - 1 + processedImages.length) % processedImages.length;
      scrollToThumbnail(prevIndex);
    }
  }, [processedImages.length, currentIndex]);
  
  // Function to scroll thumbnails container to make current thumbnail visible
  const scrollToThumbnail = (index) => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const thumbnails = container.querySelectorAll('.thumbnail-item');
      
      if (thumbnails[index]) {
        const thumbnail = thumbnails[index];
        const containerWidth = container.offsetWidth;
        const thumbnailWidth = thumbnail.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        
        // Calculate center position
        const targetScrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
        
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    // Scroll to the current thumbnail when image is loaded
    if (thumbnailsContainerRef.current) {
      scrollToThumbnail(currentIndex);
    }
    
    // Preload next and previous images for smoother navigation
    if (processedImages.length > 1) {
      const nextIndex = (currentIndex + 1) % processedImages.length;
      const prevIndex = (currentIndex - 1 + processedImages.length) % processedImages.length;
      
      // Preload next image
      if (processedImages[nextIndex]) {
        const nextImg = new Image();
        nextImg.src = getImageUrl(processedImages[nextIndex]);
      }
      
      // Preload previous image
      if (processedImages[prevIndex]) {
        const prevImg = new Image();
        prevImg.src = getImageUrl(processedImages[prevIndex]);
      }
    }
  };

  const handleImageError = (index) => {
    console.error(`Failed to load image at index ${index}`);
    setImageLoadErrors(prev => new Set(prev).add(index));
    setIsLoading(false);
  };

  // Add a fallback image mechanism
  const handleFallbackImage = (e) => {
    console.log('Image failed to load, attempting fallback');
    // Try with a different approach - direct URL without transformations
    const imgElement = e.target;
    const currentSrc = imgElement.src;
    
    if (currentSrc.includes('res.cloudinary.com') && currentSrc.includes('upload/')) {
      // Extract the base URL and public ID
      const parts = currentSrc.split('/upload/');
      if (parts.length === 2) {
        const baseUrl = parts[0];
        // Get the public ID, removing any transformations
        const publicIdWithTransforms = parts[1];
        const publicId = publicIdWithTransforms.includes('/') 
          ? publicIdWithTransforms.substring(publicIdWithTransforms.indexOf('/') + 1)
          : publicIdWithTransforms;
          
        // Set a simple URL with no transformations
        const fallbackUrl = `${baseUrl}/upload/${publicId}`;
        console.log('Using fallback URL:', fallbackUrl);
        imgElement.src = fallbackUrl;
        
        // If this also fails, show error
        imgElement.onerror = () => {
          console.error('Fallback image also failed to load');
          handleImageError(currentIndex);
        };
        
        // Prevent infinite loop
        return;
      }
    }
    
    // If we get here, we couldn't create a fallback URL
    handleImageError(currentIndex);
  };
  
  // Touch event handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left -> next image
      navigateNext();
    } else if (isRightSwipe) {
      // Swipe right -> previous image
      navigatePrevious();
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  // Handle mouse wheel for navigation
  const handleMouseWheel = useCallback((e) => {
    // Prevent default to avoid page scrolling
    e.preventDefault();
    
    // Determine direction based on delta
    if (e.deltaX > 30 || e.deltaY > 30) {
      navigateNext();
    } else if (e.deltaX < -30 || e.deltaY < -30) {
      navigatePrevious();
    }
  }, [navigateNext, navigatePrevious]);

  // Handle thumbnail click with improved error handling
  const handleThumbnailClick = (index) => {
    if (currentIndex !== index) {
      setCurrentIndex(index);
      setIsLoading(true);
      
      // Pre-load image to improve transition
      const img = new Image();
      img.src = processedImages[index];
      
      // Set a timeout in case image loading takes too long
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // 3 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        handleImageError(index);
        setIsLoading(false);
      };
    }
  };

  const getImageUrl = (image) => {
    if (!image) {
      console.log('Empty image URL provided to getImageUrl');
      return '';
    }
    
    console.log('Processing image URL:', image);
    
    // Process URL through CloudinaryImageService for consistent handling
    if (typeof image === 'string') {
      // For direct cloudinary URLs, use them directly with minimal processing
      if (image.includes('res.cloudinary.com')) {
        console.log('Direct Cloudinary URL detected');
        // Strip any transformations and apply our own
        const baseUrl = image.split('/upload/')[0] + '/upload';
        const publicId = image.split('/upload/')[1].split('?')[0];
        
        // Simple transformation that ensures full visibility
        const optimizedUrl = `${baseUrl}/c_fit,w_1600,h_1600,q_auto:best/${publicId}`;
        console.log('Optimized URL:', optimizedUrl);
        return optimizedUrl;
      }
      
      // Return any other string URLs as is
      return image;
    }
    
    // For object type images
    const normalizedUrl = typeof image === 'object' && (image.url || image.src) 
      ? (image.url || image.src) 
      : '';
      
    if (normalizedUrl && normalizedUrl.includes('res.cloudinary.com')) {
      // Apply the same direct transformation
      const baseUrl = normalizedUrl.split('/upload/')[0] + '/upload';
      const publicId = normalizedUrl.split('/upload/')[1].split('?')[0];
      const optimizedUrl = `${baseUrl}/c_fit,w_1600,h_1600,q_auto:best/${publicId}`;
      console.log('Object image optimized URL:', optimizedUrl);
      return optimizedUrl;
    }
    
    return normalizedUrl;
  };

  if (!isOpen || processedImages.length === 0) return null;

  const currentImageUrl = processedImages[currentIndex] || '';
  const hasError = imageLoadErrors.has(currentIndex);

  return (
    <div className="professional-gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" 
           onClick={(e) => e.stopPropagation()} 
           onTouchStart={handleTouchStart} 
           onTouchMove={handleTouchMove} 
           onTouchEnd={handleTouchEnd}>
        
        {/* Header */}
        <div className="gallery-header">
          <div className="gallery-title">
            <h2>{productName}</h2>
            <span className="image-counter">
              {currentIndex + 1} / {processedImages.length}
            </span>
          </div>
          <div className="gallery-controls">
            <button 
              className="control-btn thumbnail-toggle"
              onClick={() => setShowThumbnails(!showThumbnails)}
              title="Toggle thumbnails"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
            </button>
            <button 
              className="control-btn close-btn" 
              onClick={onClose}
              title="Close gallery"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Main Image Display with Sliding Animation */}
        <div 
          className="gallery-main-image"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="slider-container">
            <AnimatePresence initial={false} custom={slideDirection}>
              <motion.div
                key={currentIndex}
                custom={slideDirection}
                initial={{ 
                  opacity: 0,
                  x: slideDirection > 0 ? '100%' : slideDirection < 0 ? '-100%' : 0
                }}
                animate={{ 
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                exit={{ 
                  opacity: 0,
                  x: slideDirection > 0 ? '-100%' : slideDirection < 0 ? '100%' : 0,
                  transition: { duration: 0.3, ease: "easeIn" }
                }}
                className="image-slide active"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isLoading && (
                  <div className="image-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}
                
                {hasError ? (
                  <div className="image-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    <p>Image could not be loaded</p>
                  </div>
                ) : (
                  <>
                    {console.log('Rendering image with URL:', currentImageUrl)}
                    {console.log('Final image URL for rendering:', getImageUrl(currentImageUrl))}
                    <img
                      src={currentImageUrl} // Use the raw URL directly
                      alt={`${productName} - Image ${currentIndex + 1}`}
                      onLoad={handleImageLoad}
                      onError={handleFallbackImage} // Use our fallback mechanism
                      className="main-image"
                      crossOrigin="anonymous" // Help with CORS issues
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Navigation buttons */}
          {processedImages.length > 1 && (
            <>
              <button 
                className="nav-arrow nav-arrow-left" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrevious();
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              <button 
                className="nav-arrow nav-arrow-right" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Thumbnails with horizontal scrolling */}
        {showThumbnails && processedImages.length > 1 && (
          <div className="gallery-thumbnails">
            <div 
              className="thumbnails-container"
              ref={thumbnailsContainerRef}
            >
              {processedImages.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img 
                    src={getImageUrl(image)}
                    alt={`Thumbnail ${index + 1}`} 
                    className="thumbnail"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/images/placeholder-thumbnail.png';
                    }}
                  />
                  {index === currentIndex && (
                    <div className="thumbnail-active-indicator"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Thumbnail navigation buttons if many thumbnails */}
            {processedImages.length > 6 && (
              <>
                <button 
                  className="prev-thumbnails" 
                  onClick={() => {
                    if (thumbnailsContainerRef.current) {
                      thumbnailsContainerRef.current.scrollBy({
                        left: -200,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button 
                  className="next-thumbnails" 
                  onClick={() => {
                    if (thumbnailsContainerRef.current) {
                      thumbnailsContainerRef.current.scrollBy({
                        left: 200,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalGalleryModal;
