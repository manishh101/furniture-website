import React from 'react';
import ProductCard from './ProductCard';

const CategorySection = ({ title, description, products }) => {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-primary mb-3">{title}</h2>
      {description && (
        <p className="text-text/80 mb-6">{description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            title={product.title}
            image={product.image}
            description={product.description}
            onClick={product.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
