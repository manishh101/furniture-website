/**
 * Product Controller
 * Unified controller handling all product-related business logic
 */
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

/**
 * Format a product for API response
 * @param {Object} product - Product document from MongoDB
 * @return {Object} - Formatted product object
 */
const formatProduct = (product) => {
  if (!product) return null;
  
  const formatted = product.toObject ? product.toObject() : { ...product };
  
  // Set category name from populated field or string field
  if (formatted.categoryId && formatted.categoryId.name) {
    formatted.category = formatted.categoryId.name;
  }
  
  // Set subcategory name from populated field or string field
  if (formatted.subcategoryId && formatted.subcategoryId.name) {
    formatted.subcategory = formatted.subcategoryId.name;
  }
  
  return formatted;
};

/**
 * Enhanced filtering for products with flexible category/subcategory matching
 */
exports.filterProducts = async (req, res) => {
  try {
    const { category, subcategory, limit = 100, page = 1 } = req.query;
    console.log('Enhanced products filter API called with query:', req.query);
    
    // Construct query based on provided filters
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      console.log('Filtering by category:', category);
      
      // Try both ObjectId and string matching
      const categoryQuery = { $or: [] };
      
      // Try ObjectId match
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryQuery.$or.push({ categoryId: category });
        
        // Also try to find the category name and match against string field
        try {
          const categoryDoc = await Category.findById(category);
          if (categoryDoc) {
            console.log('Found category name for ID:', categoryDoc.name);
            categoryQuery.$or.push({ category: new RegExp('^' + categoryDoc.name + '$', 'i') });
          }
        } catch (err) {
          console.log('Error finding category by ID:', err.message);
        }
      }
      
      // Also try string match
      categoryQuery.$or.push({ category: new RegExp('^' + category + '$', 'i') });
      
      query = categoryQuery;
    }
    
    // Subcategory filter (apply in conjunction with category if specified)
    if (subcategory) {
      console.log('Filtering by subcategory:', subcategory);
      
      // Try both ObjectId and string matching for subcategory
      const subcategoryQuery = { $or: [] };
      
      // Try ObjectId match
      if (mongoose.Types.ObjectId.isValid(subcategory)) {
        subcategoryQuery.$or.push({ subcategoryId: subcategory });
        
        // Also try to find the subcategory name and match against string field
        try {
          const subcategoryDoc = await Subcategory.findById(subcategory);
          if (subcategoryDoc) {
            console.log('Found subcategory name for ID:', subcategoryDoc.name);
            subcategoryQuery.$or.push({ subcategory: new RegExp('^' + subcategoryDoc.name + '$', 'i') });
          }
        } catch (err) {
          console.log('Error finding subcategory by ID:', err.message);
        }
      }
      
      // Also try string match (exact match, case insensitive)
      subcategoryQuery.$or.push({ subcategory: new RegExp('^' + subcategory + '$', 'i') });
      
      // Combine with existing query if needed
      if (Object.keys(query).length > 0) {
        query = { $and: [query, subcategoryQuery] };
      } else {
        query = subcategoryQuery;
      }
    }
    
    console.log('Final query:', JSON.stringify(query));
    
    // Execute query with pagination
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ dateAdded: -1 });
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    // Format products to include category and subcategory names
    const formattedProducts = products.map(formatProduct);
    
    console.log(`Returning ${formattedProducts.length} products`);
    
    return res.json({
      products: formattedProducts,
      totalProducts: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in products filter API:', error);
    return res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

/**
 * Get all products with optional filtering
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};
    
    if (category) {
      query.categoryId = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get products with category details
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    // Get total count  
    const count = await Product.countDocuments(query);
    
    // Format products to include category and subcategory names
    const formattedProducts = products.map(formatProduct);
    
    return res.json({
      products: formattedProducts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProducts: count
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

/**
 * Get a single product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name');
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    const formattedProduct = formatProduct(product);
    res.json(formattedProduct);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Update an existing product
 */
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Update each field present in the request
    Object.keys(req.body).forEach(field => {
      product[field] = req.body[field];
    });
    
    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Use findByIdAndDelete instead of the deprecated remove() method
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Get featured products
 * @route GET /api/products/featured
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    console.log('Featured products API called with limit:', limit);
    
    let products = await Product.find({ featured: true, isAvailable: true })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ salesCount: -1, dateAdded: -1 }) // Sort by sales count then by date
      .limit(parseInt(limit));
    
    // If we don't have enough featured products, supplement with high-selling products
    if (products.length < parseInt(limit)) {
      const additionalProducts = await Product.find({ 
        featured: false, 
        isAvailable: true,
        _id: { $nin: products.map(p => p._id) }
      })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ salesCount: -1, rating: -1, dateAdded: -1 })
        .limit(parseInt(limit) - products.length);
      
      products = [...products, ...additionalProducts];
    }
    
    // Format products for response
    const formattedProducts = products.map(formatProduct);
    
    res.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });
  } catch (err) {
    console.error('Featured products error:', err.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error',
      error: err.message 
    });
  }
};

/**
 * Get best selling products
 * @route GET /api/products/best-selling
 */
exports.getBestSellingProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    console.log('Best selling products API called with limit:', limit);
    
    const products = await Product.find({ isAvailable: true })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ salesCount: -1, rating: -1, dateAdded: -1 }) // Sort by sales count, rating, then date
      .limit(parseInt(limit));
    
    // Format products for response
    const formattedProducts = products.map(formatProduct);
    
    res.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });
  } catch (err) {
    console.error('Best selling products error:', err.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error',
      error: err.message 
    });
  }
};

/**
 * Update product featured status
 * @route PATCH /api/products/:id/featured
 */
exports.updateFeaturedStatus = async (req, res) => {
  try {
    const { featured } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { featured: Boolean(featured) },
      { new: true }
    ).populate('categoryId', 'name').populate('subcategoryId', 'name');
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json({
      success: true,
      msg: `Product ${featured ? 'featured' : 'unfeatured'} successfully`,
      product: formatProduct(product)
    });
  } catch (err) {
    console.error('Update featured status error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error',
      error: err.message 
    });
  }
};

/**
 * Update product sales count
 * @route PATCH /api/products/:id/sales
 */
exports.updateSalesCount = async (req, res) => {
  try {
    const { count = 1 } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { salesCount: parseInt(count) } },
      { new: true }
    ).populate('categoryId', 'name').populate('subcategoryId', 'name');
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json({
      success: true,
      msg: 'Sales count updated successfully',
      product: formatProduct(product)
    });
  } catch (err) {
    console.error('Update sales count error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error',
      error: err.message 
    });
  }
};

/**
 * Get all images for a specific product
 * This endpoint is optimized for gallery display
 * @route GET /api/products/:id/images
 */
exports.getProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Collect all images from the product
    const imageCollection = [];
    
    // Start with main image as it's the primary one
    if (product.image) {
      imageCollection.push({
        url: product.image,
        isPrimary: true,
        type: 'main'
      });
    }

    // Add all additional images from the images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img, index) => {
        if (img && !imageCollection.some(existingImg => existingImg.url === img)) {
          imageCollection.push({
            url: img,
            isPrimary: false,
            index: index,
            type: 'additional'
          });
        }
      });
    }

    res.json({
      productId: product._id,
      productName: product.name,
      category: product.category || (product.categoryId ? product.categoryId.name : null),
      totalImages: imageCollection.length,
      images: imageCollection
    });
    
  } catch (err) {
    console.error('Get product images error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error',
      error: err.message 
    });
  }
};
