# Manual Deployment Guide

If the automated deployment script (`update-mobile-fixes.sh`) fails, follow these steps to deploy manually:

## Prerequisites
- Ensure you have a Vercel account
- Have access to the Manish Steel Furniture project on Vercel
- Have Node.js installed

## Option 1: Using npx vercel

1. Make sure you're in the project directory
   ```bash
   cd /home/manish/Documents/2furnitureproject/manish-steel-furniture
   ```

2. Build the React app
   ```bash
   cd manish-steel-final
   npm run build
   ```

3. Deploy to Vercel
   ```bash
   npx vercel --prod
   ```

4. Follow the on-screen instructions to log in and deploy

## Option 2: Using the Vercel Dashboard

1. Build the React app
   ```bash
   cd manish-steel-final
   npm run build
   ```

2. Zip the build directory
   ```bash
   zip -r build.zip build
   ```

3. Go to the [Vercel Dashboard](https://vercel.com/dashboard)

4. Select the Manish Steel Furniture project

5. Go to "Deployments" tab

6. Click "New Deployment"

7. Upload the build.zip file

8. Confirm deployment

## Option 3: Using GitHub Integration

1. Commit your changes
   ```bash
   git add .
   git commit -m "Fixed mobile UI issues with product sections"
   git push origin main
   ```

2. Vercel will automatically deploy if GitHub integration is enabled

## Verifying Deployment

After deploying, visit https://manish-steel-furniture.vercel.app on a mobile device and check if the "Our Top Products" and "Most Selling Products" sections are now visible.

## Troubleshooting

If sections are still not visible on mobile:
1. Check browser console for errors
2. Verify that API endpoints are accessible
3. Review network requests to ensure they're using the correct URL:
   - https://manish-steel-api.onrender.com/api/products/featured
   - https://manish-steel-api.onrender.com/api/products?sortBy=salesCount&order=desc
