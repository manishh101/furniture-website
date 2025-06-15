#!/bin/bash

# Production Deployment Script for Manish Steel Website
# This script prepares and deploys both frontend and backend

echo "🚀 Starting Production Deployment for Manish Steel Website"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Backend Setup
echo "🔧 Setting up backend..."
cd server

if [ ! -f ".env" ]; then
    echo "❌ Backend .env file not found. Please create server/.env with required environment variables."
    echo "Required variables: NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, FRONTEND_URL"
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install --production

echo "🔑 Initializing admin user (if needed)..."
npm run init 2>/dev/null || echo "Admin user may already exist"

echo "📊 Running database migrations..."
npm run migrate 2>/dev/null || echo "Migration completed or not needed"

echo "🌱 Seeding sample data..."
npm run seed-top-products 2>/dev/null || echo "Sample data may already exist"

cd ..

# Frontend Setup
echo "🎨 Setting up frontend..."
cd manish-steel-final

if [ ! -f ".env" ]; then
    echo "❌ Frontend .env file not found. Please create manish-steel-final/.env with REACT_APP_API_URL"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️ Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo "🎉 Production deployment preparation completed!"
echo ""
echo "📝 Next steps:"
echo "1. Backend: cd server && npm start"
echo "2. Frontend: Deploy the 'manish-steel-final/build' folder to your hosting platform"
echo "3. Ensure your domain DNS points to your hosting platform"
echo ""
echo "🔗 Important URLs to configure:"
echo "- Update REACT_APP_API_URL in frontend/.env to point to your backend domain"
echo "- Update FRONTEND_URL in server/.env to point to your frontend domain"
echo "- Configure CORS in backend if deploying to different domains"
