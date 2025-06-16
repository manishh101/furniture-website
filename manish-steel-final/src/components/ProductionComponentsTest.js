import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ProductionTopProductsSection from './ProductionTopProductsSection';
import ProductionMostSellingSection from './ProductionMostSellingSection';
import ProductionErrorBoundary from './common/ProductionErrorBoundary';

/**
 * Test page for production components
 * Use this to verify that production-level components work correctly
 */
const ProductionComponentsTest = () => {
  const handleProductView = (productId) => {
    console.log('Product viewed:', productId);
  };

  const handleProductLike = (productId) => {
    console.log('Product liked:', productId);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Production Components Test
            </h1>
            <p className="text-gray-600 mt-2">
              Testing production-ready components with error boundaries and performance optimizations
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Test Production Top Products */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Production Top Products Section
            </h2>
            <ProductionErrorBoundary 
              fallbackComponent="ProductionTopProductsSection"
              title="Top Products Error"
              message="There was an error loading the top products section."
            >
              <ProductionTopProductsSection
                limit={6}
                onProductView={handleProductView}
                onProductLike={handleProductLike}
                className="bg-white rounded-lg shadow-sm"
                showViewAllButton={true}
              />
            </ProductionErrorBoundary>
          </section>

          {/* Test Production Most Selling */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Production Most Selling Section
            </h2>
            <ProductionErrorBoundary 
              fallbackComponent="ProductionMostSellingSection"
              title="Best Sellers Error"
              message="There was an error loading the best selling products section."
            >
              <ProductionMostSellingSection
                limit={6}
                onProductView={handleProductView}
                onProductLike={handleProductLike}
                className="bg-white rounded-lg shadow-sm"
                showViewAllButton={true}
              />
            </ProductionErrorBoundary>
          </section>

          {/* Performance Info */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Production Features Enabled
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ PropTypes validation for runtime type checking</li>
              <li>✅ React.memo for performance optimization</li>
              <li>✅ Error boundaries for crash protection</li>
              <li>✅ ARIA labels for accessibility</li>
              <li>✅ Image lazy loading with error handling</li>
              <li>✅ Analytics tracking hooks</li>
              <li>✅ Request deduplication and caching</li>
              <li>✅ Automatic retry with exponential backoff</li>
              <li>✅ SEO-optimized semantic HTML</li>
              <li>✅ Focus management for keyboard navigation</li>
            </ul>
          </section>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default ProductionComponentsTest;
