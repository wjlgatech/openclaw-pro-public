# TTS Servers for Voice UI

This directory contains the TTS (Text-to-Speech) servers used by the voice UI.

## Servers

### 1. tts-server.js (Port 8765)
- **Purpose**: Converts text to speech using macOS `say` command
- **Usage**: Fallback TTS when AI doesn't generate audio
- **Voice**: Configurable (default: Samantha, can use Ava/Allison/Tom)

### 2. audio-file-server.js (Port 8766)
- **Purpose**: Serves AI-generated audio files to the browser
- **Usage**: Delivers MP3 files from temporary directories
- **CORS**: Enabled for localhost access

## Starting the Servers

```bash
# Start TTS server
node servers/tts-server.js > /tmp/tts-server.log 2>&1 &

# Start audio file server
node servers/audio-file-server.js > /tmp/audio-server.log 2>&1 &
```

## Auto-start on Boot

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# Auto-start TTS servers for Enterprise OpenClaw
if ! pgrep -f "tts-server.js" > /dev/null; then
    node ~/path/to/enterprise-openclaw/servers/tts-server.js > /tmp/tts-server.log 2>&1 &
fi

if ! pgrep -f "audio-file-server.js" > /dev/null; then
    node ~/path/to/enterprise-openclaw/servers/audio-file-server.js > /tmp/audio-server.log 2>&1 &
fi
```

## Voice Quality

For better voice quality, download premium macOS voices:
1. **System Settings** → **Accessibility** → **Spoken Content**
2. Click **System Voice** → **Manage Voices...**
3. Download: **Ava**, **Allison**, or **Tom** (Premium quality)
4. Edit `tts-server.js` line 11: Change `'Samantha'` to `'Ava'`
5. Restart the server

## Ports

- **8765**: TTS Server (macOS say command)
- **8766**: Audio File Server (serves AI-generated MP3s)
