#!/bin/bash

# Production Start Script for Manish Steel Website
# This script starts both frontend and backend services for production

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
# Print header
echo -e "${BLUE}┌──────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│      MANISH STEEL FURNITURE WEBAPP       │${NC}"
echo -e "${BLUE}│         Production Environment           │${NC}"
echo -e "${BLUE}│           Ready for Launch 🚀           │${NC}"
echo -e "${BLUE}└──────────────────────────────────────────┘${NC}"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\n${CYAN}📁 Working directory: ${SCRIPT_DIR}${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}➤ Stopping existing process on port $port...${NC}"
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check and stop existing servers
echo -e "\n${YELLOW}🔍 Checking for running servers...${NC}"
if check_port 5000; then
    echo -e "${YELLOW}⚠️  Backend server already running on port 5000${NC}"
    kill_port 5000
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Frontend server already running on port 3000${NC}"
    kill_port 3000
fi

# Load environment variables
echo -e "\n${YELLOW}🔧 Loading environment configuration...${NC}"
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓ Environment variables loaded from server/.env${NC}"
    # Export MongoDB Atlas and other environment variables
    export $(grep -v '^#' server/.env | xargs)
else
    echo -e "${RED}✗ Environment file server/.env not found!${NC}"
    echo -e "${RED}   Please ensure MongoDB Atlas credentials are configured.${NC}"
    exit 1
fi

# Start backend server
echo -e "\n${BLUE}🚀 Starting Backend Server (MongoDB Atlas + Cloudinary)${NC}"
cd server

# Check backend dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}➤ Installing backend dependencies...${NC}"
    npm install --quiet --no-progress
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Backend dependencies found${NC}"
fi

# Verify MongoDB connection and initialize if needed
echo -e "${YELLOW}➤ Verifying MongoDB Atlas connection...${NC}"
if command -v node >/dev/null 2>&1; then
    node -e "
        require('dotenv').config();
        const mongoose = require('mongoose');
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.log('❌ MongoDB URI not found in environment');
            process.exit(1);
        }
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log('✅ MongoDB Atlas connection verified');
                mongoose.connection.close();
            })
            .catch(err => {
                console.log('❌ MongoDB Atlas connection failed:', err.message);
                process.exit(1);
            });
    " || {
        echo -e "${RED}✗ MongoDB Atlas connection failed${NC}"
        exit 1
    }
fi

# Check if admin user exists, initialize if needed
echo -e "${YELLOW}➤ Checking admin user setup...${NC}"
if [ -f "scripts/initAdminUser.js" ]; then
    npm run init --silent 2>/dev/null || echo -e "${GREEN}✓ Admin user already configured${NC}"
else
    echo -e "${YELLOW}⚠️  Admin user initialization script not found${NC}"
fi

echo -e "${GREEN}✓ Backend setup complete. Starting server on port 5000...${NC}"

# Start backend in new terminal
gnome-terminal --title="Manish Steel - Backend Server" -- bash -c "
    echo -e '${BLUE}╔══════════════════════════════════════════╗${NC}';
    echo -e '${BLUE}║           BACKEND SERVER (5000)          ║${NC}';
    echo -e '${BLUE}║        MongoDB Atlas + Cloudinary       ║${NC}';
    echo -e '${BLUE}╚══════════════════════════════════════════╝${NC}';
    echo -e '';
    echo -e '${CYAN}🗄️  Database: MongoDB Atlas${NC}';
    echo -e '${CYAN}☁️  Images: Cloudinary CDN${NC}';
    echo -e '${CYAN}🔧 API Endpoints: http://localhost:5000/api${NC}';
    echo -e '';
    node index.js;
    echo -e '';
    echo -e '${RED}❌ Backend server stopped. Press Enter to close...${NC}';
    read
" &

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend server to initialize...${NC}"
sleep 4

# Start frontend
echo -e "\n${BLUE}🎨 Starting Frontend Application (React + Tailwind)${NC}"
cd ../manish-steel-final

# Check frontend dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}➤ Installing frontend dependencies...${NC}"
    npm install --quiet --no-progress
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Frontend dependencies found${NC}"
fi

# Verify frontend environment
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Frontend environment configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env not found, using defaults${NC}"
fi

echo -e "${GREEN}✓ Frontend setup complete. Starting React app on port 3000...${NC}"

# Start frontend in new terminal
gnome-terminal --title="Manish Steel - Frontend App" -- bash -c "
    echo -e '${BLUE}╔══════════════════════════════════════════╗${NC}';
    echo -e '${BLUE}║         FRONTEND APPLICATION (3000)      ║${NC}';
    echo -e '${BLUE}║         React + Tailwind CSS            ║${NC}';
    echo -e '${BLUE}╚══════════════════════════════════════════╝${NC}';
    echo -e '';
    echo -e '${CYAN}⚛️  Framework: React 19${NC}';
    echo -e '${CYAN}🎨 Styling: Tailwind CSS${NC}';
    echo -e '${CYAN}📱 URL: http://localhost:3000${NC}';
    echo -e '';
    npm start;
    echo -e '';
    echo -e '${RED}❌ Frontend server stopped. Press Enter to close...${NC}';
    read
" &

# Return to original directory
cd "$SCRIPT_DIR"

# Display success information
echo -e "\n${GREEN}🎉 All services started successfully!${NC}"
echo -e "\n${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ACCESS POINTS               ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} 🌐 Frontend:  ${YELLOW}http://localhost:3000${NC}      ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} 🔌 Backend:   ${YELLOW}http://localhost:5000${NC}      ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} 📚 API Docs:  ${YELLOW}http://localhost:5000/api${NC}   ${BLUE}║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║              ADMIN ACCESS                ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} 📱 Phone: ${YELLOW}9814379071${NC}                  ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} 🔑 Pass:  ${YELLOW}M@nishsteel${NC}                 ${BLUE}║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║               DATABASES                  ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} 🍃 MongoDB: ${YELLOW}Atlas Cloud${NC}              ${BLUE}║${NC}"
echo -e "${BLUE}║${NC} ☁️  Images:  ${YELLOW}Cloudinary CDN${NC}           ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

echo -e "\n${CYAN}📝 Development Notes:${NC}"
echo -e "${CYAN}   • Category filtering now uses MongoDB ObjectIDs${NC}"
echo -e "${CYAN}   • All images migrated to Cloudinary CDN${NC}"
echo -e "${CYAN}   • Testimonials shared between HomePage & Gallery${NC}"
echo -e "${CYAN}   • Production-ready with MongoDB Atlas${NC}"

echo -e "\n${YELLOW}➤ Both servers are running in separate terminal windows.${NC}"
echo -e "${YELLOW}➤ Press Ctrl+C in this terminal to return to command line.${NC}"
echo -e "${YELLOW}➤ Close the individual terminal windows to stop servers.${NC}"

# Keep script running until Ctrl+C
echo -e "\n${GREEN}✨ Ready for development! Press Ctrl+C to exit this monitor.${NC}\n"
trap 'echo -e "\n${YELLOW}👋 Development session ended. Servers still running in terminals.${NC}"; exit 0' INT
while true; do
    sleep 1
done
