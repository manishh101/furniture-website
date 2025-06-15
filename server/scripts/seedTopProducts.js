/**
 * Database Seeder for Top Products and Most Selling Products
 * This script will add featured status and sales count to existing products
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Sample data for updating products
const sampleUpdates = [
  {
    searchName: 'office chair',
    updates: { featured: true, salesCount: 250, rating: 4.8, reviewCount: 45, stock: 25 }
  },
  {
    searchName: 'executive desk',
    updates: { featured: true, salesCount: 180, rating: 4.7, reviewCount: 32, stock: 15 }
  },
  {
    searchName: 'almirah',
    updates: { featured: true, salesCount: 320, rating: 4.9, reviewCount: 68, stock: 40 }
  },
  {
    searchName: 'filing cabinet',
    updates: { salesCount: 420, rating: 4.6, reviewCount: 89, stock: 30 }
  },
  {
    searchName: 'table',
    updates: { salesCount: 380, rating: 4.5, reviewCount: 76, stock: 50 }
  },
  {
    searchName: 'bookshelf',
    updates: { featured: true, salesCount: 150, rating: 4.4, reviewCount: 28, stock: 35 }
  },
  {
    searchName: 'wardrobe',
    updates: { salesCount: 290, rating: 4.7, reviewCount: 54, stock: 20 }
  },
  {
    searchName: 'locker',
    updates: { salesCount: 210, rating: 4.3, reviewCount: 41, stock: 60 }
  },
  {
    searchName: 'rack',
    updates: { featured: true, salesCount: 340, rating: 4.8, reviewCount: 63, stock: 45 }
  },
  {
    searchName: 'cabinet',
    updates: { salesCount: 195, rating: 4.5, reviewCount: 37, stock: 28 }
  }
];

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    // Load environment variables
    require('dotenv').config();
    
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/manish-steel-furniture';
    console.log('Attempting to connect to MongoDB:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

/**
 * Seed the database with sample product updates
 */
const seedProducts = async () => {
  try {
    console.log('Starting product seeding...');
    
    // Get all products
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} existing products`);
    
    let updatedCount = 0;
    
    for (const updateData of sampleUpdates) {
      // Find products that match the search criteria
      const matchingProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(updateData.searchName.toLowerCase()) ||
        product.description.toLowerCase().includes(updateData.searchName.toLowerCase())
      );
      
      console.log(`Found ${matchingProducts.length} products matching "${updateData.searchName}"`);
      
      // Update the first matching product
      if (matchingProducts.length > 0) {
        const productToUpdate = matchingProducts[0];
        
        await Product.findByIdAndUpdate(
          productToUpdate._id,
          {
            $set: {
              ...updateData.updates,
              // Add some price variation for demonstration
              originalPrice: updateData.updates.salesCount > 300 ? 
                Math.round(productToUpdate.price * 1.2) : undefined
            }
          }
        );
        
        console.log(`✅ Updated "${productToUpdate.name}" with:`, updateData.updates);
        updatedCount++;
      } else {
        console.log(`❌ No products found matching "${updateData.searchName}"`);
      }
    }
    
    // If we don't have enough products, create some sample ones
    if (allProducts.length < 10) {
      console.log('Creating additional sample products...');
      
      const sampleProducts = [
        {
          name: 'Executive Steel Office Chair',
          price: 15000,
          description: 'Comfortable executive chair with adjustable height and lumbar support',
          image: '/images/office-chair-1.jpg',
          featured: true,
          salesCount: 180,
          rating: 4.7,
          reviewCount: 34,
          stock: 25,
          category: 'Office Furniture',
          material: 'Steel Frame with Cushioned Seat'
        },
        {
          name: '3-Door Steel Almirah',
          price: 25000,
          description: 'Spacious 3-door almirah perfect for bedroom storage',
          image: '/images/almirah-1.jpg',
          featured: true,
          salesCount: 320,
          rating: 4.9,
          reviewCount: 67,
          stock: 15,
          category: 'Household Furniture',
          material: 'Heavy Duty Steel'
        },
        {
          name: 'Modular Office Desk',
          price: 18000,
          description: 'Modern modular desk with multiple compartments and drawers',
          image: '/images/office-desk-1.jpg',
          featured: true,
          salesCount: 150,
          rating: 4.6,
          reviewCount: 28,
          stock: 30,
          category: 'Office Furniture',
          material: 'Steel Frame with Wooden Top'
        },
        {
          name: '4-Drawer Filing Cabinet',
          price: 12000,
          description: 'Professional filing cabinet with secure locking system',
          image: '/images/filing-cabinet-1.jpg',
          salesCount: 420,
          rating: 4.5,
          reviewCount: 89,
          stock: 40,
          category: 'Office Furniture',
          material: 'Cold Rolled Steel'
        },
        {
          name: 'Heavy Duty Storage Rack',
          price: 8000,
          description: 'Multi-tier storage rack for warehouse and industrial use',
          image: '/images/storage-rack-1.jpg',
          featured: true,
          salesCount: 340,
          rating: 4.8,
          reviewCount: 63,
          stock: 50,
          category: 'Commercial Furniture',
          material: 'Galvanized Steel'
        },
        {
          name: 'Steel Bookshelf Unit',
          price: 10000,
          description: '5-tier bookshelf perfect for home and office use',
          image: '/images/bookshelf-1.jpg',
          featured: true,
          salesCount: 220,
          rating: 4.4,
          reviewCount: 41,
          stock: 35,
          category: 'Household Furniture',
          material: 'Powder Coated Steel'
        }
      ];
      
      for (const productData of sampleProducts) {
        const existingProduct = await Product.findOne({ name: productData.name });
        if (!existingProduct) {
          await Product.create(productData);
          console.log(`✅ Created sample product: "${productData.name}"`);
          updatedCount++;
        }
      }
    }
    
    // Generate some random sales data for remaining products
    const remainingProducts = await Product.find({ 
      salesCount: { $exists: false } 
    }).limit(20);
    
    for (const product of remainingProducts) {
      const randomSales = Math.floor(Math.random() * 200) + 50; // 50-250 sales
      const randomRating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5-5.0 rating
      const randomReviews = Math.floor(Math.random() * 50) + 10; // 10-60 reviews
      const randomStock = Math.floor(Math.random() * 80) + 20; // 20-100 stock
      
      await Product.findByIdAndUpdate(product._id, {
        $set: {
          salesCount: randomSales,
          rating: parseFloat(randomRating),
          reviewCount: randomReviews,
          stock: randomStock
        }
      });
      
      updatedCount++;
    }
    
    console.log(`\n🎉 Seeding completed! Updated ${updatedCount} products.`);
    
    // Show summary
    const featuredCount = await Product.countDocuments({ featured: true });
    const totalProducts = await Product.countDocuments({});
    const avgSalesCount = await Product.aggregate([
      { $group: { _id: null, avgSales: { $avg: '$salesCount' } } }
    ]);
    
    console.log('\n📊 Database Summary:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Featured products: ${featuredCount}`);
    console.log(`Average sales count: ${Math.round(avgSalesCount[0]?.avgSales || 0)}`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

/**
 * Main function
 */
const main = async () => {
  await connectDB();
  await seedProducts();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed.');
  process.exit(0);
};

// Run the seeder
if (require.main === module) {
  main().catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
}

module.exports = { seedProducts };
