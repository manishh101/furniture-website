#!/bin/bash

# CORS Test Script for Preview URL
# Tests CORS configuration for your Vercel preview deployment

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL to test
BACKEND_URL=${1:-"https://manish-steel-api.vercel.app"}

# Frontend origin to use in CORS test
FRONTEND_URL="https://manish-steel-furniture-m9ayaff4c-manishh101s-projects.vercel.app"

echo -e "${YELLOW}===== CORS Test for Preview URL =====${NC}"
echo -e "Testing CORS configuration for:"
echo -e "Backend API: ${BLUE}${BACKEND_URL}${NC}"
echo -e "Frontend Origin: ${BLUE}${FRONTEND_URL}${NC}"
echo ""

# Test preflight OPTIONS request
echo -e "${YELLOW}Testing preflight OPTIONS request...${NC}"
CORS_HEADERS=$(curl -s -I -X OPTIONS "${BACKEND_URL}/api/health" \
  -H "Origin: ${FRONTEND_URL}" \
  -H "Access-Control-Request-Method: GET")

# Check if Access-Control-Allow-Origin header is present
if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
  if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin:.*$FRONTEND_URL" || \
     echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo -e "${GREEN}✓ Access-Control-Allow-Origin header is correctly set${NC}"
  else
    echo -e "${RED}✗ Access-Control-Allow-Origin header is present but doesn't include your frontend origin${NC}"
  fi
else
  echo -e "${RED}✗ Access-Control-Allow-Origin header is missing or incorrect${NC}"
  echo -e "  Your frontend origin is not allowed by the backend"
fi

# Check if Access-Control-Allow-Methods header is present
if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Methods"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Methods header is present${NC}"
else
  echo -e "${YELLOW}⚠ Access-Control-Allow-Methods header is missing${NC}"
fi

# Check if Access-Control-Allow-Headers header is present
if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Headers"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Headers header is present${NC}"
else
  echo -e "${YELLOW}⚠ Access-Control-Allow-Headers header is missing${NC}"
fi

# Test actual GET request
echo -e "\n${YELLOW}Testing actual GET request...${NC}"
GET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/health" \
  -H "Origin: ${FRONTEND_URL}")

if [ "$GET_RESPONSE" == "200" ]; then
  echo -e "${GREEN}✓ GET request successful (HTTP 200)${NC}"
  # Show a preview of the response
  RESPONSE_PREVIEW=$(curl -s "${BACKEND_URL}/api/health" -H "Origin: ${FRONTEND_URL}" | head -c 80)
  echo -e "Response preview: ${RESPONSE_PREVIEW}..."
else
  echo -e "${RED}✗ GET request failed (HTTP ${GET_RESPONSE})${NC}"
  RESPONSE_PREVIEW=$(curl -s "${BACKEND_URL}/api/health" -H "Origin: ${FRONTEND_URL}" | head -c 80)
  echo -e "Response preview: ${RESPONSE_PREVIEW}..."
fi

echo -e "\n${YELLOW}CORS Test Summary:${NC}"
echo "If all checks passed with green ✓ marks, your CORS configuration is correct."
echo "If you see any red ✗ marks, you need to fix your CORS configuration."
echo "Follow the steps in the CORS-FIX-GUIDE.md to resolve any issues."
