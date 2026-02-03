# Enterprise OpenClaw - Voice UI

Voice-to-voice conversation interface for Enterprise OpenClaw with automatic TTS playback.

## Features

- 🎙️ **Voice Input**: Browser-based speech recognition
- 🔊 **Voice Output**: Automatic playback of AI responses
- 🎵 **Dual TTS Support**:
  - AI-generated audio files (primary)
  - macOS `say` command (fallback)
- 🎤 **Push-to-talk interface**
- 📝 **Live transcription**
- ✨ **No API keys required** (uses browser Web Speech API)

## Architecture

```
User Voice → Browser STT → Clawdbot AI → Audio Generation
                                            ↓
                                         MEDIA: path
                                            ↓
                                    Audio File Server
                                            ↓
                                    Browser Playback
```

## Quick Start

### 1. Install Dependencies

The voice UI is already integrated into clawdbot. No additional installation needed.

### 2. Start Servers

```bash
# Start TTS servers
node servers/tts-server.js > /tmp/tts-server.log 2>&1 &
node servers/audio-file-server.js > /tmp/audio-server.log 2>&1 &

# Start clawdbot gateway
cd ~/Documents/Projects/enterprise-openclaw
export $(cat .env | xargs)
clawdbot gateway --port 18789
```

### 3. Open UI

Navigate to: **http://localhost:18789**

### 4. Use Voice

1. Click the **🎤 mic button** (grey when inactive, blue when listening)
2. Speak your message
3. Click again to stop and send
4. AI response plays automatically

## Components

### Voice UI (`ui/simple-voice-ui.js`)
- Handles speech recognition
- Detects AI audio files (MEDIA: paths)
- Automatically plays responses
- Fallback to browser TTS if needed

### TTS Server (`servers/tts-server.js`)
- Port: **8765**
- Uses macOS `say` command
- Configurable voices (Samantha/Ava/Allison/Tom)

### Audio File Server (`servers/audio-file-server.js`)
- Port: **8766**
- Serves AI-generated MP3 files
- CORS-enabled for localhost

## Configuration

### Upgrade Voice Quality

1. Download premium macOS voices:
   - **System Settings** → **Accessibility** → **Spoken Content**
   - Click **System Voice** → **Manage Voices**
   - Download: **Ava** (Premium), **Allison** (Premium), or **Tom** (Premium)

2. Edit `servers/tts-server.js`:
   ```javascript
   const VOICE = 'Ava'; // Change from 'Samantha'
   ```

3. Restart server:
   ```bash
   pkill -f tts-server.js
   node servers/tts-server.js > /tmp/tts-server.log 2>&1 &
   ```

### Environment Variables

In `.env`:
```bash
# AI Refinery (for advanced TTS)
AIR_API_KEY=your-key-here
AIR_BASE_URL=https://api.airefinery.accenture.com
```

## Troubleshooting

### Mic button not appearing
- Hard refresh: `Cmd + Shift + R`
- Check console (F12) for JavaScript errors

### No audio playback
- Ensure audio file server is running: `ps aux | grep audio-file-server`
- Check browser console for fetch errors
- Verify file exists in `/var/folders/.../tts-*/`

### "Stop Queue" issue
- Already fixed! Voice UI properly manages speech synthesis queue

### Browser TTS sounds robotic
- Install premium voices (see Configuration above)
- Or rely on AI-generated audio (better quality)

## Debug Mode

Open browser console (F12) to see detailed logs:
```
🎤 SPEAK FUNCTION CALLED
📝 Full text: ...
🎵 Found AI-generated audio file: /var/.../voice-XXX.mp3
📥 Fetching audio from: http://127.0.0.1:8766/audio?path=...
✅ Got audio file from server
✅✅✅ AI AUDIO PLAYING! ✅✅✅
```

Download logs:
```javascript
window.downloadVoiceLogs()
```

## Files

```
enterprise-openclaw/
├── ui/
│   ├── simple-voice-ui.js       # Main voice UI (deployed to clawdbot)
│   ├── voice-overlay.css        # AI Refinery overlay styles
│   └── voice-overlay.html       # AI Refinery overlay template
├── servers/
│   ├── tts-server.js            # macOS say TTS server
│   ├── audio-file-server.js     # AI audio file server
│   └── README.md                # Server documentation
└── docs/
    ├── VOICE_UI_USAGE.md        # Detailed usage guide
    └── LESSONS_LEARNED_*.md     # Development notes
```

## Development

The voice UI is injected into clawdbot's control UI:
- **Source**: `ui/simple-voice-ui.js`
- **Deployed to**: `/opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/`

After changes:
```bash
cp ui/simple-voice-ui.js /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/
```

## Production Deployment

For production, consider:
1. Using AI Refinery TTS (enterprise-grade quality)
2. Running servers as systemd services
3. Setting up proper HTTPS
4. Implementing audio caching

## License

MIT License - See main repository LICENSE file
