const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth-secure').auth;
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

/**
 * @route   GET api/categories
 * @desc    Get all categories with their subcategories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /categories - Request received with query:', req.query);
    
    // Get categories
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    console.log(`GET /categories - Found ${categories.length} categories`);
    
    // If detailed=true, populate with subcategories
    if (req.query.detailed === 'true') {
      console.log('GET /categories - Fetching subcategories for detailed view');
      // Get all subcategories in one query
      const subcategories = await Subcategory.find()
        .sort({ displayOrder: 1, name: 1 });
      
      console.log(`GET /categories - Found ${subcategories.length} subcategories`);
      
      // Map subcategories to their parent categories
      const result = categories.map(category => {
        const categoryObj = category.toObject();
        categoryObj.subcategories = subcategories.filter(sub => {
          const matches = sub.categoryId.toString() === category._id.toString();
          if (matches) {
            console.log(`Assigning subcategory "${sub.name}" to category "${category.name}"`);
          }
          return matches;
        });
        return categoryObj;
      });
      
      return res.json(result);
    }
    
    // Return simple categories (without subcategories)
    res.json(categories);
  } catch (err) {
    console.error('Error getting categories:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/categories/:id
 * @desc    Get category by ID with its subcategories
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Include subcategories if requested
    if (req.query.subcategories === 'true') {
      const subcategories = await Subcategory.find({ 
        categoryId: category._id 
      }).sort({ displayOrder: 1, name: 1 });
      
      const result = category.toObject();
      result.subcategories = subcategories;
      
      return res.json(result);
    }
    
    // Return just the category
    res.json(category);
  } catch (err) {
    console.error('Error getting category by ID:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Create a category
// @access  Private
router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, displayOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ msg: 'Category already exists' });
    }

    const newCategory = new Category({
      name,
      description: description || '',
      displayOrder: displayOrder || 0
    });

    const category = await newCategory.save();
    
    // If subcategories are provided, create them too
    if (req.body.subcategories && Array.isArray(req.body.subcategories)) {
      const subcategoryPromises = req.body.subcategories.map(async (subName, index) => {
        const newSubcategory = new Subcategory({
          name: subName,
          categoryId: category._id,
          displayOrder: index
        });
        return newSubcategory.save();
      });
      
      await Promise.all(subcategoryPromises);
      
      // Return category with created subcategories
      const subcategories = await Subcategory.find({ categoryId: category._id });
      const result = category.toObject();
      result.subcategories = subcategories;
      
      return res.json(result);
    }
    
    res.json(category);
  } catch (err) {
    console.error('Error creating category:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    const { name, description, displayOrder } = req.body;
    
    // Check if name is changed and already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ msg: 'Category name already exists' });
      }
    }
    
    // Update category
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    // Handle subcategories if provided
    if (req.body.subcategories && Array.isArray(req.body.subcategories)) {
      // Get existing subcategories
      const existingSubcats = await Subcategory.find({ categoryId: category._id });
      
      // Create new subcategories that don't exist
      const existingNames = existingSubcats.map(sub => sub.name.toLowerCase());
      const newSubcats = req.body.subcategories.filter(
        name => !existingNames.includes(name.toLowerCase())
      );
      
      if (newSubcats.length > 0) {
        const subcategoryPromises = newSubcats.map(async (subName, index) => {
          const newSubcategory = new Subcategory({
            name: subName,
            categoryId: category._id,
            displayOrder: existingSubcats.length + index
          });
          return newSubcategory.save();
        });
        
        await Promise.all(subcategoryPromises);
      }
      
      // Return category with updated subcategories
      const subcategories = await Subcategory.find({ categoryId: category._id });
      const result = category.toObject();
      result.subcategories = subcategories;
      
      return res.json(result);
    }
    
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if any products use this category
    const productCount = await Product.countDocuments({ categoryId: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete category as it is used by ${productCount} products` 
      });
    }
    
    // Check for and delete any associated subcategories
    const subcategories = await Subcategory.find({ categoryId: req.params.id });
    
    if (subcategories.length > 0) {
      // Check if any products use these subcategories
      const subcategoryIds = subcategories.map(sub => sub._id.toString());
      const productsWithSubcats = await Product.countDocuments({ 
        subcategoryId: { $in: subcategoryIds } 
      });
      
      if (productsWithSubcats > 0) {
        return res.status(400).json({ 
          msg: `Cannot delete category as its subcategories are used by ${productsWithSubcats} products` 
        });
      }
      
      // Delete all subcategories
      await Subcategory.deleteMany({ categoryId: req.params.id });
    }
    
    // Delete the category
    await Category.deleteOne({ _id: req.params.id });
    
    res.json({ msg: 'Category and its subcategories removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
