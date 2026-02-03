# Voice UI Usage Guide
## Enterprise OpenClaw Real-Time Voice Conversations

**Status:** ✅ Implemented and ready to use!

---

## Quick Start

### 1. Set Up AI Refinery Credentials

```bash
# Add to your ~/.bashrc or ~/.zshrc
export AIR_API_KEY=your-api-key-here
export AIR_BASE_URL=https://api.airefinery.accenture.com
```

### 2. Build Voice UI

```bash
cd /Users/jialiang.wu/Documents/Projects/enterprise-openclaw
./scripts/build-voice-ui.sh
```

### 3. Inject into Clawdbot

```bash
./scripts/inject-voice-ui.sh
```

### 4. Restart and Open

```bash
clawdbot gateway restart
clawdbot dashboard
```

---

## Using Voice Conversations

### Method 1: Mouse/Touch
1. **Look for the floating mic button** (bottom-right corner)
2. **Press and hold** the mic button
3. **Speak** your message
4. **Release** the button when done
5. **Listen** to the AI's voice response

### Method 2: Keyboard Shortcut
1. **Press and hold the `P` key**
2. **Speak** your message
3. **Release the `P` key**
4. **Listen** to the AI's voice response

---

## UI Elements

### Mic Button States

| State | Color | Animation | Meaning |
|-------|-------|-----------|---------|
| **Idle** | Purple gradient | None | Ready to use |
| **Listening** | Red | Pulsing | Recording your voice |
| **Speaking** | Blue | Pulsing | AI is responding |
| **Error** | Red (solid) | Shake | Something went wrong |

### Transcription Panel

When you speak, a panel appears at the top showing:
- **Your speech:** Real-time transcription of what you're saying
- **AI response:** The AI's text response (before audio plays)
- **Waveform:** Visual representation of audio activity

### Settings Panel

Click the gear icon (below the mic button) to configure:
- **Volume:** Adjust AI voice volume (0-100%)
- **Language:** Choose conversation language
- **Voice:** Select AI voice (Jenny, Guy, Aria, etc.)
- **Keyboard shortcut:** Enable/disable P key shortcut

---

## Troubleshooting

### Mic Button Not Appearing

**Problem:** Voice UI not loaded

**Solution:**
```bash
# Re-run injection
./scripts/inject-voice-ui.sh
clawdbot gateway restart
clawdbot dashboard
```

### Microphone Permission Denied

**Problem:** Browser blocked microphone access

**Solution:**
1. Click the 🔒 lock icon in browser address bar
2. Change microphone permission to "Allow"
3. Refresh the page

### No Audio Response

**Problem:** Audio player not working or muted

**Solution:**
1. Click settings gear icon
2. Check volume slider (should be >0%)
3. Check system volume
4. Try refreshing the page

### "AI Refinery unavailable" Error

**Problem:** AI Refinery API credentials not set or invalid

**Solution:**
```bash
# Check credentials
echo $AIR_API_KEY
echo $AIR_BASE_URL

# Re-export if needed
export AIR_API_KEY=your-key
export AIR_BASE_URL=https://api.airefinery.accenture.com

# Restart
clawdbot gateway restart
```

### Transcription Not Showing

**Problem:** WebSocket connection failed

**Solution:**
1. Check clawdbot gateway is running: `clawdbot status`
2. Check browser console for errors (F12)
3. Try reconnecting by releasing and pressing mic button again

---

## Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| **Chrome 90+** | ✅ Fully supported | Recommended |
| **Edge 90+** | ✅ Fully supported | Chromium-based |
| **Firefox 88+** | ✅ Supported | May need manual mic permission |
| **Safari 14+** | ⚠️ Partially | AudioWorklet may not work |
| **Mobile Chrome** | ✅ Supported | Touch to talk |
| **Mobile Safari** | ⚠️ Limited | iOS restrictions |

---

## Advanced Usage

### Changing Voice

```javascript
// In browser console (F12)
voiceOverlay.voiceAgent.config.voice = 'en-US-Guy';
voiceOverlay.voiceAgent.stop();
voiceOverlay.voiceAgent.start();
```

### Adjusting Microphone Settings

