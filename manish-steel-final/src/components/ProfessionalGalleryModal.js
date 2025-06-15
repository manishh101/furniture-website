import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProfessionalGalleryModal.css';

const ProfessionalGalleryModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  productName = 'Product Gallery' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [showThumbnails, setShowThumbnails] = useState(true);
  
  // Touch gesture handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // Minimum distance in pixels to recognize as swipe

  // Reset state when modal opens/closes or images change
  // State for showing swipe hint on mobile
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  
  // Reset state when modal opens/closes or images change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoadErrors(new Set());
      document.body.style.overflow = 'hidden';
      
      // Show swipe hint only on mobile
      if (window.innerWidth <= 768 && images.length > 1) {
        setShowSwipeHint(true);
        // Hide hint after animation completes
        setTimeout(() => setShowSwipeHint(false), 3000);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex, images.length]);

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
          setCurrentIndex(images.length - 1);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, images.length, onClose]);

  const navigateNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const navigatePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (index) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
    setIsLoading(false);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      navigateNext();
    } else if (isRightSwipe) {
      navigatePrevious();
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    return image?.url || image?.src || image;
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];
  const currentImageUrl = getImageUrl(currentImage);
  const hasError = imageLoadErrors.has(currentIndex);

  return (
    <div className="professional-gallery-modal" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()} 
           onTouchStart={handleTouchStart} 
           onTouchMove={handleTouchMove} 
           onTouchEnd={handleTouchEnd}>
        
        {/* Header */}
        <div className="gallery-header">
          <div className="gallery-title">
            <h2>{productName}</h2>
            <span className="image-counter">
              {currentIndex + 1} / {images.length}
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

        {/* Main Image Display */}
        <div 
          className="gallery-main-image"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="image-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
          
          {hasError ? (
            <div className="image-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <p>Image could not be loaded</p>
            </div>
          ) : (
            <img
              src={currentImageUrl}
              alt={`${productName} - Image ${currentIndex + 1}`}
              onLoad={handleImageLoad}
              onError={() => handleImageError(currentIndex)}
              onLoadStart={() => setIsLoading(true)}
              className="main-image"
            />
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                className="nav-arrow nav-arrow-left" 
                onClick={navigatePrevious}
                title="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              <button 
                className="nav-arrow nav-arrow-right" 
                onClick={navigateNext}
                title="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
              
              {/* Swipe hint for mobile users */}
              {showSwipeHint && (
                <div className="swipe-hint">
                  Swipe left or right to navigate
                </div>
              )}
            </>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="gallery-thumbnails">
            <div className="thumbnails-container">
              {images.map((image, index) => {
                const thumbnailUrl = getImageUrl(image);
                const isActive = index === currentIndex;
                const hasThumbError = imageLoadErrors.has(index);
                
                return (
                  <div
                    key={index}
                    className={`thumbnail ${isActive ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    {hasThumbError ? (
                      <div className="thumbnail-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={thumbnailUrl}
                        alt={`Thumbnail ${index + 1}`}
                        onError={() => handleImageError(index)}
                        loading="lazy"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {images.length > 1 && (
          <div className="gallery-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalGalleryModal;
