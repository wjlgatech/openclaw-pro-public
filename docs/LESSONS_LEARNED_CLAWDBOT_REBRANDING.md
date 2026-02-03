# Lessons Learned: Clawdbot Rebranding to Enterprise OpenClaw

## Date: 2026-02-03

## Objective
Rebrand the clawdbot Control UI to "Enterprise OpenClaw" while maintaining ALL existing features and functionality.

## Challenge Summary
Rebrand an npm-installed, compiled application (clawdbot) without access to source code, while preserving all features and fixing authentication issues.

---

## Key Lessons

### 1. **Compiled Applications: Know What You're Modifying**

**Problem:** Clawdbot is distributed as compiled/minified JavaScript bundles. Direct text replacement in minified code breaks functionality.

**What We Learned:**
- Minified JavaScript uses short variable names that might match search terms
- Replacing "CLAWDBOT" in the bundle broke code because it matched variable names
- Source maps exist but source files aren't included in npm packages

**Solution:**
- ✅ **HTML Title**: Easy - edit `/opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/index.html`
- ✅ **Assistant Name/Avatar**: Edit DEFAULT_ASSISTANT_IDENTITY in `dist/gateway/assistant-identity.js`
- ✅ **Logo Text**: Use CSS `::before` pseudo-elements to override text content without breaking JS

**Best Practice:**
```css
/* Safe way to rebrand UI text */
.brand-title {
  font-size: 0 !important;
}
.brand-title::before {
  content: "YOUR BRAND" !important;
  font-size: 18px !important;
  display: block !important;
}
```

### 2. **Gateway Authentication Evolution**

**Problem:** Multiple authentication errors (1006, 1008) preventing Control UI from connecting to gateway.

**Root Cause:** Clawdbot's authentication requirements changed between versions:
- Older versions: `allowInsecureAuth: true` sufficient for loopback
- Newer versions (2026.1.24+): Token auth required even for localhost

**What We Learned:**
```bash
# Version 2026.1.23-1 → 2026.1.24-3 introduced stricter auth
clawdbot doctor  # Shows: "Token auth is now the recommended default (including loopback)"
```

**Solution Steps:**
```bash
# 1. Set matching tokens
clawdbot config set gateway.auth.token "your-token-here"
clawdbot config set gateway.remote.token "your-token-here"

# 2. Restart gateway
clawdbot gateway restart

# 3. Use tokenized URL
clawdbot dashboard  # Auto-opens with correct token
```

**Critical Insight:** Browser localStorage caches old authentication state. Must clear cache or use private/incognito window after auth changes.

### 3. **npm Updates Overwrite Custom Modifications**

**Problem:** Running `npm update -g clawdbot` reverted all our branding changes.

**What Happened:**
```bash
npm update -g clawdbot
# ❌ Overwrote:
# - assistant-identity.js (our branding)
# - index.html (our title change)
# - CSS files (bundle hash changed)
```

**Solutions:**

**Option A: Post-Update Hook Script**
```bash
#!/bin/bash
# scripts/reapply-branding.sh
echo "Reapplying Enterprise OpenClaw branding..."

# 1. Update assistant identity
sed -i '' 's/name: "Assistant"/name: "🦅 Enterprise OpenClaw"/' \
  /opt/homebrew/lib/node_modules/clawdbot/dist/gateway/assistant-identity.js

# 2. Update HTML title
sed -i '' 's/<title>Clawdbot Control/<title>🦅 Enterprise OpenClaw/' \
  /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/index.html

# 3. Add CSS overrides
cat >> /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/assets/index-*.css << 'EOF'
/* Enterprise OpenClaw Branding */
.brand-title { font-size: 0 !important; }
.brand-title::before { content: "ENTERPRISE OPENCLAW" !important; font-size: 18px !important; display: block !important; }
.brand-sub { font-size: 0 !important; }
.brand-sub::before { content: "AI PLATFORM" !important; font-size: 12px !important; display: block !important; }
EOF

echo "✅ Branding reapplied"
```

**Option B: Fork and Maintain Custom Build** (Better for production)
- Fork clawdbot repository
- Apply branding changes to source
- Publish as `@your-org/enterprise-openclaw`
- Update from your own package

**Option C: Wrapper/Proxy Approach**
- Keep clawdbot as-is
- Build custom UI that proxies to clawdbot's API
- Full control over branding

