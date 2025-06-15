# Vercel Build & Output Settings Quick Reference

This document provides a quick reference for the build and output settings to use when deploying the Manish Steel Furniture project to Vercel.

## Frontend Settings (manish-steel-final)

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework Preset** | Create React App | Vercel will automatically detect this |
| **Root Directory** | manish-steel-final | If deploying from repository root |
| **Build Command** | npm run build | Creates optimized production build |
| **Output Directory** | build | Default CRA build output folder |
| **Install Command** | npm install | Installs dependencies |
| **Development Command** | npm start | For preview deployments |

## Backend Settings (server)

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework Preset** | Other / Node.js | Choose based on options available |
| **Root Directory** | server | If deploying from repository root |
| **Build Command** | npm install | No separate build step needed |
| **Output Directory** | . | (dot) - Use the root directory |
| **Install Command** | npm install | Installs dependencies |
| **Development Command** | npm run dev | For preview deployments |

## Deployment Steps Summary

### Frontend Deployment:

1. Create new Vercel project
2. Connect to GitHub or upload build folder
3. Configure settings as above
4. Add environment variables
5. Deploy

### Backend Deployment:

1. Create new Vercel project
2. Connect to GitHub or upload server folder
3. Configure settings as above
4. Add environment variables
5. Deploy

## Environment Variables (Quick Reference)

### Frontend:

```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
REACT_APP_CLOUDINARY_API_KEY=your-cloudinary-api-key
```

### Backend:

```
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name  
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

For more detailed deployment instructions, see the VERCEL-DEPLOYMENT-GUIDE.md document.
