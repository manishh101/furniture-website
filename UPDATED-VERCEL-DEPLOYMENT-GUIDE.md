# Vercel Deployment Guide

## Dependency Resolution Fix - June 15, 2025

We've recently made changes to fix deployment issues with React v19.1.0 and library compatibility:

1. **Added `.npmrc` file** with `legacy-peer-deps=true` setting
2. **Updated `vercel.json`** to explicitly set install command with `--legacy-peer-deps` flag
3. **Replaced `react-beautiful-dnd`** with `@hello-pangea/dnd` (compatible fork)

## Deployment Steps

1. Ensure you're on the latest version of the codebase
2. Push changes to your repository
3. Deploy on Vercel

## Troubleshooting

If you encounter dependency errors during deployment:

```
npm error peer react@"^16.8.5 || ^17.0.0 || ^18.0.0" from react-beautiful-dnd@13.1.1
```

Check that:

1. `.npmrc` file is present in the project root
2. `vercel.json` contains the correct build configuration
3. All `react-beautiful-dnd` imports have been replaced with `@hello-pangea/dnd`

## Manual Override in Vercel Dashboard

If issues persist, you can set the build command override in your Vercel project settings:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > General > Build & Development Settings
3. Override the install command with: `npm install --legacy-peer-deps`
