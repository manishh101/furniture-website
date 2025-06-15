const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InquirySchema = new Schema({
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
  message: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['product', 'service', 'support', 'business', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  }
});

// Add index for faster queries
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1 });
InquirySchema.index({ category: 1 });

module.exports = mongoose.model('Inquiry', InquirySchema);