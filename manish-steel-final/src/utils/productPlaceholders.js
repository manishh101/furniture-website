/**
 * FALLBACK PLACEHOLDERS - USE ONLY WHEN DATABASE IMAGES ARE NOT AVAILABLE
 * These are only used as a last resort when Cloudinary URLs from the database fail
 * or when products don't have images assigned.
 */
const productPlaceholder = '/placeholders/Product.png';
const householdFurniturePlaceholder = '/placeholders/Household-Furniture.png';
const officeProductsPlaceholder = '/placeholders/Office-Products.png';
const bedsPlaceholder = '/placeholders/Beds.png';

// Export the placeholder images as an array for use in components
export const defaultProductImages = [
  productPlaceholder,
  householdFurniturePlaceholder,
  officeProductsPlaceholder,
  bedsPlaceholder
];

// Export individual placeholders for specific use cases
export const productPlaceholderImage = productPlaceholder;
export const householdFurniturePlaceholderImage = householdFurniturePlaceholder;
export const officeProductsPlaceholderImage = officeProductsPlaceholder;
export const bedsPlaceholderImage = bedsPlaceholder;
