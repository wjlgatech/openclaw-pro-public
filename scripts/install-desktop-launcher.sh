#!/bin/bash

# OpenClaw Pro - Desktop Launcher Installation Script
# Installs desktop app launcher for the current platform

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}OpenClaw Pro - Desktop Launcher Installer${NC}"
echo ""

# Detect platform
OS="$(uname -s)"
case "$OS" in
    Darwin)
        echo -e "${GREEN}Platform: macOS${NC}"
        echo ""

        # macOS: Copy .app to Applications
        if [ -d "$PROJECT_DIR/OpenClaw Pro.app" ]; then
            echo -e "${YELLOW}Installing OpenClaw Pro to Applications...${NC}"

            # Remove old version if exists
            if [ -d "/Applications/OpenClaw Pro.app" ]; then
                rm -rf "/Applications/OpenClaw Pro.app"
            fi

            # Copy to Applications
            cp -R "$PROJECT_DIR/OpenClaw Pro.app" /Applications/

            echo -e "${GREEN}✓ OpenClaw Pro installed to Applications${NC}"
            echo ""
            echo -e "${BLUE}You can now launch OpenClaw Pro from:${NC}"
            echo "  - Spotlight (Cmd+Space): Type 'OpenClaw Pro'"
            echo "  - Launchpad"
            echo "  - Applications folder"
        else
            echo -e "${RED}Error: OpenClaw Pro.app not found${NC}"
            exit 1
        fi
        ;;

    Linux)
        echo -e "${GREEN}Platform: Linux${NC}"
        echo ""

        # Linux: Install .desktop file
        if [ -f "$PROJECT_DIR/openclaw-pro.desktop" ]; then
            echo -e "${YELLOW}Installing desktop launcher...${NC}"

            # Create applications directory if it doesn't exist
            mkdir -p ~/.local/share/applications

            # Replace PATH_TO_PROJECT with actual path
            sed "s|/PATH_TO_PROJECT|$PROJECT_DIR|g" "$PROJECT_DIR/openclaw-pro.desktop" > ~/.local/share/applications/openclaw-pro.desktop

            # Make executable
            chmod +x ~/.local/share/applications/openclaw-pro.desktop

            # Update desktop database
            if command -v update-desktop-database &> /dev/null; then
                update-desktop-database ~/.local/share/applications/
            fi

            echo -e "${GREEN}✓ Desktop launcher installed${NC}"
            echo ""
            echo -e "${BLUE}You can now launch OpenClaw Pro from:${NC}"
            echo "  - Application menu"
            echo "  - Search/Activities"
        else
            echo -e "${RED}Error: openclaw-pro.desktop not found${NC}"
            exit 1
        fi
        ;;

    MINGW*|MSYS*|CYGWIN*)
        echo -e "${GREEN}Platform: Windows${NC}"
        echo ""
        echo -e "${YELLOW}Creating desktop shortcut...${NC}"

        # Windows: Create desktop shortcut
        DESKTOP="$(cygpath -u "$USERPROFILE/Desktop" 2>/dev/null || echo "$HOME/Desktop")"

        if [ -f "$PROJECT_DIR/OpenClaw-Pro.bat" ]; then
            # Create shortcut on desktop
            cp "$PROJECT_DIR/OpenClaw-Pro.bat" "$DESKTOP/OpenClaw Pro.bat"

            echo -e "${GREEN}✓ Desktop shortcut created${NC}"
            echo ""
            echo -e "${BLUE}You can now launch OpenClaw Pro from:${NC}"
            echo "  - Desktop shortcut: OpenClaw Pro.bat"
            echo "  - Or run: OpenClaw-Pro.bat from the project directory"
        else
            echo -e "${RED}Error: OpenClaw-Pro.bat not found${NC}"
            exit 1
        fi
        ;;

    *)
        echo -e "${RED}Unsupported platform: $OS${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Installation complete! 🎉${NC}"
echo ""
