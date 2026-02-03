#!/bin/bash

# Enterprise OpenClaw - Private Repository Note
# This repository (enterprise-openclaw) IS the private repository

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}║   Private Repository (Current Repo)      ║${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}This repository (enterprise-openclaw) is already the PRIVATE repository.${NC}"
echo ""
echo -e "${BLUE}To publish updates:${NC}"
echo "  git push origin main"
echo ""
echo -e "${BLUE}To publish core to public:${NC}"
echo "  ./scripts/publish-public.sh"
echo ""
echo -e "${BLUE}Repository structure:${NC}"
echo "  • origin (private): https://github.com/wjlgatech/enterprise-openclaw.git"
echo "  • public: https://github.com/wjlgatech/enterprise-openclaw-public.git"
echo ""
