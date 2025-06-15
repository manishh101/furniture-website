const mongoose = require('mongoose');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const seedSubcategories = async () => {
    try {
        const forceReseed = process.env.FORCE_RESEED === 'true';
        
        // Check if subcategories already exist
        const existingSubcategories = await Subcategory.find({});
        
        if (!forceReseed && existingSubcategories.length >= 13) {
            console.log('✅ Subcategories already exist - skipping subcategory seeding');
            console.log(`📊 Found ${existingSubcategories.length} existing subcategories`);
            return existingSubcategories;
        }
        
        if (forceReseed) {
            console.log('🔄 FORCE_RESEED enabled - reseeding subcategories...');
        } else {
            console.log('🔄 Seeding subcategories...');
        }
        
        // Clear existing subcategories only if forced or insufficient subcategories
        if (forceReseed || existingSubcategories.length < 13) {
            await Subcategory.deleteMany({});
            console.log('Cleared existing subcategories');
        }
        
        // Get all categories from the database
        const categories = await Category.find();
        console.log(`Found ${categories.length} categories for subcategory mapping`);
        
        // Map of category names to subcategory arrays
        const subcategoryMap = {
            'Household Furniture': ['Almirahs & Wardrobes', 'Beds', 'Chairs', 'Tables', 'Storage Racks'],
            'Office Furniture': ['Office Desks', 'Office Chairs', 'Filing Cabinets', 'Office Storage'],
            'Commercial Furniture': ['Lockers', 'Commercial Shelving', 'Counters', 'Display Units']
        };
        
        // Create subcategories for each category
        const subcategories = [];
        for (const category of categories) {
            const subcategoryNames = subcategoryMap[category.name] || [];
            
            for (let i = 0; i < subcategoryNames.length; i++) {
                subcategories.push({
                    name: subcategoryNames[i],
                    categoryId: category._id,
                    displayOrder: i
                });
            }
        }
        
        // Insert all subcategories
        console.log(`Attempting to insert ${subcategories.length} subcategories:`, subcategories);
        const result = await Subcategory.insertMany(subcategories);
        console.log(`Successfully added ${result.length} subcategories`);
        
        return result;
    } catch (error) {
        console.error('Error seeding subcategories:', error);
        return [];
    }
};

module.exports = seedSubcategories;
