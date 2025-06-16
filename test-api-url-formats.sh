#!/bin/bash

# API Connection Test Script - Enhanced
# This script tests various API configurations to ensure proper URL formatting

echo "=== Enhanced API Connection Test ==="

# Test with proper URL format
echo -e "\n1. Testing with proper URL format:"
GOOD_URL="https://manish-steel-api.onrender.com"
echo "URL: $GOOD_URL/health"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$GOOD_URL/health"

# Test with malformed URL (missing colon after https)
echo -e "\n2. Testing with malformed URL (should fail):"
BAD_URL="https//manish-steel-api.onrender.com"
echo "URL: $BAD_URL/health"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BAD_URL/health" || echo "Failed as expected"

# Test double protocol URL
echo -e "\n3. Testing with environment variable using our fix:"

# Simulate the environment variable from .env.development before our fix
export TEST_API_URL="http://https://manish-steel-api.onrender.com/api"
echo "Original URL: $TEST_API_URL"

# Use our URL sanitization logic in bash
if [[ $TEST_API_URL == http://http* ]]; then
  FIXED_URL="${TEST_API_URL#http://}"
  echo "Fixed URL: $FIXED_URL"
  curl -s -o /dev/null -w "Status: %{http_code}\n" "${FIXED_URL%/api}/health" || echo "Failed"
else
  echo "URL already correct"
fi

# Reset test environment variable
unset TEST_API_URL

echo -e "\n=== API Connection Test Complete ==="
