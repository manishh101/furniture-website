#!/bin/bash

# API Connection Test Script
# This script tests the connection to the API server

echo "=== Testing API Connection ==="

API_URL="https://manish-steel-api.onrender.com"

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y curl
fi

# Test the API health endpoint
echo "Testing API health endpoint: $API_URL/health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo "✅ API health check succeeded (Status: $HEALTH_RESPONSE)"
else
    echo "⚠️ API health check failed (Status: $HEALTH_RESPONSE)"
fi

# Test the products endpoint
echo -e "\nTesting API products endpoint: $API_URL/api/products"
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/products?limit=1")

if [ "$PRODUCTS_RESPONSE" -eq 200 ]; then
    echo "✅ API products check succeeded (Status: $PRODUCTS_RESPONSE)"
else
    echo "⚠️ API products check failed (Status: $PRODUCTS_RESPONSE)"
fi

# Test the featured products endpoint
echo -e "\nTesting API featured products endpoint: $API_URL/api/products/featured"
FEATURED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/products/featured?limit=1")

if [ "$FEATURED_RESPONSE" -eq 200 ]; then
    echo "✅ API featured products check succeeded (Status: $FEATURED_RESPONSE)"
else
    echo "⚠️ API featured products check failed (Status: $FEATURED_RESPONSE)"
fi

echo -e "\n=== API Connection Test Complete ==="
