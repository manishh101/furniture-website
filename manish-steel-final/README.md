# Manish Steel Furniture - Frontend

Modern React-based frontend for the Manish Steel Furniture e-commerce platform.

## Technology Stack

- React 19.x with Function Components and Hooks
- React Router v7 for navigation
- Tailwind CSS for responsive styling
- Axios for API communication
- JWT authentication
- React Hook Form for form handling
- React Toastify for notifications
- Custom lightbox gallery implementation

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Create .env file
   echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" > .env
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
```

## Architecture

The application follows a component-based architecture with:

- **Pages**: Full-page components (Home, Products, etc.)
- **Components**: Reusable UI elements
- **Services**: API communication modules
- **Utils**: Helper functions and data structures

## Admin System

Access the admin panel at `/admin/login` with credentials:
- Phone: 9814379071
- Password: M@nishsteel

## Deployment

For deployment instructions, see [/docs/DEPLOYMENT_STEPS.md](/docs/DEPLOYMENT_STEPS.md) in the project root.
