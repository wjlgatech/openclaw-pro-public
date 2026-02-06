# Architecture Findings - Feb 5, 2026

## Current State (INCORRECT)

### What's Running Now
- `server.ts` runs a custom "Enterprise OpenClaw" UI on port **18789**
- This is a standalone application with its own chat UI
- NOT integrated with real OpenClaw (clawdbot)

### Problem
User feedback: "It should be an openclaw app with pro dashboard as an add on"

The current implementation **replaces** OpenClaw instead of **enhancing** it.

---

## Correct Architecture (from Memory File)

### Two-Server Model
```
┌─────────────────────────────────────────┐
│  Port 18789: Clawdbot Gateway          │
│  (Real OpenClaw Application)           │
│  • WebSocket Gateway                   │
│  • Control UI Dashboard                │
│  • Agent Orchestration                 │
└─────────────────────────────────────────┘
              ↓
         Injects Enterprise Features via JavaScript
              ↓
┌─────────────────────────────────────────┐
│  Port 19000: Enterprise OpenClaw API   │
│  (Our Backend Server)                  │
│  • PII Detection                       │
│  • Audit Logging                       │
│  • Permission Management               │
│  • Analytics & Insights                │
└─────────────────────────────────────────┘
```

### Integration Pattern
Similar to existing `inject-voice-ui.sh`:
1. Copy enterprise UI assets to clawdbot's control-ui directory
2. Inject script tag into clawdbot's `index.html`
3. Enterprise menu button appears in clawdbot's UI
4. Clicking it opens Enterprise features while keeping clawdbot as base

---

## What Exists

### Clawdbot Installation
- **Location:** `/opt/homebrew/lib/node_modules/clawdbot`
- **Binary:** `/opt/homebrew/bin/clawdbot`
- **Version:** 2026.1.24-3
- **Status:** Service not running (not installed)

### Control UI Path
- `/opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/`
- This is where clawdbot's web UI files live
- `index.html` is the main entry point

### Injection Precedent
- `scripts/inject-voice-ui.sh` shows the pattern:
  ```bash
  # 1. Copy assets
  cp -r "$PROJECT_ROOT/dist/voice/"* "$CLAWDBOT_PATH/dist/control-ui/voice-ui/"

  # 2. Inject script tag
  sed -i '' 's|</body>|<script ... ></script>\n  </body>|' "$INDEX_HTML"

  # 3. Restart clawdbot
  clawdbot gateway restart
  ```

---

## Required Changes

### 1. Start Real Clawdbot (Port 18789)
```bash
# Install gateway service
clawdbot gateway install

# Start it
clawdbot gateway start

# Check status
clawdbot gateway status

# Access dashboard
open http://localhost:18789
```

### 2. Change Our Server Port (18789 → 19000)
Update `server.ts`:
```typescript
-const port = process.env.PORT || 18789;
+const port = process.env.ENTERPRISE_PORT || 19000;
```

### 3. Create Enterprise Injection Script
New file: `scripts/inject-enterprise-menu.sh`
- Copy enterprise UI components to clawdbot's control-ui
- Inject enterprise menu button into clawdbot's index.html
- Menu opens panel with:
  - PII Detection toggle
  - Audit log viewer
  - Permission management
  - Analytics dashboard

### 4. Create Enterprise UI Components
- `ui/enterprise-menu.js` - Menu button + panel
- `ui/enterprise-panel.html` - Pro features UI
- `ui/enterprise-styles.css` - Styling
- These get injected into clawdbot's UI

### 5. Enterprise API Endpoints (Port 19000)
Keep existing server.ts but as backend API:
- `/api/audit` - Audit log access
- `/api/permissions` - Permission management
- `/api/pii` - PII detection
- `/api/analytics` - Usage analytics

---

## Implementation Plan

### Phase 1: Split the Services
1. ✅ Understand current architecture (done)
2. Change server.ts port to 19000
3. Remove chat UI from server.ts (keep API only)
4. Start clawdbot gateway on 18789
5. Verify both servers run simultaneously

### Phase 2: Create Injection System
1. Build enterprise UI components
2. Create `inject-enterprise-menu.sh` script
3. Inject into clawdbot's control-ui
4. Test enterprise features from clawdbot UI

### Phase 3: Connect the Pieces
1. Enterprise UI calls port 19000 API
2. Audit logging works across both systems
3. PII detection integrates with clawdbot's chat
4. Analytics dashboard shows real data

---

## Benefits of Correct Architecture

### User Experience
- Users see familiar **OpenClaw (clawdbot)** interface
- Pro features appear as **enhancements**, not replacements
- Seamless integration, not a separate app

### Technical
- Separation of concerns (UI vs Backend)
- Clawdbot updates don't break our features
- Enterprise features can be toggled on/off
- Works with existing clawdbot ecosystem

### Maintenance
- Clawdbot handles agent orchestration (its strength)
- We focus on enterprise features (our value-add)
- Clear boundaries between open-source and pro features

---

## Next Steps

**Immediate Actions:**
1. Confirm with user this is the desired architecture
2. Start clawdbot gateway on port 18789
3. Change our server to port 19000
4. Create injection script
5. Build enterprise UI components

**Questions for User:**
- Should I implement the correct architecture now?
- Do you want to keep any of the current custom UI, or fully switch to injected model?
- Are there specific enterprise features to prioritize in the injection?

---

## References

- Memory file: `/Users/jialiang.wu/.claude/projects/-Users-jialiang-wu-Documents-Projects/memory/MEMORY.md`
- Voice UI injection: `scripts/inject-voice-ui.sh`
- Clawdbot docs: https://docs.clawd.bot/cli/gateway
- User screenshot feedback: Custom UI is wrong, should be OpenClaw + Pro features
