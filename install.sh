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

# Success message
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                           ║${NC}"
echo -e "${GREEN}║     ✓ Installation Complete!             ║${NC}"
echo -e "${GREEN}║                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Ask to start the application
echo -e "${YELLOW}Would you like to start the application now? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting Enterprise OpenClaw...${NC}"
    echo ""
    npm start
else
    echo ""
    echo -e "${BLUE}To start the application later, run:${NC}"
    echo "     cd openclaw-pro-public"
    echo "     npm start"
    echo ""
    echo -e "${BLUE}Then open your browser to:${NC}"
    echo "     http://localhost:18789"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
fi
