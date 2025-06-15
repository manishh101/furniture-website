/**
 * Product Controller - Forwarding Module
 * 
 * This file exists for backward compatibility.
 * It forwards all exports from the consolidated productController.
 * 
 * For all new code, please import directly from '../productController'
 */

// Re-export all exports from the consolidated controller
module.exports = require('../productController');

// Legacy comments kept for reference:
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
    const formattedProducts = products.map(product => formatProduct(product));
    
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
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
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
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    await product.deleteOne();
    
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};
