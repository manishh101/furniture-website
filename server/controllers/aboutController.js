const About = require('../models/About');

// Create middleware for handling async errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get the about page content
exports.getAboutContent = asyncHandler(async (req, res) => {
  let aboutContent = await About.findOne();
  
  // If no content exists, create default content
  if (!aboutContent) {
    aboutContent = await About.create({
      // Hero Section
      heroTitle: 'About Our Company',
      heroDescription: 'Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal.',
      
      // Company Story
      storyTitle: 'Our Story',
      storyImage: 'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=About+Us',
      storyContent: [
        'Founded over a decade ago, Shree Manish Steel Furnitry Industry began with a simple mission: to create high-quality, affordable furniture for Nepali homes and businesses. What started as a small workshop has grown into one of the most trusted furniture manufacturers in the region.',
        'Our journey has been defined by a commitment to craftsmanship, innovation, and customer satisfaction. We take pride in our Nepali heritage and continue to support local communities through employment opportunities and sustainable business practices.',
        'Today, we offer a comprehensive range of steel and wooden furniture solutions, from household almirahs to complete office setups, all designed with the unique needs of our customers in mind.'
      ],
      
      // Vision & Mission
      vision: 'To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service. We envision a future where every Nepali home and office is furnished with our durable, stylish, and affordable products.',
      mission: 'To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices. We are committed to using quality materials, employing skilled craftsmen, and maintaining high standards of production to deliver products that exceed customer expectations.',
      
      // Core Values
      coreValues: [
        {
          title: 'Quality',
          description: 'We never compromise on the quality of our materials or craftsmanship, ensuring products that last for generations.',
          icon: 'CheckBadgeIcon'
        },
        {
          title: 'Innovation',
          description: 'We continuously explore new designs, technologies, and processes to improve our products and meet evolving customer needs.',
          icon: 'LightBulbIcon'
        },
        {
          title: 'Integrity',
          description: 'We conduct our business with honesty, transparency, and ethical practices, building trust with customers, employees, and partners.',
          icon: 'ShieldCheckIcon'
        },
        {
          title: 'Customer Focus',
          description: 'We prioritize customer satisfaction by listening to feedback, providing excellent service, and creating products that meet real needs.',
          icon: 'UsersIcon'
        }
      ],
      
      // Workshop & Team
      workshopTitle: 'Our Workshop & Team',
      workshopDescription: 'Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.',
      workshopImages: [
        'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Workshop+1',
        'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Workshop+2',
        'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Workshop+3',
        'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Workshop+4',
        'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Workshop+5',
        'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=Workshop+6'
      ]
    });
  }
  
  res.status(200).json({
    success: true,
    data: aboutContent
  });
});

// Update the about page content
exports.updateAboutContent = asyncHandler(async (req, res) => {
  try {
    let aboutContent = await About.findOne();
    
    // Basic validation
    if (req.body.coreValues && !Array.isArray(req.body.coreValues)) {
      return res.status(400).json({
        success: false,
        message: 'Core values must be an array'
      });
    }
    
    if (req.body.storyContent && !Array.isArray(req.body.storyContent)) {
      return res.status(400).json({
        success: false,
        message: 'Story content must be an array'
      });
    }
    
    if (req.body.workshopImages && !Array.isArray(req.body.workshopImages)) {
      return res.status(400).json({
        success: false,
        message: 'Workshop images must be an array'
      });
    }
    
    // If no content exists, create new content with request body
    if (!aboutContent) {
      aboutContent = await About.create(req.body);
    } else {
      // Update existing content
      aboutContent = await About.findByIdAndUpdate(aboutContent._id, {
        ...req.body,
        lastUpdated: Date.now()
      }, {
        new: true,
        runValidators: true
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'About page content updated successfully',
      data: aboutContent
    });
  } catch (error) {
    console.error('Error updating about content:', error);
    
    // Check for validation errors (Mongoose)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update about page content',
      error: error.message
    });
  }
});

