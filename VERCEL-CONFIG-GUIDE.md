# Vercel Configuration Files Guide

This guide explains the vercel.json configuration files in your project and how they're used during deployment.

## Frontend vercel.json

The frontend `vercel.json` file (in `/manish-steel-final/vercel.json`) configures how Vercel should build and serve your React application:

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

### Key Components:

- **version**: Specifies the Vercel platform version (2 is current)
- **builds**: Defines how to build the project
  - `@vercel/static-build`: Builder for static sites from npm build scripts
  - `distDir`: Directory containing the built files (build folder for React)
- **routes**: Defines request routing rules
  - Static asset routes for files in `/static/` and `/images/`
  - Routes for standard web files (favicon, manifest, robots.txt)
  - Catch-all route that sends all other requests to index.html (for SPA routing)

## Backend vercel.json

The backend `vercel.json` file (in `/server/vercel.json`) configures how Vercel should deploy your Node.js API:

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

### Key Components:

- **version**: Specifies the Vercel platform version (2 is current)
- **name**: The name of your project (will appear in Vercel dashboard)
- **builds**: Defines how to build the project
  - `@vercel/node`: Builder for Node.js applications
  - `src`: Entry point for your application (index.js)
- **routes**: Defines request routing rules
  - Route for static uploads to serve files from the uploads directory
  - Catch-all route that directs all other requests to your Node.js application
- **env**: Sets environment variables
  - `NODE_ENV`: Set to "production" for deployment

## Using These Configuration Files

When deploying to Vercel, these files will be automatically detected and used to configure your deployment. You generally don't need to modify them unless you need to change specific behavior.

### Important Notes:

1. **These files take precedence** over the settings you configure in the Vercel dashboard
2. If you're **deploying directly from GitHub**, these files will be used as-is
3. If you're **manually uploading** your built project, make sure to include these files

## Potential Customizations

You might want to customize these files if:

1. You need to **add special routing rules** (e.g., redirects, rewrites)
2. You want to **change the build configuration** (e.g., use a different builder)
3. You need to **set additional environment variables** in the config itself

## For Further Information

For detailed documentation on all available options in vercel.json, refer to:
https://vercel.com/docs/concepts/projects/project-configuration
