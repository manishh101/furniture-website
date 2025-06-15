const mongoose = require('mongoose');

// Define schema for About page content
const AboutSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    required: [true, 'Hero title is required'],
    default: 'About Our Company'
  },
  heroDescription: {
    type: String,
    required: [true, 'Hero description is required'],
    default: 'Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal.'
  },
  
  // Company Introduction
  storyTitle: {
    type: String,
    default: 'Our Story'
  },
  storyImage: {
    type: String,
    default: 'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=About+Us'
  },
  storyContent: [{
    type: String,
    required: true
  }],
  
  // Vision & Mission
  vision: {
    type: String,
    required: [true, 'Vision statement is required'],
    default: 'To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service.'
  },
  mission: {
    type: String,
    required: [true, 'Mission statement is required'],
    default: 'To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices.'
  },
  
  // Core Values
  coreValues: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'CheckBadgeIcon' // Default Heroicon name
    }
  }],
  
  // Workshop & Team
  workshopTitle: {
    type: String,
    default: 'Our Workshop & Team'
  },
  workshopDescription: {
    type: String,
    default: 'Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.'
  },
  workshopImages: [{
    type: String
  }],
  
  // Meta Information
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create and export the About model
const About = mongoose.model('About', AboutSchema);
module.exports = About;
