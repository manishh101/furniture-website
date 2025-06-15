# COMPREHENSIVE VERCEL DEPLOYMENT GUIDE
# Manish Steel Furniture Website

## OVERVIEW

This document provides detailed, step-by-step instructions for deploying both the frontend 
and backend of the Manish Steel Furniture website to Vercel.

## TABLE OF CONTENTS

1. Prerequisites
2. Frontend Deployment (React Application)
3. Backend Deployment (Node.js API)
4. Environment Variables Configuration
5. Custom Domain Setup
6. Post-Deployment Verification
7. Troubleshooting Common Issues

## 1. PREREQUISITES

Before starting the deployment process, ensure you have:

- A Vercel account (Sign up at https://vercel.com)
- Access to your GitHub repository OR the built project files
- MongoDB Atlas account with a configured database
- Cloudinary account (optional, for enhanced image management)
- All necessary API keys and secrets

## 2. FRONTEND DEPLOYMENT (REACT APPLICATION)

### 2.1 Preparing Your Frontend for Deployment

1. Ensure your production environment file is correctly set up:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
   REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   REACT_APP_CLOUDINARY_API_KEY=your-cloudinary-api-key
   ```

2. Build your frontend (optional if deploying from source):
   ```bash
   cd manish-steel-final
   npm install
   npm run build
   ```

### 2.2 Deploying Frontend to Vercel

1. **Log in to Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Log in with your Vercel account

2. **Create a New Project**:
   - Click "Add New"
   - Select "Project"

3. **Import Your Project**:
   - **Option A**: Import from Git Provider
     - Connect your GitHub/GitLab/Bitbucket
     - Select your repository
     - Vercel will automatically detect your project
   
   - **Option B**: Direct Upload 
     - If not using Git, click "Upload"
     - Upload your manish-steel-final/build directory

4. **Configure Project Settings**:
   - **Project Name**: Choose a project name (e.g., manish-steel-furniture)
   - **Framework Preset**: Select "Create React App"
   - **Root Directory**: 
     - If importing entire repository: `manish-steel-final`
     - If uploading build folder: Leave empty

5. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
   - **Development Command**: `npm start`

6. **Environment Variables**:
   - Click "Environment Variables" section
   - Add the following variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app/api
     REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
     REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
     REACT_APP_CLOUDINARY_API_KEY=your-cloudinary-api-key
     ```
   - Set scope to "Production" and "Preview" (or as needed)

7. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-3 minutes)

8. **Verify Frontend Deployment**:
   - Click on the provided URL to visit your deployed frontend
   - Ensure the website loads correctly
   - Check that styles and images are loading properly

## 3. BACKEND DEPLOYMENT (NODE.JS API)

### 3.1 Preparing Your Backend for Deployment

