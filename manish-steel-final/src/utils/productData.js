// Product data with at least three products per subcategory

export const defaultProducts = [
  // Household Furniture - Almirahs & Wardrobes
  {
    id: 'alm-1',
    categoryId: 'household',
    subcategoryId: 'almirahs',
    name: 'Double Door Steel Wardrobe',
    description: 'Spacious double door wardrobe with multiple shelves and hanging rod',
    price: 15000,
    images: ['/images/furniture-1.jpg'],
    features: ['Double door design', 'Multiple shelves', 'Hanging rod', 'Lock system']
  },
  {
    id: 'alm-2',
    categoryId: 'household',
    subcategoryId: 'almirahs',
    name: 'Single Door Almirah',
    description: 'Compact single door almirah perfect for small spaces',
    price: 12000,
    images: ['/images/furniture-2.jpg'],
    features: ['Single door', '4 shelves', 'Lock system', 'Space-efficient design']
  },
  {
    id: 'alm-3',
    categoryId: 'household',
    subcategoryId: 'almirahs',
    name: 'Premium Steel Wardrobe',
    description: 'Large premium wardrobe with mirror and extra storage',
    price: 18000,
    images: ['/images/furniture-1.jpg'],
    features: ['Built-in mirror', 'Extra storage compartments', 'Premium finish', 'Enhanced durability']
  },

  // Household Furniture - Beds
  {
    id: 'bed-1',
    categoryId: 'household',
    subcategoryId: 'beds',
    name: 'Queen Size Steel Bed',
    description: 'Elegant queen size bed with storage space',
    price: 22000,
    images: ['/images/furniture-2.jpg'],
    features: ['Queen size frame', 'Under-bed storage', 'Powder-coated finish']
  },
  {
    id: 'bed-2',
    categoryId: 'household',
    subcategoryId: 'beds',
    name: 'Single Steel Bed',
    description: 'Sturdy single bed perfect for guest rooms',
    price: 15000,
    images: ['/images/furniture-1.jpg'],
    features: ['Single size frame', 'Durable construction', 'Easy assembly']
  },
  {
    id: 'bed-3',
    categoryId: 'household',
    subcategoryId: 'beds',
    name: 'King Size Steel Bed',
    description: 'Luxurious king size bed with headboard',
    price: 28000,
    images: ['/images/furniture-2.jpg'],
    features: ['King size frame', 'Designer headboard', 'Premium finish']
  },

  // Household Furniture - Chairs
  {
    id: 'chr-1',
    categoryId: 'household',
    subcategoryId: 'chairs',
    name: 'Dining Steel Chair',
    description: 'Comfortable dining chair with cushioned seat',
    price: 3500,
    images: ['/images/furniture-1.jpg'],
    features: ['Cushioned seat', 'Ergonomic design', 'Anti-rust coating']
  },
  {
    id: 'chr-2',
    categoryId: 'household',
    subcategoryId: 'chairs',
    name: 'Folding Steel Chair',
    description: 'Space-saving folding chair for versatile use',
    price: 2500,
    images: ['/images/furniture-2.jpg'],
    features: ['Foldable design', 'Compact storage', 'Portable']
  },
  {
    id: 'chr-3',
    categoryId: 'household',
    subcategoryId: 'chairs',
    name: 'Premium Steel Chair',
    description: 'High-end steel chair with premium cushioning',
    price: 4500,
    images: ['/images/furniture-1.jpg'],
    features: ['Premium cushioning', 'Stylish design', 'Extra comfort']
  },

  // Household Furniture - Tables
  {
    id: 'tbl-1',
    categoryId: 'household',
    subcategoryId: 'tables',
    name: 'Dining Table',
    description: '6-seater steel dining table',
    price: 12000,
    images: ['/images/furniture-2.jpg'],
    features: ['6 seater', 'Tempered glass top', 'Sturdy base']
  },
  {
    id: 'tbl-2',
    categoryId: 'household',
    subcategoryId: 'tables',
    name: 'Coffee Table',
    description: 'Modern steel coffee table with glass top',
    price: 8000,
    images: ['/images/furniture-1.jpg'],
    features: ['Glass top', 'Modern design', 'Lower shelf']
  },
  {
    id: 'tbl-3',
    categoryId: 'household',
    subcategoryId: 'tables',
    name: 'Side Table',
    description: 'Compact steel side table',
    price: 5000,
    images: ['/images/furniture-2.jpg'],
    features: ['Compact size', 'Multiple uses', 'Durable construction']
  },

  // Household Furniture - Storage Racks
  {
    id: 'rack-1',
    categoryId: 'household',
    subcategoryId: 'racks',
    name: 'Multipurpose Storage Rack',
    description: '5-tier storage rack for any room',
    price: 6000,
    images: ['/images/furniture-1.jpg'],
    features: ['5 tiers', 'Adjustable shelves', 'Heavy-duty']
  },
  {
    id: 'rack-2',
    categoryId: 'household',
    subcategoryId: 'racks',
    name: 'Kitchen Storage Rack',
    description: 'Specialized rack for kitchen storage',
    price: 7000,
    images: ['/images/furniture-2.jpg'],
    features: ['Kitchen specific', 'Rust-resistant', 'Easy cleaning']
  },
  {
    id: 'rack-3',
    categoryId: 'household',
    subcategoryId: 'racks',
    name: 'Corner Storage Rack',
    description: 'Space-efficient corner storage solution',
    price: 5500,
    images: ['/images/furniture-1.jpg'],
    features: ['Corner design', 'Space-saving', '4 tiers']
  },

  // Office Furniture - Desks
  {
    id: 'desk-1',
    categoryId: 'office',
    subcategoryId: 'desks',
    name: 'Executive Office Desk',
    description: 'Premium executive desk with drawers',
    price: 25000,
    images: ['/images/furniture-2.jpg'],
    features: ['Spacious top', 'Multiple drawers', 'Cable management']
  },
  {
    id: 'desk-2',
    categoryId: 'office',
    subcategoryId: 'desks',
    name: 'Computer Desk',
    description: 'Modern computer desk with keyboard tray',
    price: 18000,
    images: ['/images/furniture-1.jpg'],
    features: ['Keyboard tray', 'CPU holder', 'Cable management']
  },
  {
    id: 'desk-3',
    categoryId: 'office',
    subcategoryId: 'desks',
    name: 'Writing Desk',
    description: 'Simple steel writing desk',
    price: 15000,
    images: ['/images/furniture-2.jpg'],
    features: ['Clean design', 'Two drawers', 'Compact size']
  },

  // Office Furniture - Office Chairs
  {
    id: 'off-chr-1',
    categoryId: 'office',
    subcategoryId: 'chairs-office',
    name: 'Executive Office Chair',
    description: 'High-back executive chair with premium features',
    price: 12000,
    images: ['/images/furniture-1.jpg'],
    features: ['High back', 'Adjustable height', 'Premium cushioning']
  },
  {
    id: 'off-chr-2',
    categoryId: 'office',
    subcategoryId: 'chairs-office',
    name: 'Staff Chair',
    description: 'Comfortable mid-back office chair',
    price: 8000,
    images: ['/images/furniture-2.jpg'],
    features: ['Mid back', 'Ergonomic design', 'Wheels']
  },
  {
    id: 'off-chr-3',
    categoryId: 'office',
    subcategoryId: 'chairs-office',
    name: 'Visitor Chair',
    description: 'Steel visitor chair for office use',
    price: 5000,
    images: ['/images/furniture-1.jpg'],
    features: ['Fixed height', 'Stackable', 'Durable frame']
  },

  // Office Furniture - Filing Cabinets
  {
    id: 'file-1',
    categoryId: 'office',
    subcategoryId: 'filing',
    name: '4-Drawer Filing Cabinet',
    description: 'Vertical filing cabinet with 4 drawers',
    price: 15000,
    images: ['/images/furniture-2.jpg'],
    features: ['4 drawers', 'Lock system', 'Label holders']
  },
  {
    id: 'file-2',
    categoryId: 'office',
    subcategoryId: 'filing',
    name: 'Lateral Filing Cabinet',
    description: 'Wide lateral filing cabinet for large files',
    price: 18000,
    images: ['/images/furniture-1.jpg'],
    features: ['Wide design', '3 drawers', 'Anti-tilt mechanism']
  },
  {
    id: 'file-3',
    categoryId: 'office',
    subcategoryId: 'filing',
    name: 'Mobile Filing Cabinet',
    description: 'Mobile pedestal with wheels',
    price: 12000,
    images: ['/images/furniture-2.jpg'],
    features: ['Mobile design', '3 drawers', 'Lockable wheels']
  },

  // Office Furniture - Office Storage
  {
    id: 'store-1',
    categoryId: 'office',
    subcategoryId: 'storage',
    name: 'Bookshelf',
    description: 'Steel bookshelf for office use',
    price: 10000,
    images: ['/images/furniture-1.jpg'],
    features: ['5 shelves', 'Adjustable levels', 'Heavy-duty']
  },
  {
    id: 'store-2',
    categoryId: 'office',
    subcategoryId: 'storage',
    name: 'Storage Cabinet',
    description: 'Multi-purpose office storage cabinet',
    price: 16000,
    images: ['/images/furniture-2.jpg'],
    features: ['Double door', 'Adjustable shelves', 'Lock system']
  },
  {
    id: 'store-3',
    categoryId: 'office',
    subcategoryId: 'storage',
    name: 'Document Cabinet',
    description: 'Specialized cabinet for document storage',
    price: 14000,
    images: ['/images/furniture-1.jpg'],
    features: ['Multiple compartments', 'Dust protection', 'Security lock']
  },

  // Commercial Furniture - Lockers
  {
    id: 'lock-1',
    categoryId: 'commercial',
    subcategoryId: 'lockers',
    name: '6-Door Locker',
    description: 'Steel locker with 6 individual compartments',
    price: 20000,
    images: ['/images/furniture-2.jpg'],
    features: ['6 compartments', 'Individual locks', 'Ventilation']
  },
  {
    id: 'lock-2',
    categoryId: 'commercial',
    subcategoryId: 'lockers',
    name: '12-Door Locker',
    description: 'Large capacity 12-door locker system',
    price: 35000,
    images: ['/images/furniture-1.jpg'],
    features: ['12 compartments', 'Number plates', 'Master key system']
  },
  {
    id: 'lock-3',
    categoryId: 'commercial',
    subcategoryId: 'lockers',
    name: 'Staff Locker',
    description: 'Full-height staff locker with shelf',
    price: 12000,
    images: ['/images/furniture-2.jpg'],
    features: ['Full height', 'Internal shelf', 'Name plate holder']
  },

  // Commercial Furniture - Commercial Shelving
  {
    id: 'shelf-1',
    categoryId: 'commercial',
    subcategoryId: 'shelving',
    name: 'Heavy Duty Shelf',
    description: 'Industrial grade steel shelving',
    price: 25000,
    images: ['/images/furniture-1.jpg'],
    features: ['Heavy duty', 'Adjustable levels', 'High capacity']
  },
  {
    id: 'shelf-2',
    categoryId: 'commercial',
    subcategoryId: 'shelving',
    name: 'Warehouse Rack',
    description: 'Large warehouse storage system',
    price: 35000,
    images: ['/images/furniture-2.jpg'],
    features: ['Pallet compatible', 'Modular design', 'Industrial grade']
  },
  {
    id: 'shelf-3',
    categoryId: 'commercial',
    subcategoryId: 'shelving',
    name: 'Display Shelf',
    description: 'Retail display shelving unit',
    price: 18000,
    images: ['/images/furniture-1.jpg'],
    features: ['Attractive design', 'Adjustable shelves', 'Easy assembly']
  },

  // Commercial Furniture - Counters
  {
    id: 'count-1',
    categoryId: 'commercial',
    subcategoryId: 'counters',
    name: 'Reception Counter',
    description: 'Professional reception desk counter',
    price: 45000,
    images: ['/images/furniture-2.jpg'],
    features: ['L-shaped design', 'Storage space', 'Cable management']
  },
  {
    id: 'count-2',
    categoryId: 'commercial',
    subcategoryId: 'counters',
    name: 'Retail Counter',
    description: 'Point of sale counter for retail',
    price: 35000,
    images: ['/images/furniture-1.jpg'],
    features: ['Cash drawer space', 'Display shelf', 'Durable top']
  },
  {
    id: 'count-3',
    categoryId: 'commercial',
    subcategoryId: 'counters',
    name: 'Bar Counter',
    description: 'Commercial bar counter setup',
    price: 50000,
    images: ['/images/furniture-2.jpg'],
    features: ['Bottle storage', 'Work area', 'Easy cleaning']
  },

  // Commercial Furniture - Display Units
  {
    id: 'disp-1',
    categoryId: 'commercial',
    subcategoryId: 'display',
    name: 'Glass Display Cabinet',
    description: 'Steel frame glass display cabinet',
    price: 28000,
    images: ['/images/furniture-1.jpg'],
    features: ['Glass panels', 'LED lighting', 'Lockable doors']
  },
  {
    id: 'disp-2',
    categoryId: 'commercial',
    subcategoryId: 'display',
    name: 'Product Display Stand',
    description: 'Versatile product display unit',
    price: 15000,
    images: ['/images/furniture-2.jpg'],
    features: ['Adjustable height', 'Multiple tiers', 'Mobile design']
  },
  {
    id: 'disp-3',
    categoryId: 'commercial',
    subcategoryId: 'display',
    name: 'Wall Display Unit',
    description: 'Wall-mounted display system',
    price: 22000,
    images: ['/images/furniture-1.jpg'],
    features: ['Wall mounted', 'Modular design', 'LED compatible']
  }
];

// Get all products
export const getProducts = () => {
  try {
    const stored = localStorage.getItem('products');
    if (stored) {
      const products = JSON.parse(stored);
      return products.length > 0 ? products : defaultProducts;
    }
    return defaultProducts;
  } catch (error) {
    console.error('Error getting products:', error);
    return defaultProducts;
  }
};

// Save products to localStorage
export const saveProducts = (products) => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    return false;
  }
};

// Get products by category ID
export const getProductsByCategory = (categoryId) => {
  const products = getProducts();
  return products.filter(product => product.categoryId === categoryId);
};

// Get products by subcategory ID
export const getProductsBySubcategory = (categoryId, subcategoryId) => {
  const products = getProducts();
  return products.filter(
    product => product.categoryId === categoryId && product.subcategoryId === subcategoryId
  );
};

// Get product by ID
export const getProductById = (productId) => {
  const products = getProducts();
  return products.find(product => product.id === productId);
};
