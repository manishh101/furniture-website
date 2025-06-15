const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Cloudinary image URLs for production use
const cloudinaryImages = {
  furniture1: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749813218/manish-steel/products/furniture-1.jpg',
  furniture2: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749813220/manish-steel/products/furniture-2.jpg',
  variant1: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749815348/manish-steel/products/furniture-variant-1.jpg',
  variant2: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749815350/manish-steel/products/furniture-variant-2.jpg',
  variant3: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749815355/manish-steel/products/furniture-variant-3.jpg',
  detail1: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749815360/manish-steel/products/furniture-detail-1.jpg',
  detail2: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749815362/manish-steel/products/furniture-detail-2.jpg',
  detail3: 'https://res.cloudinary.com/dwrrja8cz/image/upload/v1749815364/manish-steel/products/furniture-detail-3.jpg'
};

const sampleProducts = [
  // Household Furniture - Almirahs & Wardrobes (3 products)
  {
    name: 'Steel Double Door Wardrobe',
    price: 29999,
    description: 'Spacious double door wardrobe with mirror and lock system',
    features: ['Mirror on door', 'Lock system', 'Multiple shelves', 'Hanging rod'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Almirahs & Wardrobes'
  },
  {
    name: 'Steel Filing Cabinet Wardrobe',
    price: 24999,
    description: 'Modern wardrobe with built-in filing system',
    features: ['File organization', 'Multiple drawers', 'Secure locking'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Almirahs & Wardrobes'
  },
  {
    name: 'Steel Sliding Door Almirah',
    price: 34999,
    description: 'Space-saving sliding door almirah with compartments',
    features: ['Sliding doors', 'Multiple compartments', 'Modern design'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Almirahs & Wardrobes'
  },

  // Household Furniture - Beds (3 products)
  {
    name: 'Steel King Size Bed',
    price: 27999,
    description: 'Premium king size steel bed with storage',
    features: ['Under-bed storage', 'Powder coated finish', 'Durable frame'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Beds'
  },
  {
    name: 'Steel Single Bed',
    price: 18999,
    description: 'Compact single bed with headboard',
    features: ['Space-saving design', 'Strong support', 'Modern look'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Beds'
  },
  {
    name: 'Steel Queen Size Bed',
    price: 23999,
    description: 'Elegant queen size bed with steel frame',
    features: ['Queen size frame', 'Elegant design', 'Sturdy construction'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Beds'
  },

  // Household Furniture - Chairs (3 products)
  {
    name: 'Steel Dining Chair',
    price: 3499,
    description: 'Comfortable dining chair with cushioned seat',
    features: ['Cushioned seat', 'Ergonomic design', 'Anti-rust coating'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Chairs'
  },
  {
    name: 'Steel Folding Chair',
    price: 2499,
    description: 'Space-saving folding chair for versatile use',
    features: ['Foldable design', 'Compact storage', 'Portable'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Chairs'
  },
  {
    name: 'Premium Steel Chair',
    price: 4499,
    description: 'High-end steel chair with premium cushioning',
    features: ['Premium cushioning', 'Stylish design', 'Extra comfort'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Chairs'
  },

  // Household Furniture - Tables (3 products)
  {
    name: 'Steel Dining Table',
    price: 12999,
    description: '6-seater steel dining table with glass top',
    features: ['6 seater', 'Tempered glass top', 'Sturdy base'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Tables'
  },
  {
    name: 'Steel Coffee Table',
    price: 7999,
    description: 'Modern steel coffee table with glass top',
    features: ['Glass top', 'Modern design', 'Lower shelf'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Tables'
  },
  {
    name: 'Steel Study Table',
    price: 5999,
    description: 'Compact steel study table with drawer',
    features: ['Compact size', 'Storage drawer', 'Durable construction'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Tables'
  },

  // Household Furniture - Storage Racks (3 products)
  {
    name: 'Multipurpose Storage Rack',
    price: 5999,
    description: '5-tier storage rack for any room',
    features: ['5 tiers', 'Adjustable shelves', 'Heavy-duty'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Storage Racks'
  },
  {
    name: 'Kitchen Storage Rack',
    price: 6999,
    description: 'Specialized rack for kitchen storage',
    features: ['Kitchen specific', 'Rust-resistant', 'Easy cleaning'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Household Furniture',
    subcategory: 'Storage Racks'
  },
  {
    name: 'Corner Storage Rack',
    price: 5499,
    description: 'Space-efficient corner storage solution',
    features: ['Corner design', 'Space-saving', '4 tiers'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Household Furniture',
    subcategory: 'Storage Racks'
  },

  // Office Furniture - Office Desks (3 products)
  {
    name: 'Executive Steel Desk',
    price: 24999,
    description: 'Premium executive desk with drawers',
    features: ['Cable management', 'Lockable drawers', 'Large workspace'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Office Furniture',
    subcategory: 'Office Desks'
  },
  {
    name: 'Steel Computer Desk',
    price: 17999,
    description: 'Modern computer desk with keyboard tray',
    features: ['Keyboard tray', 'Monitor stand', 'Wire management'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Office Furniture',
    subcategory: 'Office Desks'
  },
  {
    name: 'Compact Office Desk',
    price: 14999,
    description: 'Space-saving desk for small offices',
    features: ['Clean design', 'Two drawers', 'Compact size'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Office Furniture',
    subcategory: 'Office Desks'
  },

  // Office Furniture - Office Chairs (3 products)
  {
    name: 'Executive Office Chair',
    price: 11999,
    description: 'High-back executive chair with premium features',
    features: ['High back', 'Adjustable height', 'Premium cushioning'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Office Furniture',
    subcategory: 'Office Chairs'
  },
  {
    name: 'Staff Office Chair',
    price: 7999,
    description: 'Comfortable mid-back office chair',
    features: ['Mid back', 'Ergonomic design', 'Wheels'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Office Furniture',
    subcategory: 'Office Chairs'
  },
  {
    name: 'Visitor Office Chair',
    price: 4999,
    description: 'Steel visitor chair for office use',
    features: ['Fixed height', 'Stackable', 'Durable frame'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Office Furniture',
    subcategory: 'Office Chairs'
  },

  // Office Furniture - Filing Cabinets (3 products)
  {
    name: '4-Drawer Filing Cabinet',
    price: 14999,
    description: 'Vertical filing cabinet with 4 drawers',
    features: ['4 drawers', 'Lock system', 'Label holders'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Office Furniture',
    subcategory: 'Filing Cabinets'
  },
  {
    name: 'Lateral Filing Cabinet',
    price: 17999,
    description: 'Wide lateral filing cabinet for large files',
    features: ['Wide design', '3 drawers', 'Anti-tilt mechanism'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Office Furniture',
    subcategory: 'Filing Cabinets'
  },
  {
    name: 'Mobile Filing Cabinet',
    price: 11999,
    description: 'Mobile pedestal with wheels',
    features: ['Mobile design', '3 drawers', 'Lockable wheels'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Office Furniture',
    subcategory: 'Filing Cabinets'
  },

  // Office Furniture - Office Storage (3 products)
  {
    name: 'Steel Bookshelf',
    price: 9999,
    description: 'Steel bookshelf for office use',
    features: ['5 shelves', 'Adjustable levels', 'Heavy-duty'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Office Furniture',
    subcategory: 'Office Storage'
  },
  {
    name: 'Office Storage Cabinet',
    price: 15999,
    description: 'Multi-purpose office storage cabinet',
    features: ['Double door', 'Adjustable shelves', 'Lock system'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Office Furniture',
    subcategory: 'Office Storage'
  },
  {
    name: 'Document Storage Cabinet',
    price: 13999,
    description: 'Specialized cabinet for document storage',
    features: ['Multiple compartments', 'Dust protection', 'Security lock'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Office Furniture',
    subcategory: 'Office Storage'
  },

  // Commercial Furniture - Lockers (3 products)
  {
    name: '6-Door Steel Locker',
    price: 19999,
    description: 'Multi-compartment locker for staff rooms',
    features: ['Individual locks', 'Ventilation', 'Name plate holders'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Commercial Furniture',
    subcategory: 'Lockers'
  },
  {
    name: 'Steel Gym Locker',
    price: 24999,
    description: 'Heavy-duty gym locker with multiple compartments',
    features: ['Anti-rust coating', 'Secure locking', 'Ventilated design'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Commercial Furniture',
    subcategory: 'Lockers'
  },
  {
    name: '12-Door Staff Locker',
    price: 34999,
    description: 'Large capacity 12-door locker system',
    features: ['12 compartments', 'Number plates', 'Master key system'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Commercial Furniture',
    subcategory: 'Lockers'
  },

  // Commercial Furniture - Commercial Shelving (3 products)
  {
    name: 'Heavy Duty Warehouse Shelf',
    price: 24999,
    description: 'Industrial grade steel shelving',
    features: ['Heavy duty', 'Adjustable levels', 'High capacity'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Commercial Furniture',
    subcategory: 'Commercial Shelving'
  },
  {
    name: 'Warehouse Storage Rack',
    price: 34999,
    description: 'Large warehouse storage system',
    features: ['Pallet compatible', 'Modular design', 'Industrial grade'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Commercial Furniture',
    subcategory: 'Commercial Shelving'
  },
  {
    name: 'Retail Display Shelf',
    price: 17999,
    description: 'Retail display shelving unit',
    features: ['Attractive design', 'Adjustable shelves', 'Easy assembly'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Commercial Furniture',
    subcategory: 'Commercial Shelving'
  },

  // Commercial Furniture - Counters (3 products)
  {
    name: 'Reception Counter',
    price: 44999,
    description: 'Professional reception desk counter',
    features: ['L-shaped design', 'Storage space', 'Cable management'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Commercial Furniture',
    subcategory: 'Counters'
  },
  {
    name: 'Retail Checkout Counter',
    price: 34999,
    description: 'Point of sale counter for retail',
    features: ['Cash drawer space', 'Display shelf', 'Durable top'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Commercial Furniture',
    subcategory: 'Counters'
  },
  {
    name: 'Bar Counter',
    price: 49999,
    description: 'Commercial bar counter setup',
    features: ['Bottle storage', 'Work area', 'Easy cleaning'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Commercial Furniture',
    subcategory: 'Counters'
  },

  // Commercial Furniture - Display Units (3 products)
  {
    name: 'Glass Display Cabinet',
    price: 27999,
    description: 'Steel frame glass display cabinet',
    features: ['Glass panels', 'LED lighting', 'Lockable doors'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Commercial Furniture',
    subcategory: 'Display Units'
  },
  {
    name: 'Product Display Stand',
    price: 14999,
    description: 'Versatile product display unit',
    features: ['Adjustable height', 'Multiple tiers', 'Mobile design'],
    image: cloudinaryImages.furniture1,
    images: [cloudinaryImages.furniture1, cloudinaryImages.variant1, cloudinaryImages.variant2, cloudinaryImages.variant3],
    category: 'Commercial Furniture',
    subcategory: 'Display Units'
  },
  {
    name: 'Wall Display Unit',
    price: 21999,
    description: 'Wall-mounted display system',
    features: ['Wall mounted', 'Modular design', 'LED compatible'],
    image: cloudinaryImages.furniture2,
    images: [cloudinaryImages.furniture2, cloudinaryImages.detail1, cloudinaryImages.detail2, cloudinaryImages.detail3],
    category: 'Commercial Furniture',
    subcategory: 'Display Units'
  }
];

const seedProducts = async () => {
    try {
        const forceReseed = process.env.FORCE_RESEED === 'true';
        
        // Check if products already exist with Cloudinary images
        const existingProducts = await Product.find({});
        const hasCloudinaryProducts = existingProducts.some(product => 
            product.image && product.image.includes('cloudinary.com')
        );
        
        // More stringent check - ensure we have enough products and they all use Cloudinary
        if (!forceReseed && hasCloudinaryProducts && existingProducts.length >= 39) {
            console.log('✅ Products already exist with Cloudinary images - skipping seeding');
            console.log(`📊 Found ${existingProducts.length} existing products`);
            
            // Double-check that ALL products use Cloudinary (not just some)
            const cloudinaryProductCount = await Product.countDocuments({ 
                image: { $regex: 'cloudinary.com' } 
            });
            const localProductCount = await Product.countDocuments({ 
                image: { $regex: '/images/' } 
            });
            
            console.log(`   - Products with Cloudinary images: ${cloudinaryProductCount}`);
            console.log(`   - Products with local images: ${localProductCount}`);
            
            if (localProductCount > 0) {
                console.log('⚠️ WARNING: Some products still use local images. Consider running migration script.');
            }
            
            return existingProducts;
        }
        
        if (forceReseed) {
            console.log('🔄 FORCE_RESEED enabled - reseeding products with Cloudinary images...');
        } else {
            console.log('🔄 Seeding products with Cloudinary images...');
        }
        
        // Only clear products if they don't have Cloudinary images or if we have too few products or if forced
        if (forceReseed || !hasCloudinaryProducts || existingProducts.length < 39) {
            await Product.deleteMany({});
            console.log('Cleared existing products (forced reseed, local images, or insufficient count)');
        }
        
        // Get categories from database
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories for product mapping`);
        
        if (categories.length === 0) {
            console.error('No categories found. Please seed categories first');
            return;
        }
        
        // Map products to categories and subcategories
        const productsWithCategories = [];
        
        for (const product of sampleProducts) {
            // Find matching category
            const category = categories.find(c => c.name === product.category);
            if (!category) {
                console.warn(`No category found for product ${product.name}`);
                continue;
            }
            
            // Find matching subcategory within the category's subcategories array
            const subcategoryName = product.subcategory;
            let subcategoryId = null;
            
            if (subcategoryName && category.subcategories && Array.isArray(category.subcategories)) {
                const subcategoryIndex = category.subcategories.findIndex(sub => 
                    (typeof sub === 'string' && sub === subcategoryName) || 
                    (sub.name && sub.name === subcategoryName)
                );
                
                if (subcategoryIndex !== -1) {
                    console.log(`Matched subcategory "${subcategoryName}" for product "${product.name}"`);
                    
                    // Create a unique subcategory ID based on category ID and subcategory name
                    // This ensures consistent IDs for subcategories
                    subcategoryId = new mongoose.Types.ObjectId();
                }
            }
            
            // Add product with proper references
            productsWithCategories.push({
                ...product,
                categoryId: category._id,
                subcategoryId: subcategoryId
            });
            
            console.log(`Added product "${product.name}" with category: ${category.name}, subcategory: ${subcategoryName}`);
        }

        // Insert products
        if (productsWithCategories.length > 0) {
            const insertedProducts = await Product.insertMany(productsWithCategories);
            console.log(`Successfully added ${insertedProducts.length} sample products`);
        } else {
            console.warn('No products created - check category mapping');
        }
    } catch (error) {
        console.error('Error seeding products:', error);
    }
};

module.exports = seedProducts;
