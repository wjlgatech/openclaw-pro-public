# OpenClaw Pro - Desktop Application

Launch OpenClaw Pro with a single click from your desktop!

## Features

- 1-click launch from your Applications folder or Desktop
- Auto-start both OpenClaw Gateway and Enterprise API
- Auto-open browser when ready
- Beautiful app icon
- Cross-platform support (macOS, Linux, Windows)

---

## Quick Install

### macOS

```bash
# Install desktop app
./scripts/install-desktop-launcher.sh
```

**Launch from:**
- Spotlight: Press `Cmd+Space`, type "OpenClaw Pro"
- Launchpad
- Applications folder

### Linux

```bash
# Install desktop launcher
./scripts/install-desktop-launcher.sh
```

**Launch from:**
- Application menu
- Activities/Search

### Windows

```bash
# Install desktop shortcut
./scripts/install-desktop-launcher.sh
```

**Launch from:**
- Desktop shortcut: `OpenClaw Pro.bat`
- Or double-click `OpenClaw-Pro.bat` in project folder

---

## Manual Installation

### macOS

1. Copy the app bundle to Applications:
   ```bash
   cp -R "OpenClaw Pro.app" /Applications/
   ```

2. Launch from Spotlight or Applications folder

**Note:** If macOS blocks the app (unidentified developer):
- Right-click the app → Open → Confirm
- Or: System Settings → Privacy & Security → Allow

### Linux

1. Copy desktop file and update paths:
   ```bash
   # Edit openclaw-pro.desktop and replace /PATH_TO_PROJECT
   sed -i "s|/PATH_TO_PROJECT|$(pwd)|g" openclaw-pro.desktop

   # Copy to applications
   cp openclaw-pro.desktop ~/.local/share/applications/

   # Update database
   update-desktop-database ~/.local/share/applications/
   ```

2. Launch from application menu

### Windows

1. Double-click `OpenClaw-Pro.bat`
2. Or create a shortcut on your Desktop

---

## What Happens When You Launch?

1. **Checks prerequisites:** Node.js, npm
2. **Builds if needed:** Compiles TypeScript code
3. **Checks configuration:** Creates `.env` if missing
4. **Starts servers:**
   - OpenClaw Gateway: `http://localhost:18789`
   - Enterprise API: `http://localhost:19000`
5. **Opens browser:** Automatically opens the UI

---

## Troubleshooting

### App Won't Start

**Check prerequisites:**
```bash
node --version  # Should be >= 20.0.0
npm --version   # Should be >= 10.0.0
```

**Check logs:**
```bash
# macOS/Linux
tail -f logs/app.log

# Windows
type logs\app.log
```

### Port Already in Use

**Find and kill the process:**
```bash
# macOS/Linux
lsof -ti:18789 | xargs kill -9
lsof -ti:19000 | xargs kill -9

# Windows
netstat -ano | findstr :18789
taskkill /PID <PID> /F
```

### macOS: "App is damaged and can't be opened"

**Remove quarantine attribute:**
```bash
xattr -cr "/Applications/OpenClaw Pro.app"
```

### Linux: Icon Not Showing

**Make sure icon path is correct:**
```bash
# Check desktop file
cat ~/.local/share/applications/openclaw-pro.desktop | grep Icon

# Icon should exist at the specified path
```

### Windows: "Node.js not found"

**Install Node.js:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Install (check "Add to PATH")
3. Restart terminal
4. Try again

---

## Uninstallation

### macOS
```bash
rm -rf "/Applications/OpenClaw Pro.app"
```

### Linux
```bash
rm ~/.local/share/applications/openclaw-pro.desktop
update-desktop-database ~/.local/share/applications/
```

### Windows
```bash
# Remove desktop shortcut
del "%USERPROFILE%\Desktop\OpenClaw Pro.bat"
```

---

## Advanced Usage

### Stop the Application

**Find PID:**
```bash
cat /tmp/openclaw-pro.pid
```

**Stop servers:**
```bash
kill $(cat /tmp/openclaw-pro.pid)
```

### Start Without Opening Browser

Edit `scripts/start-app.sh` and comment out the browser launch section:
```bash
# if command -v open &> /dev/null; then
#     open http://localhost:18789
# ...
```

### Change Ports

Edit `.env`:
```bash
GATEWAY_PORT=3000
ENTERPRISE_PORT=3001
```

---

## File Structure

```
openclaw-pro/
├── OpenClaw Pro.app/           # macOS application bundle
│   ├── Contents/
│   │   ├── Info.plist          # App metadata
│   │   ├── MacOS/
│   │   │   └── OpenClawPro     # Launcher script
│   │   └── Resources/
│   │       └── openclaw-pro-icon.icns  # macOS icon
├── openclaw-pro.desktop        # Linux desktop entry
├── OpenClaw-Pro.bat            # Windows launcher
├── scripts/
│   ├── start-app.sh            # Cross-platform startup script
│   └── install-desktop-launcher.sh  # Installer script
└── public/
    └── images/
        └── openclaw-pro-icon.png  # Source icon
```

---

## Icon Specifications

- **Format:** PNG (original), ICNS (macOS), PNG (Linux)
- **Size:** 512x512 pixels
- **Design:** Red/orange gradient claw with "OpenClaw Pro" branding
- **Background:** Transparent or white

---

## Support

For issues or questions:
- Check logs: `logs/app.log`
- GitHub Issues: [openclaw-pro/issues](https://github.com/wjlgatech/openclaw-pro/issues)
- Internal Slack: #openclaw-dev

---

**Version:** 1.0.0
**Last Updated:** 2026-02-05
