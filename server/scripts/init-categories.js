/**
 * Initialize Database with Categories and Subcategories
 * 
 * This script creates initial categories and subcategories in the database.
 * Run this script after setting up the backend to populate the database.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// Initial categories and subcategories data
const initialData = [
  {
    category: {
      name: "Household Furniture",
      description: "Essential furniture for your home",
      displayOrder: 1
    },
    subcategories: [
      {
        name: "Almirahs & Wardrobes",
        description: "Storage furniture for clothes and belongings",
        displayOrder: 1
      },
      {
        name: "Beds",
        description: "Comfortable beds for your bedroom",
        displayOrder: 2
      },
      {
        name: "Chairs",
        description: "Seating furniture for your home",
        displayOrder: 3
      },
      {
        name: "Tables",
        description: "Tables for various household needs",
        displayOrder: 4
      },
      {
        name: "Storage Racks",
        description: "Organize your belongings with stylish storage solutions",
        displayOrder: 5
      }
    ]
  },
  {
    category: {
      name: "Office Furniture",
      description: "Professional furniture for offices",
      displayOrder: 2
    },
    subcategories: [
      {
        name: "Office Desks",
        description: "Work desks for productive office environments",
        displayOrder: 1
      },
      {
        name: "Office Chairs",
        description: "Ergonomic chairs for office use",
        displayOrder: 2
      },
      {
        name: "Filing Cabinets",
        description: "Organize your documents with secure filing solutions",
        displayOrder: 3
      },
      {
        name: "Office Storage",
        description: "Storage solutions for office equipment and supplies",
        displayOrder: 4
      }
    ]
  },
  {
    category: {
      name: "Commercial Furniture",
      description: "Furniture for businesses and institutions",
      displayOrder: 3
    },
    subcategories: [
      {
        name: "Lockers",
        description: "Secure storage for employees and customers",
        displayOrder: 1
      },
      {
        name: "Commercial Shelving",
        description: "Heavy-duty shelving for commercial use",
        displayOrder: 2
      },
      {
        name: "Counters",
        description: "Service counters for retail and business",
        displayOrder: 3
      },
      {
        name: "Display Units",
        description: "Showcase your products with stylish displays",
        displayOrder: 4
      }
    ]
  }
];

// Function to initialize the database
async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB Connected');
    
    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories > 0) {
      console.log(`Database already has ${existingCategories} categories. Skipping initialization.`);
      console.log('To force reinitialization, drop the collections first.');
      await mongoose.connection.close();
      return;
    }
    
    // Create categories and their subcategories
    for (const item of initialData) {
      // Create the category
      const newCategory = new Category(item.category);
      const savedCategory = await newCategory.save();
      console.log(`Created category: ${savedCategory.name} (${savedCategory._id})`);
      
      // Create the subcategories for this category
      for (const subData of item.subcategories) {
        const newSubcategory = new Subcategory({
          ...subData,
          categoryId: savedCategory._id
        });
        
        const savedSubcategory = await newSubcategory.save();
        console.log(`  Created subcategory: ${savedSubcategory.name} (${savedSubcategory._id})`);
      }
    }
    
    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the initialization
initializeDatabase();