// Update specific sections of the about page
exports.updateAboutSection = asyncHandler(async (req, res) => {
  try {
    let aboutContent = await About.findOne();
    const { section } = req.params;
    
    if (!aboutContent) {
      // If no content exists, create default content first
      const defaultContent = {
        heroTitle: 'About Our Company',
        heroDescription: 'Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal.',
        storyTitle: 'Our Story',
        storyImage: 'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=About+Us',
        storyContent: [
          'Founded over a decade ago, Shree Manish Steel Furnitry Industry began with a simple mission: to create high-quality, affordable furniture for Nepali homes and businesses.'
        ],
        vision: 'To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service.',
        mission: 'To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices.',
        coreValues: [],
        workshopTitle: 'Our Workshop & Team',
        workshopDescription: 'Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.',
        workshopImages: []
      };
      
      aboutContent = await About.create(defaultContent);
    }
    
    // Check if the section exists in the request body
    if (req.body[section] === undefined) {
      return res.status(400).json({
        success: false,
        message: `Section "${section}" not found in request body`
      });
    }
    
    // Update only the specific section
    const updateData = {};
    updateData[section] = req.body[section];
    updateData.lastUpdated = Date.now();
    
    console.log(`Updating section "${section}" with data:`, updateData);
    
    aboutContent = await About.findByIdAndUpdate(aboutContent._id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      message: `${section} section updated successfully`,
      data: aboutContent
    });
  } catch (error) {
    console.error(`Error updating about section "${req.params.section}":`, error.message);
    res.status(500).json({
      success: false,
      message: `Failed to update ${req.params.section} section: ${error.message}`,
      error: error.toString()
    });
  }
});

// Update workshop images (add, reorder, delete)
exports.updateWorkshopImages = asyncHandler(async (req, res) => {
  let aboutContent = await About.findOne();
  const { images } = req.body;
  
  if (!aboutContent) {
    return res.status(404).json({
      success: false,
      message: 'About page content not found'
    });
  }
  
  aboutContent = await About.findByIdAndUpdate(aboutContent._id, {
    workshopImages: images,
    lastUpdated: Date.now()
  }, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Workshop images updated successfully',
    data: aboutContent
  });
});

// Add or update a core value
exports.updateCoreValue = asyncHandler(async (req, res) => {
  let aboutContent = await About.findOne();
  const { valueId } = req.params;
  const { value } = req.body;
  
  if (!aboutContent) {
    return res.status(404).json({
      success: false,
      message: 'About page content not found'
    });
  }
  
  // If valueId is provided, update existing value
  if (valueId !== 'new') {
    const valueIndex = aboutContent.coreValues.findIndex(v => v._id.toString() === valueId);
    
    if (valueIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Core value not found'
      });
    }
    
    aboutContent.coreValues[valueIndex] = { 
      ...aboutContent.coreValues[valueIndex].toObject(), 
      ...value 
    };
  } else {
    // Add new value
    aboutContent.coreValues.push(value);
  }
  
  aboutContent.lastUpdated = Date.now();
  await aboutContent.save();
  
  res.status(200).json({
    success: true,
    message: valueId === 'new' ? 'Core value added successfully' : 'Core value updated successfully',
    data: aboutContent
  });
});

// Delete a core value
exports.deleteCoreValue = asyncHandler(async (req, res) => {
  let aboutContent = await About.findOne();
  const { valueId } = req.params;
  
  if (!aboutContent) {
    return res.status(404).json({
      success: false,
      message: 'About page content not found'
    });
  }
  
  aboutContent.coreValues = aboutContent.coreValues.filter(
    v => v._id.toString() !== valueId
  );
  
  aboutContent.lastUpdated = Date.now();
  await aboutContent.save();
  
  res.status(200).json({
    success: true,
    message: 'Core value deleted successfully',
    data: aboutContent
  });
});
