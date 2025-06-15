const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  // Legacy fields for compatibility - will be populated from references
  category: {
    type: String
  },
  subcategory: {
    type: String
  },
  features: [{
    type: String
  }],
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  material: String,
  colors: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 100
  },
  originalPrice: {
    type: Number
  }
});

// Create indexes for common query patterns
ProductSchema.index({ categoryId: 1 }); // For filtering by category
ProductSchema.index({ subcategoryId: 1 }); // For filtering by subcategory
ProductSchema.index({ name: 'text', description: 'text' }); // Text search index
ProductSchema.index({ dateAdded: -1 }); // For sorting by date
ProductSchema.index({ price: 1 }); // For sorting and filtering by price
ProductSchema.index({ isAvailable: 1 }); // For filtering by availability
ProductSchema.index({ featured: 1 }); // For filtering featured products
ProductSchema.index({ salesCount: -1 }); // For sorting by sales count
ProductSchema.index({ rating: -1 }); // For sorting by rating

// Pre-save hook to ensure category and subcategory string fields are populated
ProductSchema.pre('save', async function(next) {
  try {
    // If categoryId exists but category string is not set
    if (this.categoryId && !this.category) {
      const Category = mongoose.model('Category');
      const categoryDoc = await Category.findById(this.categoryId);
      if (categoryDoc) {
        this.category = categoryDoc.name;
      }
    }
    
    // If subcategoryId exists but subcategory string is not set
    if (this.subcategoryId && !this.subcategory) {
      const Subcategory = mongoose.model('Subcategory');
      const subcategoryDoc = await Subcategory.findById(this.subcategoryId);
      if (subcategoryDoc) {
        this.subcategory = subcategoryDoc.name;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Product', ProductSchema);