### 4. **WebSocket Error Codes**

**Errors Encountered:**

| Code | Meaning | Cause | Solution |
|------|---------|-------|----------|
| 1006 | Abnormal Closure | Connection closed without close frame | Gateway not ready, check logs |
| 1008 | Policy Violation | Token mismatch, auth failed | Set matching auth tokens |
| 4008 | Custom (clawdbot) | Connection failed | Gateway unreachable |

**Debugging WebSocket Issues:**
```bash
# 1. Check gateway status
clawdbot status | grep Gateway

# 2. Check real-time logs
clawdbot logs

# 3. Check error logs
tail -50 ~/.clawdbot/logs/gateway.err.log

# 4. Look for specific patterns
grep -i "unauthorized\|token\|websocket" ~/.clawdbot/logs/gateway.err.log
```

### 5. **Browser Cache is Persistent**

**Problem:** Even after gateway config changes, browser showed old auth errors.

**What's Cached:**
- LocalStorage: Auth tokens, UI state
- SessionStorage: Temporary session data
- Service Workers: May cache API responses
- Memory: WebSocket connections

**Solutions:**
```bash
# Option 1: Hard refresh (may not clear LocalStorage)
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + F5

# Option 2: Clear browser data
# Chrome DevTools → Application → Clear Storage → Clear site data

# Option 3: Force close and clear
pkill -f "Google Chrome"
rm -rf ~/.clawdbot/browser  # Clawdbot's browser cache
clawdbot gateway restart
clawdbot dashboard  # Opens fresh

# Option 4: Private/Incognito window (cleanest)
```

### 6. **Config File Version Mismatches**

**Warning Seen:**
```
Config was last written by a newer Clawdbot (2026.1.24-0);
current version is 2026.1.23-1.
```

**Impact:** Newer configs may have settings older versions don't understand.

**Solution:**
```bash
# Always update clawdbot before config changes
npm update -g clawdbot
clawdbot --version  # Verify

# Then make config changes
clawdbot config set gateway.auth.token "token"
```

### 7. **Health Check Tools Are Your Friend**

**clawdbot doctor** command revealed the root issue:
```bash
$ clawdbot doctor

◇  Gateway auth ─────────────────────────────
│  Gateway auth is off or missing a token.
│  Token auth is now the recommended default
│  (including loopback).
```

**Always run doctor first:**
```bash
clawdbot doctor        # Quick check
clawdbot status --deep # Comprehensive
```

---

## Final Working Configuration

### File Modifications

**1. Assistant Identity**
```javascript
// /opt/homebrew/lib/node_modules/clawdbot/dist/gateway/assistant-identity.js
export const DEFAULT_ASSISTANT_IDENTITY = {
    agentId: "main",
    name: "🦅 Enterprise OpenClaw",
    avatar: "🦅",
};
```

**2. HTML Title**
```html
<!-- /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/index.html -->
<title>🦅 Enterprise OpenClaw</title>
```

**3. CSS Overrides**
```css
/* /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/assets/index-*.css */
.brand-title { font-size: 0 !important; }
.brand-title::before {
  content: "ENTERPRISE OPENCLAW" !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  display: block !important;
}

.brand-sub { font-size: 0 !important; }
.brand-sub::before {
  content: "AI PLATFORM" !important;
  font-size: 12px !important;
  display: block !important;
  opacity: 0.7 !important;
}
```

**4. Config File**
```json
// ~/.clawdbot/clawdbot.json
{
  "gateway": {
    "mode": "local",
    "controlUi": {
      "allowInsecureAuth": true
    },
    "auth": {
      "token": "enterprise-openclaw-token-2026"
    },
    "remote": {
      "token": "enterprise-openclaw-token-2026"
    }
  },
  "ui": {
    "assistant": {
      "name": "🦅 Enterprise OpenClaw",
      "avatar": "🦅"
    }
  }
}
```

### Access Method

```bash
# Always use clawdbot dashboard command
clawdbot dashboard

# OR manually with token:
# http://127.0.0.1:18789/?token=enterprise-openclaw-token-2026
```

---

## Recommendations for Production

### Option 1: Maintain Fork (Recommended)
1. Fork clawdbot repository
2. Apply branding changes to source code
3. Build and publish as `@your-org/enterprise-openclaw`
4. Users install your branded version
5. Control update cycle

