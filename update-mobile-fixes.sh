#!/bin/bash

echo "===== Deploying Mobile UI Fixes for Manish Steel Furniture Website ====="
echo ""

echo "1. Building React App with Mobile-Optimized Components..."
cd manish-steel-final
npm run build

echo ""
echo "2. Verifying Environment Variables..."
echo "Checking if .env.production has correct API URL"
if grep -q "REACT_APP_API_URL=https://manish-steel-api.onrender.com/api" .env.production; then
  echo "✅ API URL correctly configured"
else
  echo "❌ API URL not configured correctly in .env.production"
  echo "Updating .env.production with correct API URL..."
  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://manish-steel-api.onrender.com/api|" .env.production
  echo "✅ API URL updated"
fi

echo ""
echo "3. Running pre-deploy tests..."
echo "Testing API endpoints..."
curl -s "https://manish-steel-api.onrender.com/api/products?limit=1" | grep -q "products" && \
  echo "✅ General products API endpoint accessible" || \
  echo "❌ General products API endpoint not accessible"

curl -s "https://manish-steel-api.onrender.com/api/products/featured?limit=1" | grep -q "products" && \
  echo "✅ Featured products API endpoint accessible" || \
  echo "❌ Featured products API endpoint not accessible"

# Try a direct ping to see if server is available
echo "Checking server availability..."
ping -c 1 manish-steel-api.onrender.com > /dev/null && \
  echo "✅ Server is reachable" || \
  echo "❌ Server is not reachable"

echo ""
echo "4. Deploying to Vercel..."
# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found"
  echo "Installing Vercel CLI..."
  npm install -g vercel
  echo "✅ Vercel CLI installed"
fi

echo "Deploying using Vercel CLI..."
vercel --prod

# If Vercel CLI fails, provide alternative deploy method
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Vercel CLI deployment failed"
  echo "Alternative deployment methods:"
  echo "1. Use manual deployment through Vercel dashboard"
  echo "2. Run: cd manish-steel-final && npx vercel --prod"
  echo "3. Push to GitHub and use Vercel's GitHub integration"
fi

echo ""
echo "===== Deployment Complete! ====="
echo ""
echo "To verify the fix:"
echo "1. Visit https://manish-steel-furniture.vercel.app on your mobile device"
echo "2. Check if 'Our Top Products' and 'Most Selling Products' sections are visible"
echo "3. If issues persist, check for console errors in the browser developer tools"
echo ""
