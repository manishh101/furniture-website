const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email or phone number').custom((value) => {
      // Allow email format or phone number (10 digits)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' });

    try {
      // Special handling for admin user with phone number 9814379071 with hardcoded credential check
      if (email === '9814379071' && password === 'M@nishsteel') {
        console.log('Admin login attempt detected with correct hardcoded credentials');
        
        // Directly create admin session without checking database
        // Create or find admin user in database
        let adminUser = await User.findOne({ 
          $or: [
            { email: '9814379071' }, 
            { phone: '9814379071' }
          ]
        });
        
        // If admin user not found, create it
        if (!adminUser) {
          console.log('Admin user not found, auto-creating...');
          
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('M@nishsteel', salt);
          
          adminUser = new User({
            name: 'Manish Steel Admin',
            email: '9814379071',
            phone: '9814379071',
            password: hashedPassword,
            role: 'admin'
          });
          
          await adminUser.save();
          console.log('Admin user created successfully');
        }
        
        console.log('Admin user configured:', !!adminUser);
        
        // Return admin token directly
        const payload = {
          user: {
            id: adminUser.id,
            role: 'admin'
          }
        };
        
        return jwt.sign(
          payload,
          process.env.JWT_SECRET || 'manishsteelsecret',
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) {
              console.error('JWT signing error:', err);
              return res.status(500).json({ 
                success: false,
                message: 'Server error during authentication',
                code: 'JWT_ERROR' 
              });
            }
            console.log('Admin login successful');
            res.json({ 
              success: true,
              message: 'Login successful',
              data: {
                token,
                user: {
                  id: adminUser.id,
                  name: adminUser.name || 'Manish Steel Admin',
                  email: adminUser.email,
                  role: 'admin'
                }
              }
            });
          }
        );
      }
      
      // Regular user flow
      let user = await User.findOne({ email });
      console.log('User found by email:', !!user);

      // If not found by email, try finding by phone
      if (!user) {
        console.log('User not found by email, trying phone number...');
        user = await User.findOne({ phone: email });
        console.log('User found by phone:', !!user);
      }
      
      // Special case: if user is trying to log in as admin but we couldn't find the user
      if (!user && email === '9814379071') {
        console.log('Admin login detected but user not found, creating admin user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('M@nishsteel', salt);
        
        user = new User({
          name: 'Manish Steel Admin',
          email: '9814379071',
          phone: '9814379071',
          password: hashedPassword,
          role: 'admin'
        });
        
        await user.save();
        console.log('Admin user created on the fly');
      }

      if (!user) {
        console.log('User not found for email/phone:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      console.log('Testing password...');
      // Match password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'manishsteelsecret',
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) {
            console.error('JWT signing error:', err);
            return res.status(500).json({ 
              success: false,
              message: 'Server error during authentication',
              code: 'JWT_ERROR' 
            });
          }
          
          res.json({
            success: true,
            message: 'Login successful',
            data: {
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
              }
            }
          });
        }
      );
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/admin
// @desc    Admin login with phone number - special handling for mobile login
// @access  Public
router.post(
  '/admin',
  [
    check('phone', 'Phone number is required').exists(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;
    console.log('Admin login attempt with phone:', phone);

    try {
      // Special case for admin user 9814379071 
      if (phone === '9814379071' && password === 'M@nishsteel') {
        console.log('Admin credentials match hardcoded values, creating admin session');
        
        // Create or find admin user
        let adminUser = await User.findOne({ 
          $or: [
            { phone: '9814379071' },
            { email: '9814379071' }
          ]
        });
        
        if (!adminUser) {
          console.log('Admin user not found, creating new admin user');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('M@nishsteel', salt);
          
          adminUser = new User({
            name: 'Manish Steel Admin',
            email: '9814379071',
            phone: '9814379071',
            password: hashedPassword,
            role: 'admin'
          });
          
          await adminUser.save();
          console.log('Admin user created successfully');
        } else {
          console.log('Admin user found:', adminUser.email);
        }
        
        // Generate token for admin
        const payload = {
          user: {
            id: adminUser.id,
            role: 'admin'
          }
        };
        
        return jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) throw err;
            console.log('Admin login successful');
            res.json({ 
              token, 
              user: { 
                id: adminUser.id, 
                name: adminUser.name || 'Manish Steel Admin',
                email: adminUser.email, 
                role: 'admin' 
              } 
            });
          }
        );
      }
      
      // Standard flow for other users
      let user = await User.findOne({ 
        $or: [
          { phone },
          { email: phone } // Also check if the phone is stored as email
        ]
      });
      
      if (!user) {
        console.log('No user found with phone:', phone);
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      console.log('User found:', user.email, 'Role:', user.role);
      
      // Match password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          console.log('Admin login successful');
          res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }
      );
    } catch (err) {
      console.error('Server error in admin login:', err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
