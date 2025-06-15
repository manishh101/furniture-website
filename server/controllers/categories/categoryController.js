/**
 * Categories Controller
 * Handles category and subcategory operations
 */
const { validationResult } = require('express-validator');
const Category = require('../../models/Category');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get a category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Create a new category
 */
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, parent } = req.body;
    
    // Check if category already exists
    let category = await Category.findOne({ name });
    
    if (category) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    
    const newCategory = new Category({
      name,
      parent
    });
    
    category = await newCategory.save();
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Update a category
 */
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, parent } = req.body;
    
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: { name, parent } },
      { new: true }
    );
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Delete a category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    await category.deleteOne();
    
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
};
