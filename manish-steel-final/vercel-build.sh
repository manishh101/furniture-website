#!/bin/bash

# Create .env.vercel with settings to disable failing on ESLint warnings
echo "Creating build-specific .env file"
cat > .env.vercel << EOL
CI=false
ESLINT_NO_DEV_ERRORS=true
DISABLE_ESLINT_PLUGIN=true
EOL

# Copy to standard env files to ensure they're picked up
cp .env.vercel .env.local

echo "Running build with ESLint warnings disabled"
CI=false npm run build
