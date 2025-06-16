import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaArrowRight, FaFire, FaTrophy, FaShoppingCart } from 'react-icons/fa';
import { productAPI } from '../services/productService';
import { PlaceholderImage } from '../utils/placeholders';
import OptimizedImage from './common/OptimizedImage';
import ImageService from '../services/imageService';
import mobileDebugger from '../utils/mobileDebugger';
import { sanitizeApiUrl } from '../utils/apiUrlHelper';

// Error boundary to prevent entire component from failing
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MostSellingProductsSection failed to render:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Most Selling Products</h2>
              <p>Loading products...</p>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

// Wrap the entire component with error boundary in Home Page
const WrappedMostSellingProductsSection = () => {
  return (
    <ErrorBoundary>
      <MostSellingProductsSection />
    </ErrorBoundary>
  );
};

// Main component implementation
const MostSellingProductsSection = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null); // Add ref for intersection observer

  useEffect(() => {
    // Log device info for debugging
    mobileDebugger.mobileLog('MostSellingProductsSection mounted', {
      isMobile: mobileDebugger.isMobileDevice(),
      network: mobileDebugger.checkMobileNetwork()
    });
    
    // Only fetch data when the section is visible or about to become visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          mobileDebugger.mobileLog('MostSellingProductsSection visible, fetching data');
          fetchBestSellingProducts();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const fetchBestSellingProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching best-selling products...');
      
      // Use the proper API client with environment awareness
      try {
        // First try using the proper productAPI service
        const data = await productAPI.getMostSellingProducts(6);
        console.log('Best selling products API response:', data);
        
        if (data && data.products) {
          setBestSellingProducts(data.products);
          return;
        }
      } catch (serviceError) {
        console.warn('Failed to fetch using productAPI service, trying direct fetch:', serviceError);
      }
      
      // Proper environment detection and URL construction
      let apiBaseUrl = process.env.REACT_APP_API_URL || 
                      ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                       ? 'http://localhost:5000/api' 
                       : 'https://manish-steel-api.onrender.com/api');
      
      // Use the sanitizeApiUrl utility to ensure proper formatting
      apiBaseUrl = sanitizeApiUrl(apiBaseUrl);
      
      console.log('Using API base URL for best-selling products:', apiBaseUrl);
      
      // First try the dedicated endpoint
      try {
        const response = await fetch(`${apiBaseUrl}/products/best-selling?limit=6`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            setBestSellingProducts(data.products);
            return;
          }
        }
      } catch (endpointError) {
        console.warn('Best-selling products endpoint failed, trying alternative:', endpointError);
      }
      
      // If dedicated endpoint fails, try the general sorting endpoint
      const response = await fetch(`${apiBaseUrl}/products?sortBy=salesCount&order=desc&limit=6`);
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        setBestSellingProducts(data.products);
      } else if (data.products) {
        // Some APIs just return the products array directly
        setBestSellingProducts(data.products);
      } else {
        console.warn('No products in API response:', data);
        setError('No best-selling products found');
        
        // Use fallback data in production
        if (process.env.NODE_ENV === 'production') {
          setBestSellingProducts(getFallbackProducts());
          setError(null);
        }
      }
    } catch (error) {
      mobileDebugger.mobileError('Error fetching best selling products:', error);
      setError('Failed to load most selling products');
      
      // In production, use fallback data instead of showing error
      if (process.env.NODE_ENV === 'production') {
        setBestSellingProducts(getFallbackProducts());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback products data for production
  const getFallbackProducts = () => {
    return [
      {
        _id: 'fallback-best1',
        name: 'Executive Office Chair',
        description: 'Premium ergonomic chair for maximum comfort',
        price: 15000,
        rating: 4.9,
        salesCount: 250,
        image: '/placeholders/Office-Chairs.png',
        category: 'Office Furniture'
      },
      {
        _id: 'fallback-best2',
        name: 'Steel Almirah',
        description: 'Durable steel almirah with 4 shelves',
        price: 22000,
        rating: 4.8,
        salesCount: 180,
        image: '/placeholders/Almirahs-Wardrobes.png',
        category: 'Household Furniture'
      },
      {
        _id: 'fallback-best3',
        name: 'Computer Table',
        description: 'Modern design with cable management',
        price: 8500,
        rating: 4.7,
        salesCount: 150,
        image: '/placeholders/Office-Desks.png',
        category: 'Office Furniture'
      },
      {
        _id: 'fallback-best4',
        name: 'Double Bed',
        description: 'Strong steel frame with stylish design',
        price: 16500,
        rating: 4.8,
        salesCount: 120,
        image: '/placeholders/Beds.png',
        category: 'Beds'
      }
    ];
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `Rs. ${price.toLocaleString()}`;
  };

  const formatSalesCount = (count) => {
    if (!count) return '100+'; // Default for demo
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const renderRating = (rating = 4.5) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`h-3 w-3 ${
              index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const getBadgeForRank = (index) => {
    switch (index) {
      case 0:
        return { icon: FaTrophy, color: 'bg-yellow-500', text: '#1 Best Seller' };
      case 1:
        return { icon: FaTrophy, color: 'bg-gray-400', text: '#2 Best Seller' };
      case 2:
        return { icon: FaTrophy, color: 'bg-amber-600', text: '#3 Best Seller' };
      default:
        return { icon: FaFire, color: 'bg-orange-500', text: 'Hot Seller' };
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Most Selling Products</h2>
            <p className="text-gray-600">Our customers' favorite furniture pieces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse border">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-4 w-2/3"></div>
                <div className="bg-gray-200 h-6 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Most Selling Products</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaFire className="h-8 w-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-primary">Most Selling Products</h2>
            <FaFire className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our customers' absolute favorites! These furniture pieces have earned their spot 
            through exceptional sales performance and outstanding customer satisfaction.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bestSellingProducts.map((product, index) => {
            const badge = getBadgeForRank(index);
            const BadgeIcon = badge.icon;
            
            return (
              <div 
                key={product._id || product.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group animate-fadeInUp border-2 border-transparent hover:border-orange-200"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <OptimizedImage
                    src={product.image}
                    alt={ImageService.getImageAlt(product)}
                    category={product.category} 
                    size="medium"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    lazy={true}
                  />
                  
                  {/* Rank Badge */}
                  <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                    <BadgeIcon className="h-3 w-3" />
                    {badge.text}
                  </div>

                  {/* Sales Count */}
                  <div className="absolute top-3 right-3 bg-white/95 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaShoppingCart className="h-3 w-3" />
                    {formatSalesCount(product.salesCount)} sold
                  </div>

                  {/* Hot Indicator */}
                  <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    🔥 HOT
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Rating & Reviews */}
                  <div className="mb-4">
                    {renderRating(product.rating)}
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {product.reviewCount || '50+'} customer reviews
                    </p>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${product._id || product.id}`}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center gap-2 text-sm font-semibold transform hover:scale-105"
                    >
                      Buy Now
                      <FaArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-3 text-center">
                    {product.stock && product.stock < 10 ? (
                      <span className="text-red-600 text-xs font-semibold">
                        ⚠️ Only {product.stock} left in stock!
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-semibold">
                        ✅ In Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <Link
            to="/products?sortBy=popularity"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FaFire className="h-4 w-4" />
            View All Best Sellers
            <FaArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Export the wrapped version
export default WrappedMostSellingProductsSection;
