import React from 'react';

const PlaceholderImage = ({ 
  width = 400, 
  height = 500, 
  text = 'Product', 
  className = '',
  alt = 'Placeholder' 
}) => {
  return (
    <div 
      className={`bg-primary flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      <span className="text-center px-4">{text}</span>
    </div>
  );
};

export default PlaceholderImage;
