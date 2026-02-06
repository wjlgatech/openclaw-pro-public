#!/bin/bash

# OpenClaw Pro - Desktop App Startup Script
# Starts both OpenClaw Gateway and Enterprise API servers

set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if already running
if lsof -Pi :18789 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${BLUE}OpenClaw Pro is already running!${NC}"
    echo -e "${BLUE}Opening browser...${NC}"

    # Open browser
    if command -v open &> /dev/null; then
        open http://localhost:18789
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:18789
    fi
    exit 0
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found${NC}"
    echo "Please install Node.js >= 20.0.0 from https://nodejs.org/"
    exit 1
fi

# Check if built
if [ ! -d "packages/core/dist" ]; then
    echo -e "${BLUE}Building OpenClaw Pro...${NC}"
    npm run build
fi

# Check .env
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env from template...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠ Please add your ANTHROPIC_API_KEY to .env${NC}"
    echo -e "${RED}⚠ Then restart the application${NC}"
    exit 1
fi

# Start servers
echo -e "${GREEN}Starting OpenClaw Pro...${NC}"

# Create log directory
mkdir -p logs

# Start in background
npm run dev > logs/app.log 2>&1 &
SERVER_PID=$!

# Save PID for later shutdown
echo $SERVER_PID > /tmp/openclaw-pro.pid

# Wait for servers to be ready
echo -e "${BLUE}Waiting for servers...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:18789 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OpenClaw Pro is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Servers failed to start. Check logs/app.log${NC}"
        exit 1
    fi
    sleep 1
done

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:18789
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:18789
elif command -v start &> /dev/null; then
    start http://localhost:18789
fi

echo -e "${GREEN}OpenClaw Pro is running!${NC}"
echo -e "${BLUE}Gateway: http://localhost:18789${NC}"
echo -e "${BLUE}Enterprise API: http://localhost:19000${NC}"
echo ""
echo -e "To stop: kill \$(cat /tmp/openclaw-pro.pid)"
