import React, { useState, useRef, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';
import ImageService from '../../services/imageService';

const OptimizedImage = ({ 
  src,
  alt,
  className = '',
  style = {},
  size = 'medium',
  category = '',
  lazy = true,
  aspectRatio = 'square',
  onLoad,
  onError,
  ...props
}) => {
  const [imageState, setImageState] = useState({
    loaded: false,
    error: false,
    currentSrc: null
  });
  const imgRef = useRef(null);
  const [isInView, setIsInView] = useState(!lazy);

  const sizeConfig = {
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    thumbnail: { width: 150, height: 150 }
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]'
  };

  // Get optimized image source - prioritize database images
  const getOptimizedSrc = () => {
    // No src provided - use placeholder only as a last resort
    if (!src) {
      console.warn('Missing image source, using placeholder for category:', category);
      return ImageService.getPlaceholderImage(category);
    }
    
    // Use actual image from source (should be a Cloudinary URL from database)
    const optimizedUrl = ImageService.getOptimizedImageUrl(src, {
      ...sizeConfig[size],
      category
    });
    
    // Log if using a placeholder instead of an actual image
    if (ImageService.isPlaceholder(optimizedUrl)) {
      console.warn('Using placeholder instead of actual image for:', src);
    }
    
    return optimizedUrl;
  };

  // Get fallback source - used only when primary source fails to load
  const getFallbackSrc = () => {
    // Try to use the original source with different parameters first
    if (src && !ImageService.isPlaceholder(src)) {
      const retryUrl = ImageService.getOptimizedImageUrl(src, {
        ...sizeConfig[size],
        quality: 'auto:low', // Try a lower quality version first
        category
      });
      
      if (retryUrl !== src) {
        console.log('Trying alternative optimization for:', src);
        return retryUrl;
      }
    }
    
    // If that doesn't work, fall back to a placeholder
    console.warn('Falling back to placeholder image for category:', category);
    return ImageService.getPlaceholderImage(category);
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) {
      setImageState(prev => ({ ...prev, currentSrc: getOptimizedSrc() }));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageState(prev => ({ ...prev, currentSrc: getOptimizedSrc() }));
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, size, lazy, category]);

  const handleLoad = (e) => {
    setImageState(prev => ({ ...prev, loaded: true }));
    onLoad?.(e);
  };

  const handleError = (e) => {
    const failedSrc = imageState.currentSrc;
    console.warn('Image failed to load:', failedSrc);
    
    // Check if this was already a placeholder - if so, don't try to load another placeholder
    const wasAlreadyPlaceholder = ImageService.isPlaceholder(failedSrc);
    
    if (wasAlreadyPlaceholder) {
      console.error('Even placeholder image failed to load:', failedSrc);
      // Just mark as loaded to avoid infinite error loop
      setImageState(prev => ({ 
        ...prev, 
        error: true,
        loaded: true
      }));
    } else {
      // Try the fallback (placeholder) instead
      const fallbackSrc = getFallbackSrc();
      console.log('Using fallback image:', fallbackSrc);
      setImageState(prev => ({ 
        ...prev, 
        error: true, 
        currentSrc: fallbackSrc,
        loaded: true
      }));
    }
    
    onError?.(e);
  };

  const combinedClassName = `
    relative overflow-hidden bg-gray-100
    ${aspectRatioClasses[aspectRatio] || 'aspect-square'}
    ${className}
  `.trim();

  return (
    <div 
      ref={imgRef}
      className={combinedClassName}
      style={style}
    >
      {/* Loading placeholder */}
      {!imageState.loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <FaImage className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Main image */}
      {imageState.currentSrc && (
        <img
          src={imageState.currentSrc}
          srcSet={lazy ? undefined : ImageService.generateSrcSet(src, { category })}
          sizes={lazy ? undefined : ImageService.getImageSizes()}
          alt={alt || ImageService.getImageAlt({ name: alt, category })}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${imageState.loaded ? 'opacity-100' : 'opacity-0'}
          `}
          {...props}
        />
      )}

      {/* Error state indicator */}
      {imageState.error && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
          Fallback
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
