import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaArrowRight } from 'react-icons/fa';

const WorkingTopProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      // Direct fetch call to test
      const response = await fetch('http://localhost:5000/api/products/featured?limit=6');
      const data = await response.json();
      
      if (data.success && data.products) {
        setTopProducts(data.products);
      } else {
        setError('No featured products found');
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
      setError('Failed to load top products');
    } finally {
      setLoading(false);
    }
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
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
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
          {topProducts.map((product, index) => (
            <div 
              key={product._id || product.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeInUp"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image || '/images/furniture-placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Featured Badge */}
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                  ⭐ Featured
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
                  >
                    View Details
                    <FaArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
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

export default WorkingTopProducts;
