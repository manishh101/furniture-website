import React, { useState, useEffect } from 'react';

const SimpleTopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple test with hardcoded data first
    setTimeout(() => {
      setProducts([
        { _id: '1', name: 'Test Product 1', price: 1000 },
        { _id: '2', name: 'Test Product 2', price: 2000 },
        { _id: '3', name: 'Test Product 3', price: 3000 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Our Top Products</h2>
          <p className="text-center">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Our Top Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600">Rs. {product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimpleTopProducts;