```javascript
// In browser console
voiceOverlay.micHandler.dispose();
voiceOverlay.micHandler = new MicrophoneHandler({
  sampleRate: 16000,
  chunkDurationMs: 50,  // Lower = more responsive, higher = more stable
  noiseSuppression: true,
  echoCancellation: true
});
```

### Monitoring Performance

```javascript
// In browser console
voiceOverlay.getState();
// Returns: { state, transcription, responseText, metrics }

voiceOverlay.voiceAgent.getMetrics();
// Returns: { durationMs, transcriptionLatencyMs, audioChunksReceived, ... }
```

---

## Performance Tips

1. **Use wired headphones** to avoid echo/feedback
2. **Speak clearly** and at normal pace
3. **Press button BEFORE speaking** (not during)
4. **Wait for blue pulse** before expecting audio response
5. **Close other tabs** using microphone (Zoom, etc.)

---

## Privacy & Security

- ✅ **Audio not stored:** Voice data is streamed in real-time, not recorded
- ✅ **Encrypted transmission:** All audio sent over secure WebSocket (wss://)
- ✅ **Local processing:** Microphone capture happens entirely in browser
- ✅ **PII detection:** Text transcriptions go through existing PII filters
- ❌ **No background listening:** Mic only active when button pressed

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **P** (hold) | Push-to-talk (start/stop listening) |
| **Esc** | Close transcription panel |
| **?** | Show this help (coming soon) |

---

## Uninstalling Voice UI

To remove voice functionality:

```bash
cd /Users/jialiang.wu/Documents/Projects/enterprise-openclaw

# Option 1: Remove injection
./scripts/remove-voice-ui.sh

# Option 2: Restore from backup
BACKUP_DIR="$HOME/.enterprise-openclaw-backups/latest"
cp "$BACKUP_DIR/index.html" /opt/homebrew/lib/node_modules/clawdbot/dist/control-ui/

# Restart
clawdbot gateway restart
clawdbot dashboard
```

---

## FAQ

### Q: Can I use voice while typing text messages?
**A:** Yes! Voice and text work simultaneously. Your voice transcriptions will appear in the chat.

### Q: Does voice work offline?
**A:** No. Voice requires an active internet connection to AI Refinery's servers for ASR/TTS.

### Q: Can I change the AI's voice personality?
**A:** Voice selection is available in settings. For advanced customization, contact your AI Refinery admin.

### Q: How much does voice cost?
**A:** AI Refinery is internal to Accenture (no per-use cost). Contact your IT admin for capacity limits.

### Q: Can multiple people talk at once?
**A:** No. Voice is currently single-user push-to-talk only. Multi-speaker support is planned.

---

## Known Limitations

1. **No barge-in support (yet):** Can't interrupt AI mid-response
2. **Push-to-talk only:** No "always listening" mode
3. **English optimized:** Other languages supported but may have higher latency
4. **Desktop-first:** Mobile support is experimental
5. **No voice commands:** Must use button/key to trigger ("Hey OpenClaw..." coming soon)

---

## Roadmap

### Planned Features (Future)
- [ ] Barge-in support (interrupt AI mid-sentence)
- [ ] Continuous listening mode ("Hey OpenClaw...")
- [ ] Voice commands for system actions
- [ ] Multi-speaker diarization
- [ ] Custom wake words
- [ ] Voice cloning for personalized TTS
- [ ] Emotion/sentiment detection in voice
- [ ] Background noise filtering
- [ ] Voice activity detection (VAD) for auto-stop

---

## Support

**Issues?** Create a ticket:
```bash
cd /Users/jialiang.wu/Documents/Projects/enterprise-openclaw
# Describe issue in GitHub issue or docs/ISSUES.md
```

**Questions?** Check:
- `/Users/jialiang.wu/Documents/Projects/enterprise-openclaw/docs/VOICE_UI_IMPLEMENTATION_PLAN.md`
- `/Users/jialiang.wu/Documents/Projects/enterprise-openclaw/docs/AI_REFINERY_INTEGRATION.md`

---

**Built with ❤️ for Enterprise OpenClaw**
**Powered by AI Refinery Real-Time Voice** 🎙️🦅
