const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Enhanced authentication middleware with better security
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('x-auth-token') || req.header('Authorization');

    // Handle Bearer token format
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Special case for offline admin mode
    if (token === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tbG9jYWwifSwiaXNzIjoibWFuaXNoLXN0ZWVsLWFwaSIsImF1ZCI6Im1hbmlzaC1zdGVlbC1mcm9udGVuZCIsImlhdCI6MTYyMDMxMjM0NSwiZXhwIjoxNjIwMzk4NzQ1fQ.mocked-signature-for-local-development-only') {
      // Add admin user info to request
      req.user = {
        id: 'admin-local',
        email: '9814379071',
        name: 'Admin User',
        role: 'admin'
      };
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'manish-steel-api',
      audience: 'manish-steel-frontend'
    });

    // Check if user still exists and is active
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid. User not found.' 
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format.',
        code: 'INVALID_TOKEN'
      });
    }

    res.status(401).json({ 
      success: false,
      message: 'Token is not valid.' 
    });
  }
};

/**
 * Admin-only middleware
 */
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
  });
};

/**
 * Editor or Admin middleware
 */
const editorAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && ['admin', 'editor'].includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Editor privileges required.'
      });
    }
  });
};

module.exports = {
  auth,
  adminAuth,
  editorAuth
};
