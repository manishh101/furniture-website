const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomOrderSchema = new Schema({
  // Customer Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },

  // Product Details
  productType: {
    type: String,
    required: true,
    enum: ['household', 'office', 'wood', 'other', 'steel']
  },
  
  // Dimensions
  dimensions: {
    width: {
      type: String,
      required: false
    },
    height: {
      type: String,
      required: false
    },
    depth: {
      type: String,
      required: false
    }
  },

  // Preferences
  color: {
    type: String,
    required: false,
    enum: ['blue', 'brown', 'maroon', 'pink', 'water-blue', 'grey', 'other', null],
    default: null
  },
  
  budget: {
    type: String,
    required: false,
    enum: ['under-10000', '10000-20000', '20000-30000', '30000-50000', 'above-50000', null],
    default: null
  },

  // Requirements
  requirements: {
    type: String,
    required: true,
    trim: true
  },

  // Status tracking
  status: {
    type: String,
    enum: ['new', 'in-progress', 'quoted', 'approved', 'manufacturing', 'completed', 'delivered', 'cancelled'],
    default: 'new'
  },

  // Admin notes
  adminNotes: {
    type: String,
    required: false
  },

  // Quote information
  quotedPrice: {
    type: Number,
    required: false
  },
  
  quotedAt: {
    type: Date,
    required: false
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CustomOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CustomOrder', CustomOrderSchema);
