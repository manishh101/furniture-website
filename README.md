# Manish Steel Furniture Website

A modern e-commerce website for Manish Steel Furniture showcasing their premium furniture products with an integrated admin system.

## Features

- **Product Management**: Comprehensive catalog with categories and subcategories
- **Image Gallery**: High-quality product images with Cloudinary integration
- **Admin Dashboard**: Secure admin panel for product and category management
- **Responsive Design**: Mobile-first layout that works on all devices
- **Search Functionality**: Advanced product search and filtering
- **Contact System**: Integrated contact form and WhatsApp connectivity
- **Custom Orders**: Special request form for custom furniture orders

## Project Structure

The project follows a modern microservices architecture:

1. **Frontend** (`/manish-steel-final`): React application with Tailwind CSS
2. **Backend API** (`/server`): Node.js/Express RESTful API with MongoDB

## Production Deployment

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- Cloudinary account for image management

### Environment Setup

1. **Backend Environment** (`/server/.env`):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=your_frontend_domain
   ```

2. **Frontend Environment** (`/manish-steel-final/.env`):
   ```
   REACT_APP_API_URL=your_backend_api_url
   ```

### Backend Deployment

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install production dependencies:
   ```bash
   npm install --production
   ```

3. Initialize admin user (first time only):
   ```bash
   npm run init
   ```

4. Start the production server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd manish-steel-final
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Deploy the `build` folder to your hosting platform

### Vercel Deployment

Both frontend and backend are configured for Vercel deployment:

1. **Backend**: Configured with `vercel.json` in the server directory
2. **Frontend**: Standard React deployment to Vercel

### Database Initialization

For first-time deployment:

```bash
# In the server directory
npm run init          # Creates admin user
npm run migrate        # Sets up initial data
npm run seed-top-products  # Seeds sample products
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Inquiries
- `GET /api/inquiries` - Get all inquiries (admin)
- `POST /api/inquiries` - Submit new inquiry
- `PUT /api/inquiries/:id` - Update inquiry status (admin)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation
- Environment variable protection

## Performance Features

- Cloudinary image optimization
- MongoDB indexing
- React code splitting
- Lazy loading
- Responsive image delivery

## Support

For technical support or deployment assistance, contact the development team.

## License

Private project for Manish Steel Furniture.

1. Navigate to the frontend directory:
   ```bash
   cd manish-steel-final
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

This project is configured for deployment on Vercel with MongoDB Atlas. See the documentation:

- [Deployment Steps](/docs/DEPLOYMENT_STEPS.md)
- [Vercel Deployment Guide](/docs/VERCEL_DEPLOYMENT_GUIDE.md)
- [MongoDB Atlas Setup Guide](/docs/MONGODB_ATLAS_GUIDE.md)

## Development

Run both frontend and backend simultaneously:

```bash
# From the project root
./start.sh
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

Manish Steel Furniture - [Website](https://manishsteel.vercel.app)

## Deployment

### Using Vercel (Recommended)

This project is configured for deployment on Vercel with separate deployments for frontend and backend.

#### Prerequisites for Deployment

- A Vercel account
- MongoDB Atlas database (or other MongoDB hosting)
- Cloudinary account for image optimization (optional)

#### Frontend Deployment

1. Log in to your Vercel account
2. Create a new project by importing from GitHub or uploading the `manish-steel-final/build` directory
3. Configure the following environment variables:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., https://manish-steel-api.vercel.app/api)
   - `REACT_APP_FRONTEND_URL`: Your frontend URL (e.g., https://manish-steel-furniture.vercel.app)
   - `REACT_APP_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name (if using Cloudinary)
   - `REACT_APP_CLOUDINARY_API_KEY`: Your Cloudinary API key (if using Cloudinary)
4. Deploy the project

#### Backend Deployment

1. In Vercel, create another project for the server directory
2. Configure the following environment variables:
   - `NODE_ENV`: Set to `production`
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `FRONTEND_URL`: Your frontend URL (e.g., https://manish-steel-furniture.vercel.app)
3. Deploy the project

#### Verifying Your Deployment

After deployment:
1. Visit your frontend URL to confirm the site is loading correctly
2. Test authentication functionality
3. Test API connections by navigating through products, galleries, etc.
4. Verify image uploads and Cloudinary integration

#### Custom Domain Setup (Optional)

1. Purchase or configure a domain for your website
2. In Vercel's dashboard, go to 'Settings' > 'Domains'
3. Add your custom domain and follow the DNS configuration instructions
4. Update environment variables if needed to match your new domain names

For more detailed instructions, see the `deployment-guide.sh` file in the project root.
