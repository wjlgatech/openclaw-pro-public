#!/bin/bash

# OpenClaw Pro (Community Edition) - One-Click Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/wjlgatech/openclaw-pro-public/main/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Print banner
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}║        OpenClaw Pro Installer            ║${NC}"
echo -e "${BLUE}║     Community Edition - v1.0.0            ║${NC}"
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

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}Creating .env configuration...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Configuration created${NC}"
    echo -e "${MAGENTA}⚠ Please add your ANTHROPIC_API_KEY to .env${NC}"
fi

# Success message
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                           ║${NC}"
echo -e "${GREEN}║     ✓ Installation Complete!             ║${NC}"
echo -e "${GREEN}║                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Start the application automatically
echo -e "${BLUE}Starting OpenClaw Pro servers...${NC}"
echo ""

# Start both servers in background
npm run dev > /tmp/openclaw-pro.log 2>&1 &
SERVER_PID=$!

echo -e "${GREEN}✓ Servers starting (PID: $SERVER_PID)${NC}"
echo -e "${BLUE}  - OpenClaw Gateway: http://localhost:18789${NC}"
echo -e "${BLUE}  - Enterprise API: http://localhost:19000${NC}"
echo ""

# Wait for servers to be ready
echo -e "${YELLOW}Waiting for servers to be ready...${NC}"
for i in {1..20}; do
    if curl -s http://localhost:18789 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Servers ready!${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${YELLOW}⚠ Servers taking longer than expected. Check logs: tail -f /tmp/openclaw-pro.log${NC}"
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                           ║${NC}"
echo -e "${GREEN}║     OpenClaw Pro is Running! 🚀          ║${NC}"
echo -e "${GREEN}║                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Open browser automatically
echo -e "${BLUE}Opening browser...${NC}"
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:18789
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:18789
elif command -v start &> /dev/null; then
    # Windows (Git Bash)
    start http://localhost:18789
else
    echo -e "${YELLOW}Please open your browser to: http://localhost:18789${NC}"
fi

echo ""
echo -e "${BLUE}To stop the servers:${NC}"
echo "     kill $SERVER_PID"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo "     tail -f /tmp/openclaw-pro.log"
echo ""
echo -e "${GREEN}Enterprise features enabled! 🎉${NC}"
echo ""
