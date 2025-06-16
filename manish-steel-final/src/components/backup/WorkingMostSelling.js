import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaArrowRight, FaFire, FaTrophy, FaShoppingCart } from 'react-icons/fa';

const WorkingMostSelling = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBestSellingProducts();
  }, []);

  const fetchBestSellingProducts = async () => {
    try {
      setLoading(true);
      // Direct fetch call to test
      const response = await fetch('http://localhost:5000/api/products/best-selling?limit=6');
      const data = await response.json();
      
      if (data.success && data.products) {
        setBestSellingProducts(data.products);
      } else {
        setError('No best-selling products found');
      }
    } catch (error) {
      console.error('Error fetching best-selling products:', error);
      setError('Failed to load most selling products');
    } finally {
      setLoading(false);
    }
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

  const getBadgeForRank = (index) => {
    const badges = [
      { text: '#1 Best Seller', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', icon: FaTrophy },
      { text: '#2 Hot Pick', color: 'bg-gradient-to-r from-orange-400 to-red-500', icon: FaFire },
      { text: '#3 Popular', color: 'bg-gradient-to-r from-red-400 to-pink-500', icon: FaShoppingCart },
      { text: 'Best Seller', color: 'bg-gradient-to-r from-blue-400 to-purple-500', icon: FaShoppingCart },
      { text: 'Hot Item', color: 'bg-gradient-to-r from-green-400 to-blue-500', icon: FaFire },
      { text: 'Popular', color: 'bg-gradient-to-r from-purple-400 to-pink-500', icon: FaShoppingCart }
    ];
    return badges[index] || badges[3];
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
    <section className="py-16 bg-white">
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
                  <img
                    src={product.image || '/images/furniture-placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

export default WorkingMostSelling;
