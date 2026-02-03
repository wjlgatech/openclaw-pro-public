#!/bin/bash
#
# Inject Voice UI into Clawdbot Control UI
# Adds real-time voice conversation capability
#

set -e

echo "🎙️ Injecting Voice UI into Enterprise OpenClaw..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Find clawdbot installation
CLAWDBOT_PATH="/opt/homebrew/lib/node_modules/clawdbot"
if [ ! -d "$CLAWDBOT_PATH" ]; then
    # Try alternative location
    CLAWDBOT_PATH="$HOME/.nvm/versions/node/$(node -v)/lib/node_modules/clawdbot"
fi

if [ ! -d "$CLAWDBOT_PATH" ]; then
    echo "❌ Clawdbot not found. Please install clawdbot first:"
    echo "   npm install -g clawdbot"
    exit 1
fi

echo "📍 Found clawdbot at: $CLAWDBOT_PATH"

# Backup original files
echo "💾 Creating backup..."
BACKUP_DIR="$HOME/.enterprise-openclaw-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$CLAWDBOT_PATH/dist/control-ui/index.html" "$BACKUP_DIR/" 2>/dev/null || true

echo "✅ Backup saved to: $BACKUP_DIR"

# Copy voice UI assets to clawdbot dist
echo "📋 Copying voice UI assets..."
mkdir -p "$CLAWDBOT_PATH/dist/control-ui/voice-ui"

# Copy compiled JavaScript
if [ -d "$PROJECT_ROOT/dist/voice" ]; then
    cp -r "$PROJECT_ROOT/dist/voice/"* "$CLAWDBOT_PATH/dist/control-ui/voice-ui/"
else
    echo "⚠️ Compiled TypeScript not found. Run ./scripts/build-voice-ui.sh first"
    exit 1
fi

# Copy HTML/CSS
cp "$PROJECT_ROOT/ui/voice-overlay.html" "$CLAWDBOT_PATH/dist/control-ui/voice-ui/" 2>/dev/null || {
    echo "⚠️ Could not copy voice-overlay.html"
}
cp "$PROJECT_ROOT/ui/voice-overlay.css" "$CLAWDBOT_PATH/dist/control-ui/voice-ui/" 2>/dev/null || {
    echo "⚠️ Could not copy voice-overlay.css"
}

# Inject script tag into clawdbot's index.html
echo "💉 Injecting voice UI loader..."
INDEX_HTML="$CLAWDBOT_PATH/dist/control-ui/index.html"

if grep -q "voice-overlay-controller" "$INDEX_HTML"; then
    echo "⚠️ Voice UI already injected. Skipping..."
else
    # Inject before closing body tag
    sed -i '' 's|</body>|<script type="module" src="./voice-ui/voice-overlay-controller.js"></script>\n  </body>|' "$INDEX_HTML"
    echo "✅ Voice UI loader injected"
fi

echo ""
echo "🎉 Voice UI injection complete!"
echo ""
echo "Next steps:"
echo "   1. Set AI Refinery API key (if not already set):"
echo "      export AIR_API_KEY=your-api-key"
echo "      export AIR_BASE_URL=https://api.airefinery.accenture.com"
echo ""
echo "   2. Restart clawdbot gateway:"
echo "      clawdbot gateway restart"
echo ""
echo "   3. Open Control UI:"
echo "      clawdbot dashboard"
echo ""
echo "   4. Look for the floating mic button (bottom-right)"
echo "   5. Press and hold to talk, release to send!"
echo ""
echo "💡 Tip: Press 'P' key as a keyboard shortcut for push-to-talk"
echo ""
echo "🔧 To remove voice UI:"
echo "   ./scripts/remove-voice-ui.sh"
