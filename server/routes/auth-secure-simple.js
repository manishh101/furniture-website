const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth-secure');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again after 15 minutes',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  [
    check('email', 'Please provide a valid email or phone number')
      .custom((value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
    check('password', 'Password is required')
      .isLength({ min: 1 })
      .withMessage('Password cannot be empty'),
  ],
  async (req, res) => {
    try {
      console.log('Login request received:', req.body);
      
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email or phone
      let user = await User.findOne({
        $or: [
          { email: email },
          { phone: email } // Allow login with phone number in email field
        ]
      });

      if (!user) {
        console.log('User not found');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Invalid password');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const payload = {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback-secret-key-for-development-only',
        { 
          expiresIn: '24h',
          issuer: 'manish-steel-api',
          audience: 'manish-steel-frontend'
        }
      );

      // Remove password from user object
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin
      };

      console.log(`Login successful for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userResponse,
          expiresIn: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        }
      });

    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication'
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token on client side)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  try {
    console.log('Logout request received');
    
    // In a more advanced setup, you would maintain a blacklist of tokens
    // For now, we rely on client-side token removal
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
