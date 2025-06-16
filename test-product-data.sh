#!/bin/bash

# API Product Data Test Script
# This script tests the product endpoints to verify they return data

echo "=== Testing API Product Endpoints ==="

API_URL="https://manish-steel-api.onrender.com"

# Check if curl and jq are installed
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y curl
fi

if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Test the featured products endpoint
echo "Testing featured products endpoint: $API_URL/api/products/featured"
FEATURED_RESPONSE=$(curl -s "$API_URL/api/products/featured?limit=6")

# Extract product count using jq if possible
if echo "$FEATURED_RESPONSE" | jq -e '.products' &> /dev/null; then
    PRODUCT_COUNT=$(echo "$FEATURED_RESPONSE" | jq '.products | length')
    echo "✅ Found $PRODUCT_COUNT featured products"
    echo -e "\nProduct names:"
    echo "$FEATURED_RESPONSE" | jq -r '.products[] | .name'
else
    echo "⚠️ No products found or invalid JSON response"
    echo "$FEATURED_RESPONSE" | head -n 20
fi

echo -e "\n-----------------------------------\n"

# Test the best-selling products endpoint
echo "Testing best-selling products endpoint: $API_URL/api/products/best-selling"
BESTSELLING_RESPONSE=$(curl -s "$API_URL/api/products/best-selling?limit=6")

# Extract product count using jq if possible
if echo "$BESTSELLING_RESPONSE" | jq -e '.products' &> /dev/null; then
    PRODUCT_COUNT=$(echo "$BESTSELLING_RESPONSE" | jq '.products | length')
    echo "✅ Found $PRODUCT_COUNT best-selling products"
    echo -e "\nProduct names:"
    echo "$BESTSELLING_RESPONSE" | jq -r '.products[] | .name'
else
    echo "⚠️ No products found or invalid JSON response"
    echo "$BESTSELLING_RESPONSE" | head -n 20
fi

echo -e "\n=== API Product Data Test Complete ==="
