# Vercel Build and Output Settings Guide

This document provides detailed information about the build and output settings for deploying your Manish Steel Furniture project to Vercel.

## Frontend (React Application)

### Project Settings

When deploying your React application in the `manish-steel-final` directory to Vercel, use these settings:

| Setting | Value | Description |
|---------|-------|-------------|
| **Framework Preset** | `Create React App` | Tells Vercel this is a React app built with CRA |
| **Build Command** | `npm run build` | The command to create a production build |
| **Output Directory** | `build` | Where the production files are generated |
| **Install Command** | `npm install` | Command to install dependencies |
| **Development Command** | `npm start` | Command for development server |
| **Root Directory** | `manish-steel-final` | *Only if deploying from repo root* |

### Advanced Build Settings

- **Node.js Version**: 16.x (or the latest LTS version)
- **Include source maps**: Enabled (helps with debugging)
- **Build cache**: Enabled (speeds up deployments)

### Routes Configuration

The `vercel.json` file in your frontend already contains the necessary routes configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/images/(.*)",
      "dest": "/images/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/robots.txt",
      "dest": "/robots.txt"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Backend (Node.js Server)

### Project Settings

When deploying your Express backend in the `server` directory to Vercel, use these settings:

| Setting | Value | Description |
|---------|-------|-------------|
| **Framework Preset** | `Node.js` | Tells Vercel this is a Node.js app |
| **Build Command** | `npm install` | For serverless functions, just need to install dependencies |
| **Output Directory** | `.` (dot) | Use the root of the deployment |
| **Install Command** | `npm install` | Command to install dependencies |
| **Development Command** | `npm run dev` | Command for development server |
| **Root Directory** | `server` | *Only if deploying from repo root* |

### Advanced Build Settings

- **Node.js Version**: 16.x (or the latest LTS version)
- **Include source maps**: Enabled (helps with debugging)

### Routes Configuration

The `vercel.json` file in your server directory already contains the necessary configuration:

```json
{
  "version": 2,
  "name": "manish-steel-api",
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/uploads/(.*)",
      "dest": "/uploads/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Separate vs. Monorepo Deployment

### Separate Deployments (Recommended)

For the most clarity and control, deploy the frontend and backend as separate Vercel projects.

### Monorepo Deployment (Alternative)

If you want to deploy from a single repository:

1. Create a root `vercel.json` with:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" }
     ]
   }
   ```

2. Set your project settings:
   - Root directory: `/` (repository root)
   - For frontend: Create a Build Output setting pointing to `/manish-steel-final/build`
   - For backend: Create Serverless Functions pointing to `/server`

## Troubleshooting Common Build Issues

1. **Build Failures**
   - Check Vercel's build logs for specific errors
   - Ensure all dependencies are correctly specified in package.json
   - Verify Node.js version compatibility

2. **404 Not Found for Routes**
   - Check your vercel.json routes configuration
   - For React Router, ensure all routes redirect to index.html

3. **API Connection Issues**
   - Verify environment variables are correctly set
   - Check CORS configuration in your backend
   - Ensure API URLs are correct in frontend code

4. **Deployment Preview Differences**
   - Preview deployments use different URLs than production
   - Update environment variables for preview branches if needed
