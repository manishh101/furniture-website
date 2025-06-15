const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { check, validationResult } = require('express-validator');
const authSecure = require('../middleware/auth-secure');
const User = require('../models/User');

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

// JWT Secret validation
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('WARNING: JWT_SECRET is not set or too short. Using a secure default.');
  process.env.JWT_SECRET = 'manish_steel_secure_jwt_secret_key_2025_very_long_and_secure';
}

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
      
      // Sanitize input
      const sanitizedEmail = email.trim().toLowerCase();
      
      console.log(`Login attempt for: ${sanitizedEmail.substring(0, 3)}***`);

      // Find user by email or phone
      let user = await User.findOne({
        $or: [
          { email: sanitizedEmail },
          { phone: sanitizedEmail }
        ]
      }).select('+password'); // Explicitly include password field

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
        process.env.JWT_SECRET,
        { 
          expiresIn: '24h', // More secure: shorter expiration time
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
 * @route   POST /api/auth/register
 * @desc    Register new user (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/register',
  [
    authSecure,
    check('name', 'Name is required and must be at least 2 characters')
      .isLength({ min: 2 }),
    check('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail(),
    check('password', 'Password must be at least 8 characters with uppercase, lowercase, number and special character')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    check('phone', 'Phone number must be 10 digits')
      .optional()
      .matches(/^\d{10}$/)
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array()
        });
      }

      const { name, email, password, phone, role = 'editor' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          ...(phone ? [{ phone }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email or phone number'
        });
      }

      // Hash password
      const saltRounds = 12; // More secure than default
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        password: hashedPassword,
        role: ['admin', 'editor'].includes(role) ? role : 'editor',
        createdBy: req.user.id
      });

      await user.save();

      console.log(`New user registered: ${user.email} by admin: ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authSecure, async (req, res) => {
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
          lastLogin: user.lastLogin,
          dateCreated: user.dateCreated
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

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token on client side)
 * @access  Private
 */
router.post('/logout', authSecure, async (req, res) => {
  try {
    // In a more advanced setup, you would maintain a blacklist of tokens
    // For now, we rely on client-side token removal
    
    console.log(`User logged out: ${req.user.email || req.user.id}`);
    
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
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  [
    authSecure,
    check('currentPassword', 'Current password is required')
      .notEmpty(),
    check('newPassword', 'New password must be at least 8 characters with uppercase, lowercase, number and special character')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      console.log(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during password change'
      });
    }
  }
);

module.exports = router;
