const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-secure').auth;
const Inquiry = require('../models/Inquiry');
const { buildInquiryQuery, validateInquiryData } = require('../utils/inquiryHelper');

/**
 * @route   POST api/inquiries
 * @desc    Create a new inquiry from contact form
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    console.log('Received inquiry submission:', req.body);
    console.log('Headers:', req.headers);
    const { name, email, phone, message, category, productId } = req.body;
    
    console.log('Extracted fields:', { name, email, phone, message, category, productId });
    
    // Validate input
    const validation = validateInquiryData({ name, email, phone, message, category });
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.warn('Inquiry validation failed:', validation.errors);
      return res.status(400).json({ 
        success: false,
        msg: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    // Get IP address if available
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Create new inquiry with enhanced data
    const inquiry = new Inquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      category: category || 'general',
      productId: productId || null,
      ipAddress
    });
    
    console.log('Saving inquiry:', inquiry);
    await inquiry.save();
    console.log('Inquiry saved successfully with ID:', inquiry._id);
    
    res.status(201).json({ 
      success: true,
      msg: 'Inquiry submitted successfully',
      inquiry: {
        id: inquiry._id,
        name: inquiry.name,
        category: inquiry.category,
        createdAt: inquiry.createdAt
      }
    });
  } catch (err) {
    console.error('Error creating inquiry:', err);
    // Send more detailed error information for debugging
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while processing your inquiry',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET api/inquiries
 * @desc    Get all inquiries with filtering (admin only)
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, search } = req.query;
    
    // Build query using helper
    const query = buildInquiryQuery({ status, category, search });
    
    // Get inquiries with pagination
    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const count = await Inquiry.countDocuments(query);
    
    res.json({
      success: true,
      inquiries,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      totalInquiries: count
    });
  } catch (err) {
    console.error('Error fetching inquiries:', err.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

/**
 * @route   GET api/inquiries/:id
 * @desc    Get inquiry by ID (admin only)
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (err) {
    console.error('Error fetching inquiry:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT api/inquiries/:id
 * @desc    Update inquiry status (admin only)
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { VALID_STATUSES } = require('../utils/inquiryHelper');
    
    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    
    // Find and update
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (err) {
    console.error('Error updating inquiry:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   DELETE api/inquiries/:id
 * @desc    Delete an inquiry (admin only)
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    
    await inquiry.deleteOne();
    
    res.json({ msg: 'Inquiry removed' });
  } catch (err) {
    console.error('Error deleting inquiry:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 