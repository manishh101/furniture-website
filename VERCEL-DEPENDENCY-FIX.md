# Vercel Dependency Resolution Fix

This document explains how to handle React dependency conflicts when deploying to Vercel.

## Issue

When deploying to Vercel, there may be conflicts between React versions, specifically:

- Your project is using React 19.1.0
- `react-beautiful-dnd` requires React ^16.8.5 || ^17.0.0 || ^18.0.0

## Solution

We've implemented the following solution:

1. Modified `package.json` to use the `--legacy-peer-deps` flag during Vercel builds:
   ```json
   "vercel-build": "npm install --legacy-peer-deps && react-scripts build"
   ```

2. This allows npm to ignore peer dependency conflicts and complete the installation.

## Alternative Solutions

If you continue facing issues, you can:

1. **Downgrade React**: Change React version to 18.x in package.json
   ```json
   "react": "^18.2.0",
   "react-dom": "^18.2.0"
   ```

2. **Vercel Environment Variables**: Set a build command override in your Vercel project settings:
   - Go to your Vercel project
   - Navigate to Settings > General > Build & Development Settings
   - Override the build command with: `npm install --legacy-peer-deps && npm run build`

3. **Replace react-beautiful-dnd**: Consider alternatives like `@hello-pangea/dnd` which is compatible with newer React versions.

## Additional Notes

- The `--legacy-peer-deps` flag tells npm to ignore peer dependency conflicts
- This is a workaround and not a permanent solution
- Consider updating to compatible libraries in the future
