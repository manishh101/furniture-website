import React, { useState } from 'react';
import { FaHeart, FaEye } from 'react-icons/fa';

/**
 * Enhanced GalleryCard component for displaying products in the gallery
 * with a more professional and modern layout
 */
const GalleryCard = ({ 
  product, 
  onClick,
  isHovered,
  aspectRatio = 'square',
  showDescription = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!product) return null;

  // Get aspect ratio class
  const getAspectRatioClasses = () => {
    const aspectMap = {
      square: 'aspect-square',
      landscape: 'aspect-video',
      portrait: 'aspect-[3/4]',
      auto: 'aspect-auto'
    };
    return aspectMap[aspectRatio] || aspectMap.square;
  };

  // Handle card click - main entry point for interaction
  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) {
      console.log("GalleryCard: Executing onClick handler");
      onClick();
    } else {
      console.warn("GalleryCard: No onClick handler provided");
    }
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl 
        transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      {/* Image container with fixed aspect ratio */}
      <div className={`${getAspectRatioClasses()} relative overflow-hidden bg-gray-50`}>
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        
        {/* Fallback for image error */}
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center p-4">
              <FaEye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{product.title || 'Product image'}</p>
            </div>
          </div>
        )}
        
        <img 
          src={product.src} 
          alt={product.alt || product.title || 'Product image'} 
          className={`w-full h-full object-cover transition-all duration-500 ease-out 
            hover:scale-105 hover:brightness-105 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy" 
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(true);
            setImageError(true);
          }}
        />
        
        {/* Overlay gradient to improve text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent 
          pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Top badges */}
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
          {/* Category badge */}
          {product.category && product.category !== 'uncategorized' && (
            <div className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg shadow-sm">
              {product.category}
            </div>
          )}
          
          {/* Featured indicator */}
          {product.featured && (
            <div className="bg-accent text-white px-2 py-1 text-xs font-medium rounded-lg shadow-sm flex items-center">
              <FaHeart className="mr-1 w-3 h-3" /> Featured
            </div>
          )}
        </div>
        
        {/* View Gallery button - Ensure it directly calls handleCardClick */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 
          opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <button 
            className="bg-white text-primary hover:bg-primary hover:text-white 
              transition-colors px-4 py-2 rounded-full shadow-lg font-medium text-sm
              flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              handleCardClick(e);
            }}
            aria-label="View gallery for this product"
          >
            <FaEye className="w-4 h-4" /> <span>View Gallery</span>
          </button>
        </div>
      </div>
      
      {/* Product information */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.title || 'Untitled Product'}
          </h3>
          
          {(showDescription && product.description) && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Tags/Features */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 mb-3">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
