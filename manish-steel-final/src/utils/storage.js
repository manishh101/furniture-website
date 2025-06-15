// Local storage utility for storing website data
import { defaultCategories } from './categoryData';

// Available product images
const productImages = {
  wardrobes: ['/images/furniture-1.jpg', '/images/furniture-2.jpg'],
  office: ['/images/furniture-2.jpg', '/images/furniture-1.jpg'],
  commercial: ['/images/furniture-1.jpg', '/images/furniture-2.jpg'],
  default: ['/images/furniture-1.jpg', '/images/furniture-2.jpg']
};

const getRandomImage = (category = 'default') => {
  const images = productImages[category] || productImages.default;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

// Get a random product image - can be used as fallback for missing images
const getRandomProductImage = (categoryId) => {
  return getRandomImage(categoryId || 'default');
};

const initialProducts = [
  {
    id: 'p1',
    name: 'Premium 3-Door Wardrobe',
    price: '14500',
    category: 'Household Furniture',
    categoryId: 'household',
    subcategory: 'Almirahs & Wardrobes',
    subcategoryId: 'almirahs',
    description: 'Elegant 3-door wardrobe with mirror doors, perfect for modern bedrooms.',
    features: ['3 Door Design', 'Mirror Doors', 'Multiple Shelves', 'Hanging Rod', 'Premium Finish'],
    images: ['/images/furniture-1.jpg', '/images/furniture-2.jpg'],
    inStock: true,
    rating: 4.5
  },
  {
    id: 'p2',
    name: 'Executive Office Almirah',
    price: '18500',
    category: 'Office Furniture',
    categoryId: 'office',
    subcategory: 'Office Storage',
    subcategoryId: 'storage',
    description: 'Professional office almirah with secure locking system.',
    features: ['Secure Lock', 'Multiple Compartments', 'Anti-rust Coating', 'Heavy Duty'],
    images: ['/images/furniture-2.jpg', '/images/furniture-1.jpg'],
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p3',
    name: 'School Storage Cabinet',
    price: '16500',
    category: 'Commercial Furniture',
    categoryId: 'commercial',
    subcategory: 'Commercial Shelving',
    subcategoryId: 'shelving',
    description: 'Heavy-duty storage cabinet ideal for schools.',
    features: ['Durable Build', 'Adjustable Shelves', 'Easy Maintenance', 'Large Capacity'],
    images: ['/images/furniture-1.jpg', '/images/furniture-2.jpg'],
    inStock: true,
    rating: 4.6
  },
  {
    id: 'p4',
    name: 'Modern Double Door Wardrobe',
    price: '13500',
    category: 'Household Furniture',
    categoryId: 'household',
    subcategory: 'Almirahs & Wardrobes',
    subcategoryId: 'almirahs',
    description: 'Contemporary double door wardrobe with sleek design.',
    features: ['Modern Design', 'Spacious Interior', 'Quality Hardware', 'Easy Assembly'],
    images: ['/images/furniture-1.jpg', '/images/furniture-2.jpg'],
    inStock: true,
    rating: 4.4
  }
];

// Initial gallery images
const initialGalleryImages = [
  {
    id: 'g1',
    title: 'Modern Steel Wardrobe',
    description: 'Our latest design showcasing durability and style',
    image: '/images/furniture-1.jpg',
    category: 'household'
  },
  {
    id: 'g2',
    title: 'Office Storage Solutions',
    description: 'Custom storage solutions for modern offices',
    image: '/images/furniture-2.jpg',
    category: 'office'
  }
];

// Initial contact info
const initialContactInfo = {
  address: 'Dharan Rd, Biratnagar 56613, Nepal',
  phone: '+977 982-4336371',
  email: 'shreemanishfurniture@gmail.com',
  businessHours: 'Sunday - Friday: 8:00 AM - 7:00 PM\nSaturday: 8:00 AM - 12:00 PM',
  social: {
    whatsapp: 'https://wa.me/9779824336371',
    facebook: 'https://www.facebook.com/profile.php?id=61576758530152',
    instagram: 'https://www.instagram.com/shreemanishfurniture',
    tiktok: 'https://tiktok.com',
    twitter: 'https://twitter.com'
  },
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.089636105974!2d87.27763091503517!3d26.49980678332793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef7395d46084a5%3A0xc709a12df1274cc8!2sShree%20Manish%20Steel%20Furniture%20Udhyog%20Pvt.%20Ltd.!5e0!3m2!1sen!2snp!4v1680000000000'
};

// Product functions
const getProducts = () => {
  try {
    // First check localStorage
    const savedProducts = localStorage.getItem('manishSteel_products');
    
    // If products exist in localStorage, parse and return them
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`Found ${parsed.length} products in localStorage`);
          return parsed;
        }
      } catch (parseError) {
        console.error('Error parsing saved products:', parseError);
      }
    }
    
    // Check if a legacy storage format exists
    const legacyProducts = localStorage.getItem('products');
    if (legacyProducts) {
      try {
        const parsedLegacyProducts = JSON.parse(legacyProducts);
        if (Array.isArray(parsedLegacyProducts) && parsedLegacyProducts.length > 0) {
          console.log(`Found ${parsedLegacyProducts.length} products in legacy storage`);
          // Migrate to new format
          localStorage.setItem('manishSteel_products', JSON.stringify(parsedLegacyProducts));
          return parsedLegacyProducts;
        }
      } catch (error) {
        console.error('Error parsing legacy products:', error);
      }
    }
    
    // If nothing in storage or parsing failed, use initial data
    console.log(`Using ${initialProducts.length} initial products`);
    localStorage.setItem('manishSteel_products', JSON.stringify(initialProducts));
    return initialProducts;
  } catch (error) {
    console.error('Error getting products:', error);
    return initialProducts;
  }
};

