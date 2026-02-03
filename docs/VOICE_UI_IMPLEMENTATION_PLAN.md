# Voice UI Implementation Plan
## Enterprise OpenClaw + AI Refinery Real-Time Voice

**Date:** 2026-02-03
**Goal:** Add real-time voice conversation capability to Enterprise OpenClaw Control UI

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Enterprise OpenClaw Control UI            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chat Interface (Existing)                           │  │
│  │  - Text messages                                     │  │
│  │  - Message history                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Voice Overlay (NEW)                                 │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ Mic Button │→ │ Transcription│→ │   Audio    │  │  │
│  │  │ (PTT)      │  │   Display    │  │  Playback  │  │  │
│  │  └────────────┘  └──────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓  ↑
                    WebSocket (wss://)
                          ↓  ↑
┌─────────────────────────────────────────────────────────────┐
│              AI Refinery Realtime Service                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │   ASR    │ → │   LLM    │ → │   TTS    │             │
│  │ (Speech  │    │ (Claude) │    │ (Azure)  │             │
│  │ to Text) │    │          │    │          │             │
│  └──────────┘    └──────────┘    └──────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Approach: **Option A - Custom Voice Overlay**

### Why This Approach?
✅ **Non-invasive**: Doesn't modify clawdbot's compiled code
✅ **Maintainable**: Survives clawdbot npm updates
✅ **Seamless UX**: Integrated into existing UI
✅ **Fast deployment**: Reuses archived voice agent code
✅ **No rebuild needed**: Works with compiled clawdbot

### How It Works:
1. Create a custom voice UI layer that injects into clawdbot
2. Add floating mic button overlay
3. Use Web Audio API for microphone capture
4. Connect to AI Refinery realtime WebSocket API
5. Display transcriptions in clawdbot's chat
6. Play audio responses using Web Audio API

---

## File Structure

```
enterprise-openclaw/
├── src/
│   ├── voice/
│   │   ├── voice-agent.ts              # Voice agent (from archive)
│   │   ├── airefinery-realtime.ts      # AI Refinery provider
│   │   ├── microphone-handler.ts       # Mic capture
│   │   ├── audio-player.ts             # Audio playback
│   │   └── voice-ui-injector.ts        # UI injection logic
│   └── types/
│       └── voice-types.ts               # TypeScript interfaces
│
├── ui/
│   ├── voice-overlay.html              # Voice UI HTML
│   ├── voice-overlay.css               # Voice UI styles
│   └── voice-overlay.js                # Voice UI logic (compiled from TS)
│
└── scripts/
    └── inject-voice-ui.sh              # Auto-injection script
```

---

## Implementation Steps

### Phase 1: Restore Voice Agent Code (30 min)
- [x] Move `voice-agent.ts` from archive to `src/voice/`
- [x] Move `airefinery-provider.ts` → `src/voice/airefinery-realtime.ts`
- [x] Update imports for current project structure
- [x] Add TypeScript types

### Phase 2: Build Microphone Handler (45 min)
- [ ] Implement `microphone-handler.ts`:
  - Request `getUserMedia` permission
  - Capture audio using Web Audio API
  - Convert to 16kHz mono PCM (AI Refinery format)
  - Implement push-to-talk button logic
  - Buffer audio chunks (100ms intervals)

**Key Requirements:**
- Audio format: 16kHz, mono, 16-bit PCM
- Real-time capture with <100ms latency
- Error handling for mic permission denied

### Phase 3: Build Audio Player (30 min)
- [ ] Implement `audio-player.ts`:
  - Decode base64 audio from AI Refinery
  - Queue audio chunks for smooth playback
  - Use Web Audio API AudioContext
  - Visual feedback (waveform/indicator)
  - Stop/cancel controls

### Phase 4: Create Voice UI Overlay (1 hour)
- [ ] Design floating mic button:
  - Position: Bottom-right corner (non-intrusive)
  - States: Idle (gray), Listening (red pulse), Speaking (blue pulse)
  - Tooltip: "Push to Talk (P key)"
- [ ] Transcription display:
  - Overlay at top of chat
  - Real-time user speech (gray)
  - AI response text (before audio)
- [ ] Waveform visualization
- [ ] Error messages (mic denied, connection failed)

**Design Specs:**
```css
.voice-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 9999;
}

.voice-button.listening {
  animation: pulse 1.5s infinite;
  background: #ff4444;
}

.voice-button.speaking {
  animation: pulse 1.5s infinite;
  background: #4444ff;
}
```

### Phase 5: Inject into Clawdbot UI (1 hour)
- [ ] Create injection script:
  - Detect clawdbot page load
  - Inject voice overlay HTML/CSS
  - Initialize voice agent
  - Connect to clawdbot's WebSocket for auth token
- [ ] Keyboard shortcut: `P` key for push-to-talk
- [ ] Integrate transcriptions into chat messages

**Injection Method:**
```javascript
// voice-ui-injector.ts
function injectVoiceUI() {
  // Wait for clawdbot to load
  if (!document.querySelector('clawdbot-app')) {
    setTimeout(injectVoiceUI, 500);
    return;
  }

  // Create voice overlay
  const overlay = document.createElement('div');
  overlay.id = 'voice-overlay';
  overlay.innerHTML = voiceOverlayHTML;
  document.body.appendChild(overlay);

  // Initialize voice agent
  const voiceAgent = new VoiceAgent({
    name: 'enterprise-openclaw-voice',
    voice: 'en-US-Jenny',
    language: 'en-US',
    inputMode: 'push-to-talk',
  });

  // Connect event handlers
  voiceAgent.on('transcription', (text) => {
    displayTranscription(text, 'user');
  });

  voiceAgent.on('response.text', (text) => {
    displayTranscription(text, 'assistant');
    addToChatHistory(text);
  });

  voiceAgent.on('response.audio', (audio) => {
    playAudio(audio);
  });
}
```

### Phase 6: Connect to AI Refinery (30 min)
- [ ] Configure AI Refinery credentials:
  ```bash
  export AIR_API_KEY=your-api-key
  export AIR_BASE_URL=https://api.airefinery.accenture.com
  ```
- [ ] Test WebSocket connection
- [ ] Handle auth token from clawdbot config
- [ ] Test audio round-trip

### Phase 7: Testing (1 hour)
- [ ] Test microphone capture (various browsers)
- [ ] Test push-to-talk button
- [ ] Test keyboard shortcut (P key)
- [ ] Test transcription display
- [ ] Test audio playback
- [ ] Test error scenarios:
  - Mic permission denied
  - Network disconnect
  - AI Refinery API unavailable
- [ ] Test on different screen sizes
- [ ] Test with existing clawdbot features (chat, tasks, etc.)

---

## Technical Specifications

### Audio Format
```
Input (Microphone):
- Sample Rate: 16kHz
- Channels: Mono
- Bit Depth: 16-bit
- Format: PCM
- Encoding: Base64 (for transmission)

Output (Speaker):
- Format: Received as base64 from AI Refinery
- Decoding: Base64 → ArrayBuffer
- Playback: Web Audio API AudioContext
```

### WebSocket Protocol (AI Refinery)

**Client → Server:**
```json
{
  "type": "session.update",
  "session": {
    "agent_id": "enterprise-openclaw-voice",
    "voice": "en-US-Jenny",
    "language": "en-US",
    "input_mode": "push-to-talk"
  }
}
```

```json
{
  "type": "input_audio.append",
  "audio": "base64_encoded_audio_chunk"
}
```

**Server → Client:**
```json
{
  "type": "transcription.delta",
  "delta": "Hello, how can I"
}
```

```json
{
  "type": "response.text.delta",
  "delta": "I can help you with"
}
```

```json
{
  "type": "response.audio.delta",
  "audio": "base64_encoded_audio_chunk"
}
```

```json
{
  "type": "response.done"
}
```

### API Endpoints

**AI Refinery:**
- WebSocket: `wss://api.airefinery.accenture.com/distiller/realtime`
- Health Check: `https://api.airefinery.accenture.com/health`
- Auth: Bearer token in headers

**Clawdbot Gateway:**
- WebSocket: `ws://127.0.0.1:18789` (reuse existing connection)
- Auth: Token from clawdbot config

---

## User Experience

### Happy Path Flow:
1. User opens Enterprise OpenClaw Control UI
2. Sees floating mic button (bottom-right)
3. Clicks mic button (or presses `P` key)
4. Button turns red with pulse animation
5. User speaks: "What's the weather today?"
6. Transcription appears at top: "What's the weather today?"
7. Button turns blue (AI is responding)
8. AI response text appears: "I don't have access to real-time weather..."
9. Audio plays with AI's voice
10. Button returns to idle state (gray)
11. Transcription added to chat history

### Error Handling:
- **Mic permission denied**: Show notification with instructions
- **AI Refinery unavailable**: Fallback to text-only, show error
- **Network disconnect**: Show reconnecting indicator
- **Audio playback failure**: Log error, show text response only

---

## Security Considerations

1. **Microphone Permission**: Request only when user clicks mic button
2. **API Key Storage**: Use environment variables, never expose in client code
3. **Audio Data**: Transmitted over secure WebSocket (wss://)
4. **PII in Voice**: Audio transcriptions go through existing PII detection
5. **Rate Limiting**: Implement client-side throttling to prevent abuse

---

## Performance Targets

- **Audio Capture Latency**: <100ms
- **Transcription Latency**: <500ms (first words)
- **Response Latency**: <2s (AI Refinery target)
- **Audio Playback Latency**: <100ms
- **End-to-End**: <3s from user stops speaking to audio starts playing

---

## Dependencies

### Existing (Already in Project):
- `@anthropic-ai/sdk` - For LLM (via AI Refinery)
- `pino` - Logging
- `zod` - Validation

### New Dependencies:
```json
{
  "dependencies": {
    "ws": "^8.16.0",              // WebSocket client
    "base64-js": "^1.5.1"         // Base64 encoding/decoding
  },
  "devDependencies": {
    "@types/ws": "^8.5.10"        // TypeScript types
  }
}
```

### Browser APIs (No install needed):
- Web Audio API (microphone + playback)
- MediaStream API (getUserMedia)
- WebSocket API (realtime communication)

---

## Deployment

### Installation Steps:
```bash
# 1. Restore voice agent code
npm run build:voice

# 2. Configure AI Refinery credentials
export AIR_API_KEY=your-api-key
export AIR_BASE_URL=https://api.airefinery.accenture.com

# 3. Inject voice UI into clawdbot
./scripts/inject-voice-ui.sh

# 4. Restart clawdbot gateway
clawdbot gateway restart

# 5. Open Control UI
clawdbot dashboard
```

### Post-Update Maintenance:
```bash
# After `npm update -g clawdbot`, re-inject voice UI:
./scripts/inject-voice-ui.sh
clawdbot gateway restart
clawdbot dashboard
```

---

## Testing Checklist

### Unit Tests:
- [ ] MicrophoneHandler.capture() captures audio
- [ ] MicrophoneHandler.convert() converts to 16kHz mono PCM
- [ ] AudioPlayer.decode() decodes base64 audio
- [ ] AudioPlayer.play() plays audio correctly
- [ ] VoiceAgent events fire correctly

### Integration Tests:
- [ ] VoiceAgent connects to AI Refinery
- [ ] Audio round-trip (mic → AI → speaker) works
- [ ] Transcriptions display in UI
- [ ] Chat history updated with voice messages

### E2E Tests:
- [ ] Full conversation: user speaks → AI responds with voice
- [ ] Push-to-talk button works
- [ ] Keyboard shortcut (P) works
- [ ] Error scenarios handled gracefully
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile responsive (if applicable)

---

## Success Metrics

### Technical Metrics:
- ✅ Audio capture working (<100ms latency)
- ✅ AI Refinery connection stable (>99% uptime)
- ✅ Transcription accuracy (>95%)
- ✅ End-to-end latency (<3s)
- ✅ Zero breaking changes to existing clawdbot features

### User Experience Metrics:
- ✅ Mic button easy to find and use
- ✅ Visual feedback clear (listening/speaking states)
- ✅ Transcriptions readable and accurate
- ✅ Audio playback smooth (no stuttering)
- ✅ Error messages helpful

---

## Future Enhancements

### Phase 2 Features (Future):
- [ ] Continuous listening mode (always-on mic)
- [ ] Barge-in support (interrupt AI mid-response)
- [ ] Voice commands ("Hey OpenClaw, ...")
- [ ] Multi-language support (auto-detect language)
- [ ] Voice cloning (custom TTS voices)
- [ ] Noise cancellation (background noise filtering)
- [ ] Speaker diarization (multi-speaker conversations)
- [ ] Voice analytics (sentiment, emotion detection)

---

## Timeline

**Total Implementation Time: 5-6 hours**

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Restore voice agent code | 30 min | ⏳ Pending |
| 2 | Build microphone handler | 45 min | ⏳ Pending |
| 3 | Build audio player | 30 min | ⏳ Pending |
| 4 | Create voice UI overlay | 1 hour | ⏳ Pending |
| 5 | Inject into clawdbot | 1 hour | ⏳ Pending |
| 6 | Connect to AI Refinery | 30 min | ⏳ Pending |
| 7 | Testing & polish | 1 hour | ⏳ Pending |

**Target Completion:** Same day (today)

---

## Rollback Plan

If voice UI causes issues:
```bash
# 1. Remove voice overlay injection
./scripts/remove-voice-ui.sh

# 2. Restart clawdbot
clawdbot gateway restart

# 3. Control UI returns to text-only mode
clawdbot dashboard
```

---

## Conclusion

This implementation adds enterprise-grade real-time voice capabilities to Enterprise OpenClaw without modifying clawdbot's core code. The overlay approach ensures maintainability and allows clawdbot to update independently.

**Next Step:** Begin Phase 1 - Restore voice agent code from archive

---

**Built on Enterprise OpenClaw. Powered by AI Refinery. Voice-enabled TODAY.** 🎙️🦅
