import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaArrowRight, FaHeart, FaEye } from 'react-icons/fa';
import { productAPI } from '../services/productService';
import { PlaceholderImage } from '../utils/placeholders';
import OptimizedImage from './common/OptimizedImage';
import ImageService from '../services/imageService';
import mobileDebugger from '../utils/mobileDebugger';
import { sanitizeApiUrl } from '../utils/apiUrlHelper';
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
    console.error("TopProductsSection failed to render:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Our Top Products</h2>
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
const WrappedTopProductsSection = () => {
  return (
    <ErrorBoundary>
      <TopProductsSection />
    </ErrorBoundary>
  );
};

// Main component implementation
const TopProductsSection = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null); // Add ref for intersection observer

  useEffect(() => {
    // Log device info for debugging
    mobileDebugger.mobileLog('TopProductsSection mounted', {
      isMobile: mobileDebugger.isMobileDevice(),
      network: mobileDebugger.checkMobileNetwork()
    });
    
    // Only fetch data when the section is visible or about to become visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          mobileDebugger.mobileLog('TopProductsSection visible, fetching data');
          fetchTopProducts();
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

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching top products...');
      
      // Keep track of attempts for debugging
      let attempts = [];
      
      // ATTEMPT 1: Use productAPI service
      try {
        attempts.push('productAPI.getTopProducts');
        console.log('Attempt 1: Using productAPI.getTopProducts...');
        const response = await productAPI.getTopProducts(6);
        console.log('Top products API response:', response);
        
        if (response && response.data) {
          const data = response.data;
          if (data.products && data.products.length > 0) {
            console.log('Successfully loaded products from productAPI:', data.products.length);
            setTopProducts(data.products);
            setLoading(false);
            return;
          } else if (Array.isArray(data) && data.length > 0) {
            console.log('Successfully loaded products array from productAPI:', data.length);
            setTopProducts(data);
            setLoading(false);
            return;
          }
        }
      } catch (serviceError) {
        console.warn('Failed to fetch using productAPI service:', serviceError);
      }
      
      // ATTEMPT 2: Direct API call with environment-aware URL
      try {
        attempts.push('direct fetch with environment URL');
        console.log('Attempt 2: Using direct fetch with environment URL...');
        
        // Proper environment detection and URL construction
        let apiBaseUrl = process.env.REACT_APP_API_URL || 
                        ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                         ? 'http://localhost:5000/api' 
                         : 'https://manish-steel-api.onrender.com/api');
        
        // Use the sanitizeApiUrl utility to ensure proper formatting
        apiBaseUrl = sanitizeApiUrl(apiBaseUrl);
        
        console.log('Using API base URL for top products:', apiBaseUrl);
        const featuredUrl = `${apiBaseUrl}/products/featured?limit=6`;
        console.log('Requesting from URL:', featuredUrl);
        
        const response = await fetch(featuredUrl);
        
        if (!response.ok) {
          console.warn(`API response not OK: ${response.status}`);
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Featured products API direct response:', data);
        
        if (data.products && data.products.length > 0) {
          console.log('Successfully loaded featured products:', data.products.length);
          setTopProducts(data.products);
          setLoading(false);
          return;
        } else if (Array.isArray(data) && data.length > 0) {
          console.log('Successfully loaded featured products array:', data.length);
          setTopProducts(data);
          setLoading(false);
          return;
        } else {
          console.warn('No products in API response:', data);
        }
      } catch (directError) {
        console.warn('Direct fetch failed:', directError);
      }
      
      // ATTEMPT 3: Hardcoded URL as last resort
      try {
        attempts.push('hardcoded URL');
        console.log('Attempt 3: Using hardcoded URL as last resort...');
        
        const hardcodedUrl = 'https://manish-steel-api.onrender.com/api/products/featured?limit=6';
        console.log('Requesting from hardcoded URL:', hardcodedUrl);
        
        const response = await fetch(hardcodedUrl);
        const data = await response.json();
        console.log('Hardcoded URL response:', data);
        
        if (data.products && data.products.length > 0) {
          console.log('Successfully loaded products from hardcoded URL:', data.products.length);
          setTopProducts(data.products);
          setLoading(false);
          return;
        }
      } catch (hardcodedError) {
        console.warn('Hardcoded URL failed:', hardcodedError);
      }
      
      // If we get here, no methods worked - use fallback data
      console.warn('All fetch attempts failed:', attempts.join(', '));
      setError('Could not load featured products');
      
      // Use fallback data in any environment since all attempts failed
      setTopProducts(getFallbackProducts());
      if (process.env.NODE_ENV === 'production') {
        setError(null); // Hide error in production
      }
    } catch (error) {
      mobileDebugger.mobileError('Error fetching top products:', error);
      setError('Failed to load top products');
      
      // In production, use fallback data instead of showing error
      if (process.env.NODE_ENV === 'production') {
        setTopProducts(getFallbackProducts());
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
        _id: 'fallback1',
        name: 'Premium Office Chair',
        description: 'Ergonomic design with lumbar support for maximum comfort',
        price: 12000,
        rating: 4.8,
        image: '/placeholders/Office-Chairs.png',
        category: 'Office Furniture'
      },
      {
        _id: 'fallback2',
        name: 'Steel Wardrobe',
        description: 'Spacious wardrobe with multiple compartments',
        price: 18500,
        rating: 4.7,
        image: '/placeholders/Almirahs-Wardrobes.png',
        category: 'Household Furniture'
      },
      {
        _id: 'fallback3',
        name: 'Office Table',
        description: 'Durable steel office table with modern design',
        price: 9500,
        rating: 4.6,
        image: '/placeholders/Office-Desks.png',
        category: 'Office Furniture'
      },
      {
        _id: 'fallback4',
        name: 'Single Bed',
        description: 'Comfortable single bed with steel frame',
        price: 8000,
        rating: 4.5,
        image: '/placeholders/Beds.png',
        category: 'Beds'
      }
    ];
  };

  const handleProductView = (productId) => {
    // Track product view for analytics
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `Rs. ${price.toLocaleString()}`;
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

  console.log('🎨 TopProductsSection render - loading:', loading, 'products:', topProducts.length, 'error:', error);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Top Products</h2>
            <p className="text-gray-600">Discover our most popular and highly rated furniture pieces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
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
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Top Products</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h2 className="text-3xl font-bold text-primary mb-4">Our Top Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular and highly rated furniture pieces, carefully selected for their 
            exceptional quality, design, and customer satisfaction.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topProducts.length > 0 ? topProducts.map((product, index) => (
            <div 
              key={product._id || product.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeInUp"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <OptimizedImage
                  src={product.image}
                  alt={ImageService.getImageAlt(product)}
                  category={product.category}
                  size="medium"
                  className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                  lazy={true}
                />
                
                {/* Featured Badge */}
                <div className="absolute top-3 left-3 bg-accent text-primary px-2 py-1 rounded-full text-xs font-semibold">
                  Top Choice
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                    onClick={() => handleProductView(product._id)}
                    aria-label="Quick view"
                  >
                    <FaEye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <FaHeart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>
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

                {/* Rating */}
                <div className="mb-3">
                  {renderRating(product.rating)}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <Link
                    to={`/products/${product._id || product.id}`}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2 text-sm"
                    onClick={() => handleProductView(product._id)}
                  >
                    View Details
                    <FaArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No featured products available</p>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <Link
            to="/products?featured=true"
            className="inline-flex items-center gap-3 bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/80 transition-all duration-300 transform hover:scale-105"
          >
            View All Top Products
            <FaArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Export the wrapped version
export default WrappedTopProductsSection;
