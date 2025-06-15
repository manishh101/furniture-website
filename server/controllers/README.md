# Controller Structure

The controllers for this application have been consolidated for better organization:

## Main Controllers

- `productController.js` - Primary controller for all product-related operations
- `categoryController.js` (if exists) - Controls category operations
- `userController.js` (if exists) - Controls user operations
- etc.

## Legacy Structure

The `products/` directory contains forwarding modules for backward compatibility:

- `products/productController.js` - Forwards to `../productController.js`

## Best Practice

For all new code development:
- Import controllers directly from the main controllers directory
- Example: `const productController = require('../controllers/productController');`
