const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth-secure').auth;
const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const mongoose = require('mongoose');

/**
 * @route   GET api/subcategories
 * @desc    Get all subcategories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Filter by categoryId if provided
    const filter = {};
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }
    
    const subcategories = await Subcategory.find(filter).sort({ displayOrder: 1, name: 1 });
    res.json(subcategories);
  } catch (err) {
    console.error('Error getting subcategories:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    
    if (!subcategory) {
      return res.status(404).json({ msg: 'Subcategory not found' });
    }
    
    res.json(subcategory);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Subcategory not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST api/subcategories
 * @desc    Create a subcategory
 * @access  Private
 */
router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('categoryId', 'Parent category ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Verify the parent category exists
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Parent category not found' });
    }
    
    // Create new subcategory
    const newSubcategory = new Subcategory({
      name: req.body.name,
      description: req.body.description || '',
      categoryId: req.body.categoryId,
      displayOrder: req.body.displayOrder || 0
    });
    
    const subcategory = await newSubcategory.save();
    res.json(subcategory);
  } catch (err) {
    console.error('Error creating subcategory:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT api/subcategories/:id
 * @desc    Update a subcategory
 * @access  Private
 */
router.put('/:id', [
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
    const subcategory = await Subcategory.findById(req.params.id);
    
    if (!subcategory) {
      return res.status(404).json({ msg: 'Subcategory not found' });
    }
    
    // Update fields
    subcategory.name = req.body.name;
    subcategory.description = req.body.description || '';
    
    // Only update categoryId if provided
    if (req.body.categoryId) {
      // Verify the new parent category exists
      const category = await Category.findById(req.body.categoryId);
      if (!category) {
        return res.status(404).json({ msg: 'Parent category not found' });
      }
      subcategory.categoryId = req.body.categoryId;
    }
    
    if (req.body.displayOrder !== undefined) {
      subcategory.displayOrder = req.body.displayOrder;
    }
    
    await subcategory.save();
    res.json(subcategory);
  } catch (err) {
    console.error('Error updating subcategory:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Subcategory not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE api/subcategories/:id
 * @desc    Delete a subcategory
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    
    if (!subcategory) {
      return res.status(404).json({ msg: 'Subcategory not found' });
    }
    
    await subcategory.remove();
    res.json({ msg: 'Subcategory removed' });
  } catch (err) {
    console.error('Error deleting subcategory:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Subcategory not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/subcategories/category/:categoryId
 * @desc    Get all subcategories for a specific category
 * @access  Public
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ 
      categoryId: req.params.categoryId 
    }).sort({ displayOrder: 1, name: 1 });
    
    res.json(subcategories);
  } catch (err) {
    console.error('Error getting category subcategories:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
