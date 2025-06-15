#!/bin/bash

# This script helps deploy CORS fixes to Vercel

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Deploying CORS Fix to Vercel =====${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not found.${NC}"
    echo "Please install it using: npm install -g vercel"
    exit 1
fi

# Ensure we're in the correct directory
if [ ! -d "./server" ]; then
    echo -e "${RED}Error: Server directory not found.${NC}"
    echo "Please run this script from the root of the project."
    exit 1
fi

echo -e "${BLUE}Deploying backend with CORS fix...${NC}"
cd server

# Login to Vercel if needed
vercel whoami &> /dev/null || vercel login

# Deploy with environment variable for CORS
echo -e "${GREEN}Deploying to Vercel...${NC}"
vercel deploy --prod \
  -e ALLOWED_ORIGINS="https://manish-steel-furniture-m9ayaff4c-manishh101s-projects.vercel.app,https://manish-steel-furniture.vercel.app,https://manish-steel-furniture-git-main-manishh101s-projects.vercel.app,http://localhost:3000"

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}Backend deployment successful!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait a few minutes for the changes to propagate"
echo "2. Test your frontend application"
echo "3. Check the browser console for any remaining CORS errors"
echo ""
echo -e "${YELLOW}===== Deployment Complete =====${NC}"
