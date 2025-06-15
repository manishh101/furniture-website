import React, { useState } from 'react';
import { FaHeart, FaEye } from 'react-icons/fa';

/**
 * Enhanced GalleryListItem component for displaying products in a list view
 */
const GalleryListItem = ({ 
  product, 
  onClick,
  showDescription = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  if (!product) return null;
  
  // Direct handler for click events
  const handleItemClick = (e) => {
    e.preventDefault();
    if (onClick) {
      console.log("GalleryListItem: Executing onClick handler");
      onClick();
    } else {
      console.warn("GalleryListItem: No onClick handler provided");
    }
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg 
        transition-all duration-300 flex flex-col sm:flex-row h-full cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleItemClick(e);
        }
      }}
    >
      {/* Product Image */}
      <div className="sm:w-1/3 aspect-video sm:aspect-square relative overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
      
        <img 
          src={product.src} 
          alt={product.alt || product.title || 'Product image'} 
          className={`w-full h-full object-cover transition-all duration-500 ease-out 
            hover:scale-105 hover:brightness-105 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)} 
        />
        
        {/* View Gallery overlay - ensure it directly calls handleItemClick */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 
          transition-opacity duration-300 flex items-center justify-center">
          <button 
            className="bg-white text-primary hover:bg-primary hover:text-white 
              transition-colors px-4 py-2 rounded-full shadow-md flex items-center z-10"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              handleItemClick(e);
            }}
            aria-label="View gallery for this product"
          >
            <FaEye className="mr-2" /> View Gallery
          </button>
        </div>
        
        {/* Featured indicator */}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 text-xs font-medium rounded-lg shadow-sm">
            <FaHeart className="inline-block mr-1 w-3 h-3" /> Featured
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between sm:w-2/3">
        {/* Category */}
        {product.category && product.category !== 'uncategorized' && (
          <div className="text-xs text-primary font-medium uppercase mb-1 tracking-wide">
            {product.category}
          </div>
        )}
        
        {/* Title */}
        <h3 className="font-medium sm:font-semibold text-gray-900 mb-2 sm:text-lg">
          {product.title || 'Untitled Product'}
        </h3>
        
        {/* Description */}
        {(showDescription && product.description) && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3">
            {product.description}
          </p>
        )}
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
            {product.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {product.tags.length > 4 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                +{product.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryListItem;
