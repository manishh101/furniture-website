# Visual Step-by-Step Vercel Deployment Guide

This guide provides visual, step-by-step instructions for deploying your Manish Steel Furniture website to Vercel, focusing on the frontend deployment with the specific fixes we've implemented.

## 1. Prepare Your Repository

Before deploying to Vercel, make sure these key files are in your repository:

- ✅ `vercel.json` - Configures the Vercel deployment
- ✅ `vercel-build-override.sh` - Custom build script to avoid ESLint failures
- ✅ `.npmrc` - Dependency resolution settings
- ✅ `.env.production` - Production environment variables

## 2. Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Login using your GitHub account
3. Click "New Project"

## 3. Import Your GitHub Repository

![Import Repository](https://i.imgur.com/wQMkSdh.png)

1. Select "Import Git Repository"
2. Find and select your `manish-steel-furniture` repository
3. Click "Import"

## 4. Configure Project Settings

![Configure Project](https://i.imgur.com/LNFMnRz.png)

Configure the build settings as follows:

- **Framework Preset**: Create React App
- **Project Name**: `furniture-website` or your preferred name
- **Root Directory**: `manish-steel-final` (select your frontend directory)
- **Build Command**: Override with `./vercel-build-override.sh`
- **Output Directory**: `build`
- **Install Command**: `npm install --legacy-peer-deps`

## 5. Set Environment Variables

![Set Environment Variables](https://i.imgur.com/9UvdZJY.png)

Add these environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `REACT_APP_API_URL` | https://manish-steel-api.vercel.app/api | The URL of your backend API |
| `CI` | false | Prevents ESLint warnings from breaking the build |
| `DISABLE_ESLINT_PLUGIN` | true | Disables ESLint plugin during build |
| `ESLINT_NO_DEV_ERRORS` | true | Further ensures ESLint won't cause build errors |

## 6. Initial Deployment

For the first deployment:

1. Scroll down to "Build and Output Settings"
2. For "Use Build Cache", select "No" for the first deployment
   ![Disable Build Cache](https://i.imgur.com/QHVcv5N.png)
3. Click "Deploy"

## 7. Verify Deployment and Update Environment Variables

After the first successful deployment:

1. Get your Vercel-generated domain (e.g., `furniture-website-j7s6.vercel.app`)
2. Go to your project's Settings > Environment Variables
3. Update the `REACT_APP_FRONTEND_URL` to match your actual frontend URL
4. Click "Save"
5. Navigate to Deployments tab and trigger a new deployment

## 8. Test the Connection Between Frontend and Backend

1. Visit your deployed site and test key functionality:
   ```
   https://furniture-website-j7s6.vercel.app/products
   https://furniture-website-j7s6.vercel.app/gallery
   ```

2. Check that:
   - Products and categories load properly
   - Images are displayed correctly
   - Navigation and UI elements work as expected

## 9. Enable Build Cache for Future Deployments

For subsequent deployments:

1. Go to Project Settings > General
2. Under "Build & Development Settings", enable "Use Build Cache"
3. Click "Save"

## 10. Set Custom Domain (Optional)

To use your own domain:

1. Go to Project Settings > Domains
2. Enter your domain name (e.g., manishsteel.com)
3. Follow the instructions to configure DNS settings

## 11. Continuous Deployment

Vercel automatically deploys your site when you push to the main branch. You can also:

1. Configure branch deployments for previews
2. Set up environment variables per branch/environment
3. Use deployment protection for production

---

## Troubleshooting Common Issues

### Issue: Build Fails with ESLint Warnings

**Solution:**
1. Verify `vercel-build-override.sh` is executable
2. Check that `CI=false` is in environment variables
3. Remove any comments from your `vercel.json` (it must be valid JSON)

### Issue: Frontend Can't Connect to Backend

**Solution:**
1. Check the API URL in environment variables
2. Verify backend CORS settings include your frontend URL
3. Test backend endpoints independently

### Issue: "React dependency conflict" Error

**Solution:**
1. Ensure `.npmrc` has `legacy-peer-deps=true`
2. Check that you're using the compatible `@hello-pangea/dnd` library
3. Make sure install command includes `--legacy-peer-deps`

---

If you need further assistance, refer to the more detailed [VERCEL-COMPLETE-DEPLOYMENT-GUIDE.md](/home/manish/Documents/2furnitureproject/manish-steel-furniture/VERCEL-COMPLETE-DEPLOYMENT-GUIDE.md) or Vercel's official documentation.
