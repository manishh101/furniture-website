import React from 'react';

/**
 * A utility to replace external placeholder images with local ones
 */

// Map of category names to local placeholder image paths
const placeholderMap = {
  'Household+Almirah': '/placeholders/Household-Furniture.png',
  'Household+Furniture': '/placeholders/Household-Furniture.png',
  'Office+Products': '/placeholders/Office-Products.png',
  'Wood+Products': '/placeholders/Wood-Products.png',
  'Almirahs+Wardrobes': '/placeholders/Almirahs-Wardrobes.png',
  'Beds': '/placeholders/Beds.png',
  'Chairs': '/placeholders/Chairs.png',
  'Tables': '/placeholders/Tables.png',
  'Storage+Racks': '/placeholders/Storage-Racks.png',
  'Office+Desks': '/placeholders/Office-Desks.png',
  'Office+Chairs': '/placeholders/Office-Chairs.png',
  'Filing+Cabinets': '/placeholders/Filing-Cabinets.png',
  'Office+Storage': '/placeholders/Office-Storage.png',
  'Lockers': '/placeholders/Lockers.png',
  'Commercial+Shelving': '/placeholders/Commercial-Shelving.png',
  'Counters': '/placeholders/Counters.png',
  'Display+Units': '/placeholders/Display-Units.png',
  // Generic fallbacks
  'Product': '/placeholders/Household-Furniture.png',
  'Table': '/placeholders/Tables.png',
  'Chair': '/placeholders/Chairs.png',
  'Gallery+Image': '/placeholders/Household-Furniture.png',
};

/**
 * Get a local placeholder image from a URL or category
 * @param {string} url - Original placeholder URL or category name
 * @returns {string} - Local placeholder path
 */
export const getLocalPlaceholder = (url) => {
  if (!url) return '/placeholders/Household-Furniture.png';
  
  // If it's already a local path, return it
  if (!url.includes('via.placeholder.com')) {
    return url;
  }
  
  // Extract text parameter from URL
  const textMatch = url.match(/text=([^&]+)/);
  const text = textMatch ? textMatch[1] : 'Product';
  
  // Return corresponding local placeholder
  return placeholderMap[text] || '/placeholders/Household-Furniture.png';
};

/**
 * Image component that uses local placeholders instead of external ones
 */
export const PlaceholderImage = ({ src, alt, className, ...props }) => {
  const localSrc = getLocalPlaceholder(src);
  
  return (
    <img 
      src={localSrc} 
      alt={alt || 'Product image'}
      className={className || ''} 
      {...props}
    />
  );
};

export default PlaceholderImage;
