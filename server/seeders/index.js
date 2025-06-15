const seedCategories = require('./categorySeeder');
const seedSubcategories = require('./subcategorySeeder');
const seedProducts = require('./productSeeder');
const seedAdminUser = require('./adminSeeder');
const seedGallery = require('./gallerySeeder');

const runSeeders = async () => {
    try {
        console.log('Starting database seeding process...');
        
        // First create admin user
        await seedAdminUser();
        
        // First seed categories
        const categories = await seedCategories();
        console.log(`Categories seeding completed. Created ${categories.length} categories.`);
        
        // Then seed subcategories
        const subcategories = await seedSubcategories();
        console.log(`Subcategories seeding completed. Created ${subcategories.length} subcategories.`);
        
        // Then seed products with category relationships
        if (categories.length > 0) {
            await seedProducts();
            console.log('Products seeding completed.');
        } else {
            console.warn('Products seeding skipped - no categories available.');
        }
        
        // Seed gallery data
        await seedGallery();
        console.log('Gallery seeding completed.');
        
        console.log('All seeds completed successfully');
    } catch (error) {
        console.error('Error running seeds:', error);
    }
};

module.exports = runSeeders;
