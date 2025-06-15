const mongoose = require('mongoose');

/**
 * Subcategory Schema - Represents individual subcategories
 * Instead of storing subcategories as string arrays within Category documents,
 * this creates a separate collection for subcategories with references to parent categories
 */
const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
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
SubcategorySchema.index({ categoryId: 1 }); // For finding subcategories of a category
SubcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true }); // Ensure unique names within a category
SubcategorySchema.index({ displayOrder: 1 }); // For sorting by display order

module.exports = mongoose.model('Subcategory', SubcategorySchema);
