#!/bin/bash

# API Test Script for Manish Steel API
# This script tests the backend API endpoints without browser CORS restrictions

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default backend URL if none provided
BACKEND_URL=${1:-"https://manish-steel-api.onrender.com"}

echo -e "${YELLOW}===== API Test Script =====${NC}"
echo -e "Testing API endpoints for: ${BLUE}${BACKEND_URL}${NC}"
echo ""

# Test root endpoint
echo -e "${YELLOW}Testing root endpoint (/)${NC}"
response=$(curl -s ${BACKEND_URL})
if [[ $? -eq 0 && $response == *"Manish Steel API is running"* ]]; then
  echo -e "${GREEN}✓ Root endpoint is working${NC}"
  echo -e "Response: $response"
else
  echo -e "${RED}✗ Root endpoint failed${NC}"
  echo -e "Response: $response"
fi
echo ""

# Test health endpoint with /api prefix
echo -e "${YELLOW}Testing health endpoint (/api/health)${NC}"
response=$(curl -s ${BACKEND_URL}/api/health)
if [[ $? -eq 0 && $response == *"healthy"* ]]; then
  echo -e "${GREEN}✓ Health endpoint (/api/health) is working${NC}"
  echo -e "Response: $response"
else
  echo -e "${RED}✗ Health endpoint (/api/health) failed${NC}"
  echo -e "Response: $response"
fi
echo ""

# Test health endpoint without /api prefix
echo -e "${YELLOW}Testing health endpoint (/health)${NC}"
response=$(curl -s ${BACKEND_URL}/health)
if [[ $? -eq 0 && $response == *"healthy"* ]]; then
  echo -e "${GREEN}✓ Health endpoint (/health) is working${NC}"
  echo -e "Response: $response"
else
  echo -e "${RED}✗ Health endpoint (/health) failed${NC}"
  echo -e "Response: $response"
fi
echo ""

# Test categories endpoint
echo -e "${YELLOW}Testing categories endpoint (/api/categories)${NC}"
response=$(curl -s ${BACKEND_URL}/api/categories)
if [[ $? -eq 0 && $response == *"["* ]]; then
  echo -e "${GREEN}✓ Categories endpoint is working${NC}"
  echo -e "Response preview: ${response:0:100}..."
else
  echo -e "${RED}✗ Categories endpoint failed${NC}"
  echo -e "Response: $response"
fi
echo ""

echo -e "${YELLOW}API Test Summary:${NC}"
echo "If all endpoints have green ✓ marks, your API is working correctly."
echo "If you see any red ✗ marks, there may be issues with your API endpoints."
echo -e "${YELLOW}=======================${NC}"
