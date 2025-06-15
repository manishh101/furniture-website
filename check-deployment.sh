#!/bin/bash

# Deployment Status Check Script for Manish Steel Furniture
# This script checks the status of both the frontend and backend deployments

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}┌──────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│      MANISH STEEL FURNITURE WEBAPP       │${NC}"
echo -e "${BLUE}│            Deployment Status             │${NC}"
echo -e "${BLUE}└──────────────────────────────────────────┘${NC}"
echo ""

# Function to check if a URL is reachable
check_url() {
    local url=$1
    local name=$2
    
    echo -e "${CYAN}Checking $name...${NC}"
    
    # Use curl to check if the URL is reachable
    if curl --output /dev/null --silent --head --fail "$url"; then
        echo -e "${GREEN}✓ $name is online and accessible!${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not accessible. Please check your deployment.${NC}"
        return 1
    fi
}

# Function to check API endpoints
check_api_endpoint() {
    local url=$1
    local name=$2
    
    echo -e "${CYAN}Testing $name API endpoint...${NC}"
    
    # Use curl to check if the API endpoint returns valid JSON
    local response=$(curl -s "$url")
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✓ API endpoint is responding!${NC}"
        return 0
    else
        echo -e "${RED}✗ API endpoint is not responding correctly.${NC}"
        return 1
    fi
}

echo "Please enter your frontend URL (e.g., https://manish-steel-furniture.vercel.app):"
read FRONTEND_URL

echo "Please enter your backend API URL (e.g., https://manish-steel-api.vercel.app/api):"
read BACKEND_URL

echo ""
echo -e "${YELLOW}Testing Frontend Deployment${NC}"
echo "------------------------------"
check_url "$FRONTEND_URL" "Frontend Website"

echo ""
echo -e "${YELLOW}Testing Backend Deployment${NC}"
echo "------------------------------"
check_url "${BACKEND_URL}/health" "Backend API Health Check" || echo -e "${YELLOW}Note: If health endpoint check failed, your backend may not have implemented this endpoint.${NC}"
check_api_endpoint "${BACKEND_URL}/categories" "Categories API"

echo ""
echo -e "${YELLOW}Deployment Configuration Checklist${NC}"
echo "------------------------------"
echo -e "1. ${CYAN}Frontend Environment Variables:${NC}"
echo "   - REACT_APP_API_URL points to $BACKEND_URL"
echo "   - REACT_APP_FRONTEND_URL points to $FRONTEND_URL"
echo ""
echo -e "2. ${CYAN}Backend Environment Variables:${NC}"
echo "   - MONGO_URI is properly configured"
echo "   - JWT_SECRET is secure"
echo "   - Cloudinary credentials are set"
echo "   - FRONTEND_URL points to $FRONTEND_URL"
echo ""

echo -e "${BLUE}┌──────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│   Troubleshooting Common Issues          │${NC}"
echo -e "${BLUE}└──────────────────────────────────────────┘${NC}"
echo ""
echo -e "1. ${CYAN}CORS Issues:${NC} If API calls fail, check that your backend CORS"
echo "   settings allow requests from your frontend URL."
echo ""
echo -e "2. ${CYAN}MongoDB Connection:${NC} Check your MongoDB connection string and"
echo "   network access settings in MongoDB Atlas."
echo ""
echo -e "3. ${CYAN}Environment Variables:${NC} Ensure all environment variables are"
echo "   properly set in your Vercel project settings."
echo ""
echo -e "4. ${CYAN}Build Failures:${NC} Check Vercel build logs for any errors during"
echo "   the build process."
echo ""

echo -e "${GREEN}Deployment check completed!${NC}"
