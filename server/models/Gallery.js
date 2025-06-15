const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const gallerySectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  images: [galleryImageSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const galleryConfigSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Our Gallery'
  },
  subtitle: {
    type: String,
    default: 'Discover our craftsmanship through stunning visuals'
  },
  layout: {
    type: String,
    enum: ['grid', 'masonry', 'slider'],
    default: 'grid'
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showStats: {
    type: Boolean,
    default: true
  },
  heroImage: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
galleryConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

galleryConfigSchema.statics.updateConfig = async function(updates, userId) {
  let config = await this.findOne();
  if (!config) {
    config = new this(updates);
  } else {
    Object.assign(config, updates);
  }
  config.updatedBy = userId;
  await config.save();
  return config;
};

const GallerySection = mongoose.model('GallerySection', gallerySectionSchema);
const GalleryConfig = mongoose.model('GalleryConfig', galleryConfigSchema);

module.exports = {
  GallerySection,
  GalleryConfig,
  galleryImageSchema,
  gallerySectionSchema
};
