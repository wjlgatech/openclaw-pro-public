#!/bin/bash

# Update Git Remotes After Repository Rename
# Run this AFTER you've renamed the repos on GitHub

echo "🔄 Updating git remotes for OpenClaw Pro rebrand..."

# Update origin (private repo)
git remote set-url origin https://github.com/wjlgatech/openclaw-pro.git
echo "✅ Updated origin → openclaw-pro"

# Update public repo
git remote set-url public https://github.com/wjlgatech/openclaw-pro-public.git
echo "✅ Updated public → openclaw-pro-public"

# Verify
echo ""
echo "📋 Current remotes:"
git remote -v

echo ""
echo "✅ Done! Remotes updated."
echo ""
echo "Test with:"
echo "  git fetch origin"
echo "  git fetch public"
