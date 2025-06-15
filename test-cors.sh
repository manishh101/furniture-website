#!/bin/bash

# Script to test CORS configuration of the backend API
# Usage: ./test-cors.sh [backend-api-url]

# Default backend URL if none provided - updated for Render deployment
BACKEND_URL=${1:-"https://manish-steel-api.onrender.com"}
FRONTEND_URL="https://manish-steel-furniture.vercel.app"

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing CORS configuration for:${NC}"
echo "Backend API: $BACKEND_URL"
echo "Frontend Origin: $FRONTEND_URL"
echo ""

# Test OPTIONS request (preflight)
echo -e "${YELLOW}Testing preflight OPTIONS request...${NC}"
OPTIONS_RESULT=$(curl -s -I -X OPTIONS $BACKEND_URL \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization")

# Check for Access-Control-Allow-Origin header
if echo "$OPTIONS_RESULT" | grep -q "Access-Control-Allow-Origin: $FRONTEND_URL"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Origin header is correctly set${NC}"
elif echo "$OPTIONS_RESULT" | grep -q "Access-Control-Allow-Origin: \*"; then
  echo -e "${YELLOW}⚠ Access-Control-Allow-Origin is set to wildcard '*'${NC}"
  echo "  This works but is not recommended for production"
else
  echo -e "${RED}✗ Access-Control-Allow-Origin header is missing or incorrect${NC}"
  echo "  Your frontend origin is not allowed by the backend"
fi

# Check for Access-Control-Allow-Methods
if echo "$OPTIONS_RESULT" | grep -q "Access-Control-Allow-Methods"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Methods header is set${NC}"
else
  echo -e "${YELLOW}⚠ Access-Control-Allow-Methods header is missing${NC}"
fi

# Check for Access-Control-Allow-Headers
if echo "$OPTIONS_RESULT" | grep -q "Access-Control-Allow-Headers"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Headers header is set${NC}"
else
  echo -e "${YELLOW}⚠ Access-Control-Allow-Headers header is missing${NC}"
fi

# Test actual GET request
echo -e "\n${YELLOW}Testing actual GET request...${NC}"
GET_RESULT=$(curl -s -X GET $BACKEND_URL \
  -H "Origin: $FRONTEND_URL" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$GET_RESULT" | tail -n1)
RESPONSE_BODY=$(echo "$GET_RESULT" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ GET request successful (HTTP 200)${NC}"
  echo "Response preview: ${RESPONSE_BODY:0:100}..."
else
  echo -e "${RED}✗ GET request failed (HTTP $HTTP_CODE)${NC}"
  echo "Response preview: ${RESPONSE_BODY:0:100}..."
fi

echo -e "\n${YELLOW}CORS Test Summary:${NC}"
echo "If all checks passed with green ✓ marks, your CORS configuration is correct."
echo "If you see any red ✗ marks, you need to fix your CORS configuration."
echo "Follow the steps in the CORS-FIX-GUIDE.md to resolve any issues."