**Pros:** Full control, proper branding, maintainable
**Cons:** Must merge upstream updates

### Option 2: Post-Install Script
```json
// package.json
{
  "scripts": {
    "postinstall": "bash scripts/apply-branding.sh"
  },
  "dependencies": {
    "clawdbot": "^2026.1.24"
  }
}
```

**Pros:** Automatic after npm install
**Cons:** Fragile if clawdbot changes structure

### Option 3: Wrapper Application
Build custom UI → Proxy to clawdbot backend

**Pros:** Complete UI control
**Cons:** Duplicate work, must implement all features

---

## Quick Reference: Troubleshooting

### Issue: "disconnected (1008): unauthorized"
```bash
# 1. Check if tokens match
clawdbot config get gateway.auth.token
clawdbot config get gateway.remote.token

# 2. Set matching tokens
clawdbot config set gateway.auth.token "same-token"
clawdbot config set gateway.remote.token "same-token"

# 3. Restart and use clawdbot dashboard
clawdbot gateway restart
clawdbot dashboard
```

### Issue: "disconnected (1006): no reason"
```bash
# 1. Check gateway is running
clawdbot status | grep Gateway

# 2. Check logs for errors
tail -50 ~/.clawdbot/logs/gateway.err.log

# 3. Restart gateway
clawdbot gateway restart
sleep 3
clawdbot dashboard
```

**RESOLUTION:** The issue was caused by having multiple browser tabs/windows open:
- Old tab: `http://127.0.0.1:18789` (no token) kept trying to reconnect → token_mismatch errors
- New tab: `http://127.0.0.1:18789/?token=enterprise-openclaw-token-2026` (with token) → successful connection

**Solution:** Close all old browser windows and use ONLY the window opened by `clawdbot dashboard` command. Gateway logs confirmed successful WebSocket connections:
```
2026-02-03T20:03:45.029Z [ws] webchat connected
2026-02-03T20:05:16.921Z [ws] ⇄ res ✓ chat.history 79ms
```

### Issue: Branding Not Showing
```bash
# 1. Hard refresh browser
# Cmd + Shift + R (Mac) or Ctrl + Shift + F5 (Windows)

# 2. Clear browser cache completely
# DevTools → Application → Clear Storage

# 3. Try private/incognito window

# 4. Verify files were modified
grep "Enterprise OpenClaw" /opt/homebrew/lib/node_modules/clawdbot/dist/gateway/assistant-identity.js
grep "Enterprise OpenClaw" /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/index.html
grep "ENTERPRISE OPENCLAW" /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/assets/*.css
```

### Issue: Update Reverted Changes
```bash
# After npm update -g clawdbot
bash scripts/reapply-branding.sh  # Run your branding script
clawdbot gateway restart
clawdbot dashboard
```

---

## Time Investment

- Initial rebranding: 2 hours
- Auth troubleshooting: 3 hours
- Creating automation: 1 hour
- **Total: ~6 hours**

**For next time:** 30 minutes with automated script

---

## Conclusion

Rebranding a third-party compiled application is feasible but requires:
1. CSS-based text overrides (safest)
2. Careful JavaScript modifications (backup first)
3. Understanding the auth system evolution
4. Automation for updates
5. Thorough browser cache clearing
6. **CRITICAL:** Always use `clawdbot dashboard` command to open authenticated browser windows

**Best long-term solution:** Fork the repository and maintain a branded version with proper source control.

**Final Status:** ✅ Successfully rebranded to "🦅 Enterprise OpenClaw" with all features preserved and WebSocket authentication working. Control UI is fully functional with Chat, Overview, Channels, Instances, Sessions, Cron Jobs, Skills, Nodes, Config, Debug, and Logs all accessible.

---

## Files to Backup Before Updates

```bash
# Create backup script
#!/bin/bash
mkdir -p ~/.enterprise-openclaw-backups
cp /opt/homebrew/lib/node_modules/clawdbot/dist/gateway/assistant-identity.js ~/.enterprise-openclaw-backups/
cp /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/index.html ~/.enterprise-openclaw-backups/
cp /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/assets/*.css ~/.enterprise-openclaw-backups/
```

---

**Contributors:** Claude Code (AI Assistant), User (Product Owner)
**Date:** February 3, 2026
**Version:** 1.0
