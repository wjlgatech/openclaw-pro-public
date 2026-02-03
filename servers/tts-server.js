#!/usr/bin/env node
/**
 * Simple TTS server using macOS 'say' command
 * Better quality than browser TTS, no dependencies needed!
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const VOICE = 'Samantha'; // Change to Ava, Allison, Tom for premium voices

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/tts') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);

        if (!text) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'No text provided' }));
          return;
        }

        console.log(`🎤 TTS Request: "${text.substring(0, 50)}..."`);

        // Generate unique filename
        const filename = `/tmp/tts-${Date.now()}.aiff`;

        // Use macOS 'say' command to generate audio
        const escapedText = text.replace(/"/g, '\\"');
        const cmd = `say -v "${VOICE}" -o "${filename}" "${escapedText}"`;

        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error('❌ TTS Error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
            return;
          }

          // Read the generated audio file
          fs.readFile(filename, (err, data) => {
            if (err) {
              console.error('❌ File Read Error:', err);
              res.writeHead(500);
              res.end(JSON.stringify({ error: err.message }));
              return;
            }

            // Send audio file
            res.writeHead(200, {
              'Content-Type': 'audio/aiff',
              'Content-Length': data.length
            });
            res.end(data);

            // Cleanup
            fs.unlink(filename, () => {});
            console.log('✅ TTS completed');
          });
        });

      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🎤 TTS Server running on http://127.0.0.1:${PORT}`);
  console.log(`📢 Using voice: ${VOICE}`);
  console.log(`💡 POST to /tts with JSON: { "text": "your text here" }`);
  console.log('');
  console.log('To use premium voices, edit this file and change VOICE to:');
  console.log('  - "Ava" (download from System Settings)');
  console.log('  - "Allison" (download from System Settings)');
  console.log('  - "Tom" (download from System Settings)');
});