1. Ensure your production environment variables are ready (you'll add them during deployment)
2. Make sure your package.json has proper scripts:
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js",
     "vercel-build": "echo 'Vercel build step'"
   }
   ```

### 3.2 Deploying Backend to Vercel

1. **Create a New Project in Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Click "Add New" > "Project"

2. **Import Your Backend Project**:
   - **Option A**: Import from Git Provider
     - Select your repository (same as frontend)
     - Vercel will detect your project
   
   - **Option B**: Direct Upload
     - If not using Git, upload your server directory

3. **Configure Project Settings**:
   - **Project Name**: Choose a project name (e.g., manish-steel-api)
   - **Framework Preset**: Select "Other" or "Node.js"
   - **Root Directory**: 
     - If importing entire repository: `server`
     - If uploading server folder: Leave empty

4. **Configure Build Settings**:
   - **Build Command**: `npm install`
   - **Output Directory**: `.` (dot - represents root directory)
   - **Install Command**: `npm install`
   - **Development Command**: `npm run dev`

5. **Environment Variables**:
   - Click "Environment Variables" section
   - Add the following variables:
     ```
     NODE_ENV=production
     PORT=8080
     MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
     JWT_SECRET=your-jwt-secret-key
     CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
     CLOUDINARY_API_KEY=your-cloudinary-api-key
     CLOUDINARY_API_SECRET=your-cloudinary-api-secret
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```
   - Set scope to "Production" and "Preview" (or as needed)

6. **Override Settings (if needed)**:
   - If needed, go to "Settings" > "General" after deployment
   - Change "Output Directory" if your build process is different

7. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

8. **Verify Backend Deployment**:
   - Test an API endpoint (e.g., https://your-backend-url.vercel.app/api/categories)
   - Check the Vercel logs for any errors

## 4. ENVIRONMENT VARIABLES CONFIGURATION

### 4.1 Frontend Environment Variables (Detailed)

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| REACT_APP_API_URL | URL of your backend API | https://manish-steel-api.vercel.app/api |
| REACT_APP_FRONTEND_URL | URL of your frontend | https://manish-steel-furniture.vercel.app |
| REACT_APP_CLOUDINARY_CLOUD_NAME | Your Cloudinary cloud name | your-cloud-name |
| REACT_APP_CLOUDINARY_API_KEY | Your Cloudinary API key | 123456789012345 |

### 4.2 Backend Environment Variables (Detailed)

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| NODE_ENV | Environment mode | production |
| PORT | Server port (Vercel will override this) | 8080 |
| MONGO_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | Secret key for JWT tokens | a-long-random-string-for-jwt-security |
| CLOUDINARY_CLOUD_NAME | Your Cloudinary cloud name | your-cloud-name |
| CLOUDINARY_API_KEY | Your Cloudinary API key | 123456789012345 |
| CLOUDINARY_API_SECRET | Your Cloudinary API secret | your-api-secret |
| FRONTEND_URL | URL of your frontend | https://manish-steel-furniture.vercel.app |

## 5. CUSTOM DOMAIN SETUP

1. **Purchase a Domain** (if you don't already have one):
   - Use providers like Namecheap, GoDaddy, or Google Domains
   - Choose a relevant domain name (e.g., manishsteelfurniture.com)

2. **Configure Domain in Vercel**:
   - Go to your frontend project in Vercel
   - Navigate to "Settings" > "Domains"
   - Click "Add" and enter your domain
   - Choose between adding a domain or a subdomain

3. **Configure DNS Settings**:
   - **Option A**: Use Vercel DNS
     - In your domain provider's dashboard, change nameservers to Vercel's
     - Vercel will provide the exact nameservers to use
   
   - **Option B**: Keep your current DNS provider
     - Add the recommended DNS records (A, CNAME) that Vercel provides
     - This typically involves adding:
       - An A record pointing to Vercel's IP
       - A CNAME record for the www subdomain

4. **Verify Domain Configuration**:
   - Wait for DNS propagation (can take up to 48 hours)
   - Vercel will show a green checkmark when your domain is properly configured
   - Visit your domain to confirm it loads your website

5. **Update Environment Variables** (if needed):
   - Update FRONTEND_URL in backend to use your custom domain
   - Update REACT_APP_FRONTEND_URL in frontend to use your custom domain

## 6. POST-DEPLOYMENT VERIFICATION

Run through this checklist to ensure your deployment is successful:

1. **Frontend Verification**:
   - Website loads correctly at your domain/Vercel URL
   - All images and styles load properly
   - Navigation works between all pages
   - Responsive design works on mobile devices

2. **Backend Verification**:
   - API endpoints respond correctly
   - Test authentication (login/register)
   - Test data retrieval (products, categories, etc.)
   - Test image uploads if applicable

3. **Cross-functional Verification**:
   - Frontend can communicate with backend API
   - Authentication flow works end-to-end
   - Form submissions work correctly
   - Search and filtering functionality works

## 7. TROUBLESHOOTING COMMON ISSUES

### 7.1 Frontend Deployment Issues

- **Build Failures**:
  - Check Vercel deployment logs
  - Ensure all dependencies are correctly listed in package.json
  - Verify your build command is correct

- **Environment Variable Issues**:
  - Ensure all environment variables are correctly set
  - Remember that variable names must start with REACT_APP_ for Create React App

- **Styling Issues**:
  - Check for relative path issues in your CSS
  - Ensure all required assets are included in the build

### 7.2 Backend Deployment Issues

- **API Not Responding**:
  - Check Vercel function logs for errors
  - Verify your server.js/index.js is correctly set up for Vercel
  - Ensure your server is listening on the port provided by Vercel

- **Database Connection Issues**:
  - Verify your MongoDB connection string is correct
  - Ensure your MongoDB Atlas IP whitelist includes Vercel's IPs or is set to allow all

- **CORS Issues**:
  - Check that your backend CORS configuration allows requests from your frontend domain
  - Test with specific origins rather than allowing all origins

### 7.3 Debugging Tools

- **Vercel Logs**:
  - Access deployment logs in your project dashboard
  - Check function logs for backend errors

- **Browser Developer Tools**:
  - Check the Console for JavaScript errors
  - Check the Network tab for failed API requests
  - Check Application > Storage for any local storage/cookie issues

- **API Testing**:
  - Use tools like Postman to test your API endpoints directly

## CONCLUSION

Your Manish Steel Furniture website should now be successfully deployed to Vercel with both frontend and backend components working together seamlessly. If you encounter any issues during deployment, refer to the troubleshooting section or consult Vercel's documentation at https://vercel.com/docs.
