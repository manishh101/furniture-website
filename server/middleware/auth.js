const jwt = require('jsonwebtoken');

// Authentication middleware
const protect = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token') || req.header('Authorization');

  // Check if token starts with "Bearer" and remove it
  let finalToken = token;
  if (token && token.startsWith('Bearer ')) {
    finalToken = token.slice(7);
  }

  // Check if no token
  if (!finalToken) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(`Token validation error: ${err.message}`);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is an admin
const admin = function(req, res, next) {
  // User must be authenticated first
  if (!req.user) {
    return res.status(401).json({ success: false, msg: 'Authentication required' });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, msg: 'Admin access required' });
  }

  next();
};

// Export both middlewares
module.exports = protect;
module.exports.protect = protect;
module.exports.admin = admin;
