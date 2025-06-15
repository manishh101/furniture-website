# Manish Steel Furniture - Backend API

RESTful API backend for Manish Steel Furniture e-commerce platform built with Express.js and MongoDB.

## Technology Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JSON Web Token (JWT) authentication
- Express middleware for security and request handling
- Multer for file uploads
- Dotenv for environment management

## API Documentation

### Core Endpoints

| Endpoint           | Methods             | Description                       |
|--------------------|---------------------|-----------------------------------|
| `/api/auth`        | POST                | Authentication and authorization  |
| `/api/products`    | GET, POST, PUT, DEL | Product management                |
| `/api/categories`  | GET, POST, PUT, DEL | Category/subcategory management   |
| `/api/users`       | GET, POST, PUT, DEL | User management (admin only)      |
| `/api/upload`      | POST                | File upload for product images    |

### Authentication

The API uses JWT token-based authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Copy example environment file
   cp .env-example/.env.development .env
   
   # Edit variables as needed
   nano .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Initialize admin user and sample data (optional):
   ```bash
   npm run init
   npm run init-test-data
   ```

## Database Models

- **User**: Authentication and admin access
- **Product**: Product details with images and specifications  
- **Category**: Product categories with subcategories

## Deployment

For deployment instructions, see [/docs/DEPLOYMENT_STEPS.md](/docs/DEPLOYMENT_STEPS.md) in the project root.

## Production Server

For production deployment, use `vercel-server.js` which includes optimizations for Vercel deployment and MongoDB Atlas.