const getProductById = (productId) => {
  try {
    if (!productId) return null;
    
    const products = getProducts();
    // Try exact match first
    let product = products.find(p => p.id === productId);
    
    // If not found, try case-insensitive match or toString comparison
    if (!product) {
      product = products.find(p => 
        p.id.toString() === productId.toString() || 
        p.id.toLowerCase() === productId.toLowerCase()
      );
    }
    
    return product ? getFormattedProduct(product) : null;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
};

const saveProduct = (product) => {
  try {
    const products = getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      // Update existing product
      products[existingIndex] = product;
    } else {
      // Add new product with a new ID
      const newId = `p${Date.now()}`;
      products.push({ ...product, id: newId });
    }
    
    localStorage.setItem('manishSteel_products', JSON.stringify(products));
    return true;
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
};

const deleteProduct = (productId) => {
  try {
    const products = getProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('manishSteel_products', JSON.stringify(updatedProducts));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

const getFormattedProduct = (product) => {
  if (!product) return null;
  
  // Find category information
  const category = defaultCategories.find(cat => cat.id === product.categoryId);
  
  // Get images or fallbacks
  const productHasImages = product.images && Array.isArray(product.images) && product.images.length > 0;
  const images = productHasImages 
    ? product.images 
    : [getRandomProductImage(product.categoryId), getRandomProductImage(product.categoryId)];
  
  // Format price
  let formattedPrice = '0';
  if (product.price) {
    try {
      formattedPrice = parseFloat(product.price).toString();
    } catch (e) {
      formattedPrice = product.price.toString();
    }
  }
  
  // Format features if they exist
  const formattedFeatures = Array.isArray(product.features) 
    ? product.features 
    : (product.features ? [product.features] : []);
  
  return {
    ...product,
    id: product.id || `p${Date.now()}${Math.floor(Math.random() * 1000)}`,
    images: images,
    price: formattedPrice,
    category: category?.name || product.category || 'Uncategorized',
    categoryId: product.categoryId || 'uncategorized',
    subcategory: category?.subcategories?.find(sub => sub.id === product.subcategoryId)?.name 
      || product.subcategory 
      || 'Other',
    subcategoryId: product.subcategoryId || 'other',
    description: product.description || `Quality ${product.category || 'furniture'} product.`,
    features: formattedFeatures,
    inStock: product.inStock !== undefined ? product.inStock : true,
    rating: product.rating || (3.5 + Math.random() * 1.5).toFixed(1) // Generate random rating between 3.5-5.0
  };
};

// Gallery functions
const getGalleryImages = () => {
  try {
    const saved = localStorage.getItem('manishSteel_gallery');
    if (!saved) {
      localStorage.setItem('manishSteel_gallery', JSON.stringify(initialGalleryImages));
      return initialGalleryImages;
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error getting gallery images:', error);
    return initialGalleryImages;
  }
};

const getFormattedGalleryImage = (image) => {
  if (!image) return null;
  return {
    ...image,
    formattedDate: image.date ? new Date(image.date).toLocaleDateString() : '',
  };
};

const saveGalleryImage = (image) => {
  try {
    const images = getGalleryImages();
    const existingIndex = images.findIndex(img => img.id === image.id);
    
    if (existingIndex >= 0) {
      // Update existing image
      images[existingIndex] = image;
    } else {
      // Add new image with a new ID
      const newId = `g${Date.now()}`;
      images.push({ ...image, id: newId });
    }
    
    localStorage.setItem('manishSteel_gallery', JSON.stringify(images));
    return true;
  } catch (error) {
    console.error('Error saving gallery image:', error);
    return false;
  }
};

const deleteGalleryImage = (imageId) => {
  try {
    const images = getGalleryImages();
    const updatedImages = images.filter(img => img.id !== imageId);
    localStorage.setItem('manishSteel_gallery', JSON.stringify(updatedImages));
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return false;
  }
};

// Contact info functions
const getContactInfo = () => {
  try {
    const saved = localStorage.getItem('manishSteel_contactInfo');
    if (!saved) {
      localStorage.setItem('manishSteel_contactInfo', JSON.stringify(initialContactInfo));
      return initialContactInfo;
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error getting contact info:', error);
    return initialContactInfo;
  }
};

const saveContactInfo = (contactInfo) => {
  try {
    localStorage.setItem('manishSteel_contactInfo', JSON.stringify(contactInfo));
    return true;
  } catch (error) {
    console.error('Error saving contact info:', error);
    return false;
  }
};

export {
  productImages,
  getRandomImage,
  getRandomProductImage,
  initialProducts,
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  getFormattedProduct,
  getGalleryImages,
  getFormattedGalleryImage,
  saveGalleryImage,
  deleteGalleryImage,
  getContactInfo,
  saveContactInfo
};
