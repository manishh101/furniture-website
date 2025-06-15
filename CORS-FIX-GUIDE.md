# CORS Configuration Fix Guide

This guide provides step-by-step instructions for fixing CORS (Cross-Origin Resource Sharing) issues between your frontend and backend deployments.

## 1. Understand the Issue

CORS errors occur when your frontend (deployed on Vercel) tries to make requests to your backend (deployed on Render/Vercel) but the backend doesn't have the correct configuration to allow these requests from the frontend domain.

## 2. Update Backend Environment Variables

### If deployed on Render:

1. Log into your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add or update this environment variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://manish-steel-furniture.vercel.app` (or your actual Vercel frontend URL)
   - If you need multiple origins, separate them with commas (no spaces): `https://manish-steel-furniture.vercel.app,http://localhost:3000`
5. Click "Save Changes"
6. Your service will automatically redeploy with the new configuration

### If deployed on Vercel:

1. Log into your Vercel dashboard
2. Select your backend project
3. Go to "Settings" > "Environment Variables"
4. Add or update this environment variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://manish-steel-furniture.vercel.app` (or your actual Vercel frontend URL)
   - If you need multiple origins, separate them with commas (no spaces): `https://manish-steel-furniture.vercel.app,http://localhost:3000`
5. Click "Save"
6. Redeploy your backend by going to "Deployments" and clicking "Redeploy"

## 3. Verify the Fix

1. Wait for the backend to redeploy completely (this may take a few minutes)
2. Visit your frontend website
3. Open browser developer tools (F12 or Right-click > Inspect)
4. Go to the "Console" tab
5. Check if there are any CORS-related errors
6. Try to use features that require API calls (browsing products, viewing gallery, etc.)

## 4. Troubleshooting

If you're still seeing CORS errors:

1. Verify that the environment variable is set correctly with the exact frontend URL
2. Check that your frontend is using the correct backend URL (REACT_APP_API_URL in your frontend .env)
3. Ensure no typos in either URL
4. Check your backend logs for any CORS-related messages (you should see messages like "CORS blocked for origin: X" if the origin is being rejected)

## 5. For Local Development

When developing locally, you have two options:

1. Include `http://localhost:3000` in your ALLOWED_ORIGINS (recommended)
2. Create a local .env file with a different ALLOWED_ORIGINS value for development

Remember to restart your backend server after any changes to environment variables during local development.
