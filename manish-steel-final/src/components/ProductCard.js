import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaHeart } from 'react-icons/fa';
import { scrollToTop } from '../utils/scrollUtils';
import ImageService from '../services/imageService';
import OptimizedImage from './common/OptimizedImage';

const ProductCard = ({ 
  product, 
  onQuickView, 
  showBadges = true, 
  showCategory = true, 
  withActions = true
}) => {
  const navigate = useNavigate();

  // Handle product link click with scroll to top
  const handleProductClick = (e) => {
    e.preventDefault();
    navigate(`/products/${product._id}`);
    scrollToTop({ instant: true });
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 group">
      {/* Image container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product._id}`} onClick={handleProductClick} className="block w-full h-full">
          <OptimizedImage
            src={product.image || product.images?.[0]}
            alt={ImageService.getImageAlt(product)}
            category={product.category}
            size="medium"
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
            lazy={true}
          />
        </Link>
        
        {/* Quick view overlay */}
        {withActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-50 shadow-lg font-medium"
            >
              <FaEye className="inline mr-2" />
              Quick View
            </button>
          </div>
        )}
        
        {showBadges && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.inStock ? (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                In Stock
              </span>
            ) : (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            )}
            
            {product.isNew && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                New
              </span>
            )}

            {product.discount && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {product.discount}% Off
              </span>
            )}
          </div>
        )}
        
        {/* Wishlist button - top right */}
        {withActions && (
          <div className="absolute top-3 right-3 z-10">
            <button 
              title="Add to Wishlist"
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
              aria-label="Add to wishlist"
            >
              <FaHeart className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Product info - fixed height for consistency */}
      <div className="p-4 h-32 flex flex-col justify-between">
        <div className="flex-1">
          {showCategory && product.category && (
            <div className="mb-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                {product.subcategory || product.category}
              </span>
            </div>
          )}
          
          <Link to={`/products/${product._id}`} onClick={handleProductClick} className="block">
            <h3 className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors mb-1 line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-primary font-bold text-lg">
              ₹{parseFloat(product.price || 0).toLocaleString()}
            </span>
            
            {product.oldPrice && (
              <span className="text-gray-500 line-through text-sm">
                ₹{parseFloat(product.oldPrice).toLocaleString()}
              </span>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <span 
                  key={index}
                  className={`text-xs ${index < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
