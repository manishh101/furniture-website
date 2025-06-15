const { GallerySection, GalleryConfig } = require('../models/Gallery');

const seedGallery = async () => {
  try {
    console.log('🎨 Starting gallery seeding...');

    // Create default gallery configuration
    const defaultConfig = {
      title: 'Our Gallery',
      subtitle: 'Discover our craftsmanship through stunning visuals',
      layout: 'grid',
      showFilters: true,
      showStats: true,
      heroImage: null
    };

    let config = await GalleryConfig.findOne();
    if (!config) {
      config = await GalleryConfig.create(defaultConfig);
      console.log('✅ Gallery configuration created');
    } else {
      console.log('ℹ️ Gallery configuration already exists');
    }

    // Check if gallery sections already exist
    const existingSections = await GallerySection.countDocuments();
    if (existingSections > 0) {
      console.log(`ℹ️ Gallery already has ${existingSections} sections, skipping seeding`);
      return;
    }

    // Create default gallery sections with placeholder images
    const placeholderImage = 'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Gallery+Image';
    
    const gallerySections = [
      {
        name: 'Household Furniture',
        description: 'Elegant and functional furniture pieces designed for modern homes',
        category: 'residential',
        featured: true,
        order: 1,
        images: [
          {
            title: 'Modern Living Room Set',
            description: 'Contemporary sofa set with premium upholstery',
            src: placeholderImage,
            alt: 'Modern living room furniture set',
            category: 'household',
            featured: true,
            tags: ['furniture', 'living room', 'modern'],
            order: 0
          },
          {
            title: 'Dining Table Collection',
            description: 'Stylish dining tables for family gatherings',
            src: placeholderImage,
            alt: 'Dining table and chairs',
            category: 'household',
            featured: true,
            tags: ['furniture', 'dining', 'table'],
            order: 1
          },
          {
            title: 'Bedroom Furniture',
            description: 'Complete bedroom sets for ultimate comfort',
            src: placeholderImage,
            alt: 'Bedroom furniture set',
            category: 'household',
            featured: false,
            tags: ['furniture', 'bedroom', 'comfort'],
            order: 2
          },
          {
            title: 'Storage Solutions',
            description: 'Smart storage options for organized living',
            src: placeholderImage,
            alt: 'Storage furniture solutions',
            category: 'household',
            featured: false,
            tags: ['furniture', 'storage', 'organization'],
            order: 3
          }
        ]
      },
      {
        name: 'Office Solutions',
        description: 'Professional workspace furniture that combines comfort with productivity',
        category: 'commercial',
        featured: true,
        order: 2,
        images: [
          {
            title: 'Executive Office Desk',
            description: 'Premium executive desks for professional environments',
            src: placeholderImage,
            alt: 'Executive office desk',
            category: 'office',
            featured: true,
            tags: ['office', 'desk', 'executive'],
            order: 0
          },
          {
            title: 'Ergonomic Office Chairs',
            description: 'Comfortable seating solutions for long work hours',
            src: placeholderImage,
            alt: 'Ergonomic office chair',
            category: 'office',
            featured: true,
            tags: ['office', 'chair', 'ergonomic'],
            order: 1
          },
          {
            title: 'Conference Room Setup',
            description: 'Complete conference room furniture solutions',
            src: placeholderImage,
            alt: 'Conference room furniture',
            category: 'office',
            featured: false,
            tags: ['office', 'conference', 'meeting'],
            order: 2
          },
          {
            title: 'Reception Area Furniture',
            description: 'Welcoming reception and lobby furniture',
            src: placeholderImage,
            alt: 'Reception area furniture',
            category: 'office',
            featured: false,
            tags: ['office', 'reception', 'lobby'],
            order: 3
          }
        ]
      },
      {
        name: 'Custom Projects',
        description: 'Bespoke furniture solutions tailored to your unique requirements',
        category: 'custom',
        featured: false,
        order: 3,
        images: [
          {
            title: 'Custom Kitchen Cabinets',
            description: 'Handcrafted kitchen storage solutions',
            src: placeholderImage,
            alt: 'Custom kitchen cabinets',
            category: 'custom',
            featured: false,
            tags: ['custom', 'kitchen', 'cabinets'],
            order: 0
          },
          {
            title: 'Built-in Wardrobes',
            description: 'Space-efficient custom wardrobe solutions',
            src: placeholderImage,
            alt: 'Built-in wardrobe',
            category: 'custom',
            featured: false,
            tags: ['custom', 'wardrobe', 'storage'],
            order: 1
          },
          {
            title: 'Study Room Setup',
            description: 'Custom study and work area furniture',
            src: placeholderImage,
            alt: 'Custom study room furniture',
            category: 'custom',
            featured: false,
            tags: ['custom', 'study', 'workspace'],
            order: 2
          }
        ]
      },
      {
        name: 'Industrial Solutions',
        description: 'Heavy-duty furniture for industrial and commercial applications',
        category: 'industrial',
        featured: false,
        order: 4,
        images: [
          {
            title: 'Industrial Workbenches',
            description: 'Robust workbenches for industrial use',
            src: placeholderImage,
            alt: 'Industrial workbench',
            category: 'industrial',
            featured: false,
            tags: ['industrial', 'workbench', 'heavy-duty'],
            order: 0
          },
          {
            title: 'Storage Racks',
            description: 'Heavy-duty storage and shelving systems',
            src: placeholderImage,
            alt: 'Industrial storage rack',
            category: 'industrial',
            featured: false,
            tags: ['industrial', 'storage', 'shelving'],
            order: 1
          }
        ]
      }
    ];

    // Insert gallery sections
    for (const sectionData of gallerySections) {
      const section = new GallerySection(sectionData);
      await section.save();
      console.log(`✅ Gallery section created: ${section.name}`);
    }

    console.log('🎨 Gallery seeding completed successfully');
    
    // Log summary
    const totalSections = await GallerySection.countDocuments();
    const totalImages = await GallerySection.aggregate([
      { $unwind: '$images' },
      { $count: 'total' }
    ]);
    
    console.log(`📊 Gallery Summary:`);
    console.log(`   - Sections: ${totalSections}`);
    console.log(`   - Images: ${totalImages[0]?.total || 0}`);

  } catch (error) {
    console.error('❌ Error seeding gallery:', error);
    throw error;
  }
};

module.exports = seedGallery;
