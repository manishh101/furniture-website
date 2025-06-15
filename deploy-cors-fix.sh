#!/bin/bash

# Backend CORS Fix & Deployment Script
# This script commits and pushes your CORS fixes to your Git repository for deployment

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Backend CORS Fix Deployment =====${NC}"
echo -e "This script will commit and push your CORS fixes to your Git repository."
echo "This will trigger a deployment on Render if you have automatic deployments enabled."
echo ""

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not a Git repository.${NC}"
    echo "Please run this script from the root of your Git repository."
    exit 1
fi

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${RED}No changes to commit. Make sure you've made changes to the CORS configuration.${NC}"
    exit 1
fi

echo -e "${YELLOW}The following changes will be committed:${NC}"
git status --short
echo ""

# Ask for confirmation
read -p "Do you want to commit and push these changes? (y/n): " confirm
if [[ $confirm != "y" ]]; then
    echo "Deployment canceled."
    exit 0
fi

# Commit changes
echo ""
echo "Committing changes..."
git add server/server.js update-render-cors.sh test-cors.sh test-api.sh CORS-FIX-GUIDE.md
git commit -m "Fix CORS configuration for Render deployment"

# Check if commit was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to commit changes.${NC}"
    exit 1
fi

# Push changes
echo ""
echo "Pushing changes to remote repository..."
git push

# Check if push was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to push changes.${NC}"
    echo "Please push the changes manually."
    exit 1
fi

echo ""
echo -e "${GREEN}Changes successfully pushed to remote repository!${NC}"
echo ""
echo "Next steps:"
echo "1. Wait for the deployment to complete on Render (usually 1-2 minutes)"
echo "2. Run ./test-cors.sh to verify CORS is working correctly"
echo "3. Check your frontend application to ensure API calls are working"
echo ""
echo -e "${YELLOW}===== Deployment Complete =====${NC}"
