require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * This script initializes test data for the API
 * It's useful for testing without requiring an external MongoDB
 */

// Sample data
const categories = [
  {
    name: 'Beds',
    description: 'All types of beds and bedroom furniture'
  },
  {
    name: 'Tables',
    description: 'Dining tables, coffee tables, and more'
  },
  {
    name: 'Chairs',
    description: 'Chairs, stools, and seating furniture'
  },
  {
    name: 'Sofas',
    description: 'Living room sofas and sectionals'
  },
  {
    name: 'Storage',
    description: 'Cabinets, shelves, and storage solutions'
  }
];

const products = [
  {
    name: 'Steel King Size Bed',
    price: 24999,
    description: 'Premium king size steel bed with durable powder coating finish',
    features: ['Durable steel frame', 'Powder coated finish', 'Modern design', 'Easy assembly'],
    images: ['/uploads/bed1.jpg', '/uploads/bed2.jpg'],
    dimensions: {
      length: '210 cm',
      width: '180 cm',
      height: '90 cm'
    },
    material: 'Steel',
    colors: ['Black', 'Silver', 'White'],
    isAvailable: true
  },
  {
    name: 'Industrial Dining Table',
    price: 18999,
    description: 'Modern industrial dining table with steel legs and wooden top',
    features: ['Industrial design', 'Durable steel base', 'Solid wood top', 'Seats 6 people'],
    images: ['/uploads/table1.jpg', '/uploads/table2.jpg'],
    dimensions: {
      length: '180 cm',
      width: '90 cm',
      height: '75 cm'
    },
    material: 'Steel and Wood',
    colors: ['Natural', 'Black'],
    isAvailable: true
  },
  {
    name: 'Steel Dining Chair Set',
    price: 12999,
    description: 'Set of 4 modern steel dining chairs with comfortable cushions',
    features: ['Set of 4', 'Ergonomic design', 'Soft cushions', 'Non-slip feet'],
    images: ['/uploads/chair1.jpg', '/uploads/chair2.jpg'],
    dimensions: {
      length: '45 cm',
      width: '45 cm',
      height: '90 cm'
    },
    material: 'Steel and Fabric',
    colors: ['Grey', 'Black', 'Blue'],
    isAvailable: true
  }
];

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
};

// Create sample image files for testing
const createSampleImages = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const imageNames = [
    'bed1.jpg', 'bed2.jpg', 
    'table1.jpg', 'table2.jpg', 
    'chair1.jpg', 'chair2.jpg'
  ];
  
  // Create empty image files for testing
  imageNames.forEach(name => {
    const filePath = path.join(uploadsDir, name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, ''); // Create an empty file
      console.log(`Created sample image: ${name}`);
    }
  });
};

// Connect to MongoDB (try real DB first, fall back to memory server)
const connectDB = async () => {
  try {
    // Try connecting to the configured MongoDB first
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      console.log('Could not connect to configured MongoDB, using in-memory MongoDB');
      
      // Use in-memory MongoDB server instead
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Main function to initialize test data
const initTestData = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Create upload directory and sample images
    ensureUploadsDir();
    createSampleImages();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    // Create admin user if it doesn't exist
    const existingAdmin = await User.findOne({ email: '9814379071' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('M@nishsteel', salt);
      
      await User.create({
        name: 'Manish Steel Admin',
        email: '9814379071', // Using phone as email for backward compatibility
        password: hashedPassword,
        role: 'admin',
        phone: '9814379071'
      });
      console.log('Created admin user');
    }
    
    // Create categories
    console.log('Creating categories...');
    const categoryDocs = await Category.insertMany(categories);
    
    // Map category names to their IDs
    const categoryMap = {};
    categoryDocs.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Create products with proper category IDs
    console.log('Creating products...');
    const productsWithCategories = products.map(product => {
      // Assign proper category IDs based on product name
      if (product.name.includes('Bed')) {
        product.categoryId = categoryMap['Beds'];
      } else if (product.name.includes('Table')) {
        product.categoryId = categoryMap['Tables'];
      } else if (product.name.includes('Chair')) {
        product.categoryId = categoryMap['Chairs'];
      } else if (product.name.includes('Sofa')) {
        product.categoryId = categoryMap['Sofas'];
      } else {
        product.categoryId = categoryMap['Storage'];
      }
      
      return product;
    });
    
    await Product.insertMany(productsWithCategories);
    
    console.log('Test data initialized successfully!');
    console.log(`- Added ${categoryDocs.length} categories`);
    console.log(`- Added ${productsWithCategories.length} products`);
    
  } catch (err) {
    console.error('Error initializing test data:', err);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the initialization
initTestData();
