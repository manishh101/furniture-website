require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
    return true;
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    process.exit(1);
  }
};

// Read JSON data files
const readDataFile = (filename) => {
  try {
    const dataPath = path.join(__dirname, filename);
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath);
      return JSON.parse(rawData);
    } else {
      console.log(`File ${filename} not found`);
      return null;
    }
  } catch (err) {
    console.error(`Error reading file ${filename}:`, err);
    return null;
  }
};

// Migrate categories
const migrateCategories = async () => {
  try {
    const categoriesData = readDataFile('categories-export.json');
    if (!categoriesData) return {};
    
    console.log(`Migrating ${categoriesData.length} categories...`);
    
    const categoryMap = {};
    
    // First pass - create all categories
    for (const category of categoriesData) {
      const newCategory = new Category({
        name: category.name,
        description: category.description || '',
        // Don't set parentId yet
      });
      
      const savedCategory = await newCategory.save();
      categoryMap[category.id] = savedCategory._id;
    }
    
    // Second pass - update parent relationships
    for (const category of categoriesData) {
      if (category.parentId && categoryMap[category.parentId]) {
        await Category.findByIdAndUpdate(
          categoryMap[category.id],
          { parentId: categoryMap[category.parentId] }
        );
      }
    }
    
    console.log('Categories migrated successfully');
    return categoryMap;
  } catch (err) {
    console.error('Error migrating categories:', err);
    return {};
  }
};

// Migrate products
const migrateProducts = async (categoryMap) => {
  try {
    const productsData = readDataFile('products-export.json');
    if (!productsData) return;
    
    console.log(`Migrating ${productsData.length} products...`);
    
    for (const product of productsData) {
      // Skip if product doesn't have required fields
      if (!product.name || !product.categoryId) {
        console.log(`Skipping product ${product.id || 'unknown'} due to missing required fields`);
        continue;
      }
      
      const newProduct = new Product({
        name: product.name,
        price: product.price || 0,
        description: product.description || '',
        categoryId: categoryMap[product.categoryId] || null,
        subcategoryId: product.subcategoryId ? categoryMap[product.subcategoryId] : null,
        features: product.features || [],
        images: product.images || [],
        dimensions: product.dimensions || {},
        material: product.material || '',
        colors: product.colors || [],
        isAvailable: product.isAvailable !== false,
        dateAdded: product.dateAdded ? new Date(product.dateAdded) : new Date()
      });
      
      await newProduct.save();
    }
    
    console.log('Products migrated successfully');
  } catch (err) {
    console.error('Error migrating products:', err);
  }
};

// Main migration function
const migrate = async () => {
  console.log('Starting migration...');
  
  const connected = await connectDB();
  if (!connected) return;
  
  // Check if we have existing data that might be overwritten
  const existingCategoriesCount = await Category.countDocuments();
  const existingProductsCount = await Product.countDocuments();
  
  if (existingCategoriesCount > 0 || existingProductsCount > 0) {
    console.warn('WARNING: Database already contains data:');
    console.warn(`- ${existingCategoriesCount} categories`);
    console.warn(`- ${existingProductsCount} products`);
    console.warn('Migration may cause duplicate or conflicting data.');
    
    // In a real application, you might want to prompt for confirmation here
    console.warn('Proceeding with migration anyway...');
  }
  
  // Perform migration
  const categoryMap = await migrateCategories();
  await migrateProducts(categoryMap);
  
  console.log('Migration complete!');
  mongoose.disconnect();
};

// Run the migration
migrate();
