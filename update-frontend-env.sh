#!/bin/bash

# Frontend environment variables update script for Vercel deployment
# This script updates the environment variables in your Vercel frontend deployment

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Updating Frontend Environment Variables on Vercel =====${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not found.${NC}"
    echo "Please install it using: npm install -g vercel"
    exit 1
fi

# Ensure we're in the correct directory
if [ ! -d "./manish-steel-final" ]; then
    echo -e "${RED}Error: Frontend directory not found.${NC}"
    echo "Please run this script from the root of the project."
    exit 1
fi

# Login to Vercel if needed
vercel whoami &> /dev/null || vercel login

echo -e "${BLUE}Setting environment variables for your frontend deployment...${NC}"

# Add/update environment variables
echo -e "${GREEN}Adding/updating REACT_APP_API_URL...${NC}"
vercel env add REACT_APP_API_URL https://manish-steel-api.onrender.com/api production

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to update environment variable. Trying another approach...${NC}"
    # Alternative approach if the above fails
    vercel env rm REACT_APP_API_URL production --yes
    vercel env add REACT_APP_API_URL https://manish-steel-api.onrender.com/api production
fi

# Deploy with the updated environment variables
echo -e "${GREEN}Deploying frontend with updated environment variables...${NC}"
cd manish-steel-final
vercel --prod

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend deployment successful!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait a few minutes for the changes to propagate"
echo "2. Open your frontend website and check if the API requests are working"
echo "3. Clear your browser cache if needed"
echo ""
echo -e "${YELLOW}===== Deployment Complete =====${NC}"
