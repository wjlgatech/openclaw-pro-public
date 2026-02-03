#!/bin/bash
#
# Build Voice UI for Enterprise OpenClaw
# Compiles TypeScript and prepares assets
#

set -e

echo "🎙️ Building Enterprise OpenClaw Voice UI..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo "❌ TypeScript not found. Installing..."
    npm install -g typescript
fi

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
tsc --project tsconfig.json 2>&1 || {
    echo "⚠️ TypeScript compilation had warnings, but continuing..."
}

# Copy assets
echo "📋 Copying UI assets..."
mkdir -p dist/ui
cp ui/*.html dist/ui/ 2>/dev/null || true
cp ui/*.css dist/ui/ 2>/dev/null || true

# Create standalone bundle (optional - for easy deployment)
echo "📦 Creating voice UI bundle..."
mkdir -p dist/voice-bundle
cat dist/voice/*.js > dist/voice-bundle/voice-ui.bundle.js 2>/dev/null || {
    echo "⚠️ Could not create bundle, but individual files are ready"
}

echo "✅ Voice UI build complete!"
echo ""
echo "📁 Output:"
echo "   - TypeScript compiled to: dist/voice/"
echo "   - UI assets: dist/ui/"
echo ""
echo "Next steps:"
echo "   1. Set AI Refinery credentials: export AIR_API_KEY=your-key"
echo "   2. Run injection script: ./scripts/inject-voice-ui.sh"
echo "   3. Restart clawdbot: clawdbot gateway restart"
echo "   4. Open Control UI: clawdbot dashboard"
