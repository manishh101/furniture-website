const mongoose = require('mongoose');
const Category = require('../models/Category');

const sampleCategories = [
    {
        name: 'Household Furniture',
        description: 'Essential furniture for your home',
        subcategories: ['Almirahs & Wardrobes', 'Beds', 'Chairs', 'Tables', 'Storage Racks']
    },
    {
        name: 'Office Furniture',
        description: 'Professional furniture for offices',
        subcategories: ['Office Desks', 'Office Chairs', 'Filing Cabinets', 'Office Storage']
    },
    {
        name: 'Commercial Furniture',
        description: 'Furniture for businesses and institutions',
        subcategories: ['Lockers', 'Commercial Shelving', 'Counters', 'Display Units']
    }
];

const seedCategories = async () => {
    try {
        const forceReseed = process.env.FORCE_RESEED === 'true';
        
        // Check if categories already exist
        const existingCategories = await Category.find({});
        
        if (!forceReseed && existingCategories.length >= 3) {
            console.log('✅ Categories already exist - skipping category seeding');
            console.log(`📊 Found ${existingCategories.length} existing categories`);
            return existingCategories;
        }
        
        if (forceReseed) {
            console.log('🔄 FORCE_RESEED enabled - reseeding categories...');
        } else {
            console.log('🔄 Seeding categories...');
        }
        
        // Clear existing categories only if forced or insufficient categories
        if (forceReseed || existingCategories.length < 3) {
            await Category.deleteMany({});
            console.log('Cleared existing categories');
        }
        
        // Insert categories
        const result = await Category.insertMany(sampleCategories);
        console.log(`Successfully added ${result.length} sample categories`);
        
        return result;
    } catch (error) {
        console.error('Error seeding categories:', error);
        return [];
    }
};

module.exports = seedCategories;
