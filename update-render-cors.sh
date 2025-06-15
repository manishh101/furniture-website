#!/bin/bash

# This script helps set up CORS configuration for your Render deployment
# You'll need the Render CLI installed and be logged in

echo "===== Render CORS Configuration Helper ====="
echo "This script will help you add CORS configuration to your Render service."
echo "Make sure you have Render CLI installed and are logged in."
echo ""

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Error: Render CLI not found!"
    echo "Please install it first: npm install -g render-cli"
    exit 1
fi

# Ask for the Render service name
read -p "Enter your Render service name (e.g. manish-steel-api): " SERVICE_NAME

# Ask for allowed origins
echo ""
echo "Enter the allowed origins (comma-separated, no spaces):"
echo "Example: https://manish-steel-furniture.vercel.app,http://localhost:3000"
read -p "Allowed Origins: " ALLOWED_ORIGINS

# Confirm values
echo ""
echo "You entered:"
echo "Service Name: $SERVICE_NAME"
echo "Allowed Origins: $ALLOWED_ORIGINS"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [[ $CONFIRM != "y" ]]; then
    echo "Aborted. Please run the script again with the correct information."
    exit 0
fi

echo ""
echo "Setting environment variable on Render..."

# Set the environment variable
render env set ALLOWED_ORIGINS="$ALLOWED_ORIGINS" --service $SERVICE_NAME

# Check if command was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✓ CORS configuration complete!"
    echo ""
    echo "Your Render service will automatically redeploy with the new configuration."
    echo "Once the deployment is complete, run ./test-cors.sh to verify CORS is working correctly."
else
    echo ""
    echo "⚠ Error setting environment variable"
    echo ""
    echo "Alternative method:"
    echo "1. Log into your Render dashboard at https://dashboard.render.com"
    echo "2. Select your service '$SERVICE_NAME'"
    echo "3. Go to Environment"
    echo "4. Add a new environment variable:"
    echo "   Key: ALLOWED_ORIGINS"
    echo "   Value: $ALLOWED_ORIGINS"
    echo "5. Click Save Changes and wait for the service to redeploy"
fi

echo ""
echo "===== End of CORS Configuration Helper ====="
