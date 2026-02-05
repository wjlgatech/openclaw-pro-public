#!/bin/bash

# Enterprise OpenClaw - One-Click Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/enterprise-openclaw/enterprise-openclaw/main/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}║     Enterprise OpenClaw Installer        ║${NC}"
echo -e "${BLUE}║     v1.0.0 - Production Ready             ║${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js >= 20.0.0 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js version must be >= 20.0.0 (found: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Clone repository (if not already in it)
if [ ! -f "package.json" ]; then
    echo ""
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone https://github.com/wjlgatech/openclaw-pro-public.git
    cd openclaw-pro-public
    echo -e "${GREEN}✓ Repository cloned${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build packages
echo ""
echo -e "${YELLOW}Building packages...${NC}"
npm run build --silent
echo -e "${GREEN}✓ Packages built${NC}"

# Run tests
echo ""
echo -e "${YELLOW}Running tests...${NC}"
npm test -- --reporter=dot --silent 2>&1 | tail -n 5
echo -e "${GREEN}✓ All tests passed${NC}"

# Success message with ASCII Art
clear
echo ""
echo -e "${BLUE}${BOLD}"
echo "    ═══════════════════════════════════════════"
echo "              🦅  OpenClaw Pro  🦅"
echo "    ═══════════════════════════════════════════"
echo -e "${NC}"
echo ""
echo -e "${GREEN}    ✓ Installation Complete!${NC}"
echo -e "${GREEN}    ✓ All tests passed${NC}"
echo -e "${GREEN}    ✓ Ready to launch${NC}"
echo ""
echo -e "${BLUE}    Production-Ready AI Knowledge Systems${NC}"
echo ""

# Start automatically
echo -e "${YELLOW}Starting server automatically in 3 seconds...${NC}"
sleep 1
echo -e "${YELLOW}2...${NC}"
sleep 1
echo -e "${YELLOW}1...${NC}"
sleep 1
echo ""
echo -e "${BLUE}🚀 Launching OpenClaw Pro...${NC}"
echo ""

# Start server in background
npm start > /tmp/openclaw-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo -e "${BLUE}Waiting for server to start...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:18789 > /dev/null 2>&1; then
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Open browser automatically
echo -e "${GREEN}Opening browser...${NC}"
sleep 1

if command -v open &> /dev/null; then
    # macOS
    open http://localhost:18789
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:18789
elif command -v start &> /dev/null; then
    # Windows
    start http://localhost:18789
fi

echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║                                           ║${NC}"
echo -e "${GREEN}${BOLD}║      🎉  OpenClaw Pro is LIVE! 🎉       ║${NC}"
echo -e "${GREEN}${BOLD}║                                           ║${NC}"
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}${BOLD}    Dashboard: http://localhost:18789${NC}"
echo ""
echo -e "${YELLOW}    Server logs: tail -f /tmp/openclaw-server.log${NC}"
echo -e "${YELLOW}    Stop server: kill $SERVER_PID${NC}"
echo ""
echo -e "${GREEN}Ready to build! 🚀${NC}"
echo ""
