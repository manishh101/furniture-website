const mongoose = require('mongoose');

/**
 * Category Schema - Represents main categories
 * Subcategories are now stored in a separate collection
 * with references to their parent categories
 */
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for common query patterns
CategorySchema.index({ name: 1 }, { unique: true }); // For unique category names
CategorySchema.index({ displayOrder: 1 }); // For sorting by display order

// Virtual property to get subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: '_id',
  foreignField: 'categoryId'
});

module.exports = mongoose.model('Category', CategorySchema);
