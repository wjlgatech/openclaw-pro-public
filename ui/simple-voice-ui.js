/**
 * Simple Voice UI for Enterprise OpenClaw
 * Browser's built-in Web Speech API (No API Key!)
 */

(function() {
  'use strict';

  console.log('🎙️ Loading Simple Voice UI...');

  class SimpleVoiceUI {
    constructor() {
      this.recognition = null;
      this.synthesis = window.speechSynthesis;
      this.isListening = false;
      this.lastInputWasVoice = false;
      this.micButton = null;
      this.textInput = null;
      this.initAttempts = 0;
      this.maxAttempts = 40; // Try for 20 seconds (longer for chat page)
      this.debugLog = []; // Store logs for debugging
      this.useTTSServer = true; // Use local TTS server instead of browser TTS
      this.ttsServerUrl = 'http://127.0.0.1:8765/tts';
      this.currentAudio = null; // Track current playing audio
    }

    log(...args) {
      const message = args.join(' ');
      console.log(...args);
      this.debugLog.push(`[${new Date().toISOString()}] ${message}`);
      // Keep only last 100 logs
      if (this.debugLog.length > 100) {
        this.debugLog.shift();
      }
    }

    getDebugLogs() {
      return this.debugLog.join('\n');
    }

    saveDebugLogs() {
      const blob = new Blob([this.getDebugLogs()], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'voice-ui-debug.log';
      a.click();
      URL.revokeObjectURL(url);
      this.log('📥 Debug logs saved to voice-ui-debug.log');
    }

    init() {
      console.log('🎙️ Initializing Simple Voice UI...');

      // Check browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('⚠️ Browser does not support Speech Recognition');
        return;
      }

      // Pre-load voices for better TTS
      if (this.synthesis) {
        this.synthesis.getVoices(); // Trigger voice loading
        // Voice loading is async, set up listener
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = () => {
            const voices = this.synthesis.getVoices();
            console.log('✅ Loaded', voices.length, 'voices');
          };
        }
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Keep listening until user stops
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.setupRecognitionHandlers();
      this.findAndCreateButton();
    }

    findAndCreateButton() {
      // Try to find text input
      this.textInput = this.findTextInput();

      if (this.textInput) {
        console.log('✅ Found text input:', this.textInput);
        this.createMicButton();
        this.setupSendInterceptor();
      } else {
        this.initAttempts++;
        if (this.initAttempts < this.maxAttempts) {
          console.log(`⏳ Text input not found yet, retrying... (${this.initAttempts}/${this.maxAttempts})`);
          setTimeout(() => this.findAndCreateButton(), 500);
        } else {
          console.error('❌ Could not find text input after', this.maxAttempts, 'attempts');
          alert('Could not find text input box. Voice feature unavailable.');
        }
      }
    }

    findTextInput() {
      // Try multiple selectors to find the text input
      const selectors = [
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="message"]',
        'input[placeholder*="Message"]',
        'input[placeholder*="message"]',
        'textarea',
        'input[type="text"]',
        '[contenteditable="true"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log('✅ Found input with selector:', selector);
          return element;
        }
      }

      console.log('❌ No text input found with standard selectors');
      return null;
    }

    setupRecognitionHandlers() {
      this.recognition.onstart = () => {
        console.log('🎤 Started listening');
        this.isListening = true;
        this.updateButtonState(true);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.textInput) {
          // Append new final text to existing text
          if (finalTranscript) {
            const currentText = this.textInput.value;
            this.textInput.value = currentText + finalTranscript;
            console.log('📝 Appended:', finalTranscript.trim());
            this.lastInputWasVoice = true;
            this.textInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      };

      this.recognition.onend = () => {
        console.log('🎤 Stopped listening');
        this.isListening = false;
        this.updateButtonState(false);

        // Auto-send when user stops recording (2nd mic click)
        if (this.textInput && this.textInput.value.trim()) {
          // Add [voice] prefix to indicate this is a voice message
          const currentText = this.textInput.value.trim();
          if (!currentText.includes('[voice]')) {
            this.textInput.value = '[voice] ' + currentText;
            this.textInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          console.log('📤 Auto-sending voice message with [voice] instruction...');
          setTimeout(() => this.sendMessage(), 500);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        this.isListening = false;
        this.updateButtonState(false);

        if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please enable it in browser settings.');
        }
      };
    }

    createMicButton() {
      if (document.getElementById('voice-mic-btn')) {
        console.log('⚠️ Mic button already exists');
        this.micButton = document.getElementById('voice-mic-btn');
        return;
      }

      console.log('🎨 Creating mic button...');

      // Create button
      this.micButton = document.createElement('button');
      this.micButton.id = 'voice-mic-btn';
      this.micButton.type = 'button';
      this.micButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;

      // Style button - GREY when inactive
      Object.assign(this.micButton.style, {
        position: 'absolute',
        right: '10px',
        bottom: '10px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#888888',  // Grey when inactive
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        opacity: '0.8',
        transition: 'all 0.2s',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      });

      // Add click handler
      this.micButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleListening();
      });

      // Position relative to input
      const container = this.textInput.parentElement;
      if (container) {
        const containerStyle = window.getComputedStyle(container);
        if (containerStyle.position === 'static') {
          container.style.position = 'relative';
        }
        container.appendChild(this.micButton);

        // Add padding to input so text doesn't overlap button
        this.textInput.style.paddingRight = '45px';

        console.log('✅ Mic button created and added to DOM');
      } else {
        console.error('❌ Could not find container for mic button');
      }
    }

    updateButtonState(isListening) {
      if (!this.micButton) return;

      if (isListening) {
        // BLUE when listening/active
        this.micButton.style.background = '#4A90E2';
        this.micButton.style.opacity = '1';
        this.micButton.style.transform = 'scale(1.05)';
        this.micButton.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.3)';
      } else {
        // GREY when inactive
        this.micButton.style.background = '#888888';
        this.micButton.style.opacity = '0.8';
        this.micButton.style.transform = 'scale(1)';
        this.micButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
      }
    }

    toggleListening() {
      if (this.isListening) {
        this.recognition.stop();
      } else {
        try {
          if (this.textInput) {
            this.textInput.value = '';
            this.textInput.focus();
          }
          this.lastInputWasVoice = true;
          this.recognition.start();
        } catch (error) {
          console.error('Failed to start recognition:', error);
        }
      }
    }

    sendMessage() {
      // Check if message has [voice] prefix
      const messageText = this.textInput.value;
      const isVoiceMessage = messageText.includes('[voice');

      // Find and click send button
      const sendButton = document.querySelector('button[type="submit"]');
      if (sendButton) {
        console.log('📤 Clicking send button');
        sendButton.click();

        // Only speak response if this was a voice message
        if (isVoiceMessage) {
          console.log('🔊 Voice message detected - will speak response');
          setTimeout(() => this.waitForResponseAndSpeak(), 500);
        } else {
          console.log('📝 Text message - no TTS');
        }
      } else {
        // Try pressing Enter
        console.log('📤 Trying Enter key');
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true
        });
        this.textInput.dispatchEvent(enterEvent);

        if (isVoiceMessage) {
          setTimeout(() => this.waitForResponseAndSpeak(), 500);
        }
      }
    }

    setupSendInterceptor() {
      // Intercept Send button to check for [voice] label
      const sendButton = document.querySelector('button[type="submit"]');
      if (sendButton) {
        sendButton.addEventListener('click', () => {
          // Check if message has [voice] prefix
          const messageText = this.textInput ? this.textInput.value : '';
          const isVoiceMessage = messageText.includes('[voice');

          if (isVoiceMessage) {
            console.log('🔊 Manual send with [voice] label - will speak response');
            setTimeout(() => this.waitForResponseAndSpeak(), 500);
          } else {
            console.log('📝 Manual text send - no TTS');
          }
        });
        console.log('✅ Send button intercepted');
      }
    }

    waitForResponseAndSpeak() {
      console.log('👂 Waiting for AI response to speak...');
      console.log('🔍 Starting TTS observer...');

      let attempts = 0;
      const maxAttempts = 60; // Try for 30 seconds (500ms intervals)

      const checkForResponse = () => {
        attempts++;
        console.log(`🔍 Checking for AI response (attempt ${attempts}/${maxAttempts})...`);

        const aiMessage = this.getLatestAIMessage();
        if (aiMessage) {
          console.log('✅ Found AI message:', aiMessage.substring(0, 100) + '...');
          console.log('🔊 Starting TTS...');
          this.speak(aiMessage);
          return; // Stop checking
        }

        // Continue checking
        if (attempts < maxAttempts) {
          setTimeout(checkForResponse, 500);
        } else {
          console.error('❌ TTS timeout - could not find AI response after 30 seconds');
        }
      };

      // Start checking after a short delay
      setTimeout(checkForResponse, 1000);
    }

    getMessageCount() {
      // Count all message elements
      const messages = document.querySelectorAll('[class*="message"], .message, [role="article"]');
      return messages.length;
    }

    getLatestAIMessage() {
      this.log('════════════════════════════════════════');
      this.log('🔍 SEARCHING FOR AI MESSAGE...');

      // Strategy 1: Look for messages with "assistant" or "ai" in class
      const aiMessages = document.querySelectorAll('[class*="assistant"], [class*="ai-message"], [class*="bot"], [class*="response"]');
      this.log('Strategy 1: Found', aiMessages.length, 'AI-class messages');
      if (aiMessages.length > 0) {
        const latest = aiMessages[aiMessages.length - 1];
        this.log('Latest AI message element:', latest.className, latest.tagName);
        const text = this.extractCleanText(latest);
        if (text) {
          this.log('✅ Found AI message via Strategy 1');
          this.log('📝 Text length:', text.length);
          this.log('📝 Text preview:', text.substring(0, 200));
          return text;
        }
      }

      // Strategy 2: Get all messages and assume last one is AI (skip user message)
      const allMessages = document.querySelectorAll('[class*="message"], .message, [role="article"]');
      this.log('Strategy 2: Found', allMessages.length, 'total messages');
      if (allMessages.length > 1) {
        // Get last message that's NOT from user
        for (let i = allMessages.length - 1; i >= 0; i--) {
          const msg = allMessages[i];
          const classList = msg.className || '';
          // Skip if it looks like a user message
          if (classList.includes('user') || classList.includes('human')) {
            continue;
          }
          this.log('Checking message:', i, classList, msg.tagName);
          const text = this.extractCleanText(msg);
          if (text && text.length > 30) { // Require more than 30 chars
            this.log('✅ Found AI message via Strategy 2');
            this.log('📝 Text length:', text.length);
            this.log('📝 Text preview:', text.substring(0, 200));
            return text;
          }
        }
      }

      // Strategy 3: Look for clawdbot-app shadow DOM
      const clawdbotApp = document.querySelector('clawdbot-app');
      if (clawdbotApp && clawdbotApp.shadowRoot) {
        this.log('Strategy 3: Found shadow DOM in clawdbot-app');
        const shadowMessages = clawdbotApp.shadowRoot.querySelectorAll('[class*="message"], .message, [role="article"]');
        this.log('Found', shadowMessages.length, 'messages in shadow DOM');
        if (shadowMessages.length > 0) {
          const latest = shadowMessages[shadowMessages.length - 1];
          const text = this.extractCleanText(latest);
          if (text && text.length > 30) {
            this.log('✅ Found AI message via Strategy 3 (shadow DOM)');
            this.log('📝 Text length:', text.length);
            this.log('📝 Text preview:', text.substring(0, 200));
            return text;
          }
        }
      }

      // Strategy 4: Just get all text and find last substantial chunk
      const allText = document.body.textContent || document.body.innerText;
      this.log('Strategy 4: Body text length:', allText.length);
      const lines = allText.split('\n').filter(l => l.trim().length > 30);
      this.log('Found', lines.length, 'substantial lines');
      if (lines.length > 0) {
        // Get last few lines and combine
        const lastLines = lines.slice(-3).join(' ').trim();
        if (lastLines.length > 30) {
          this.log('✅ Found text via Strategy 4 (last lines)');
          this.log('📝 Text length:', lastLines.length);
          this.log('📝 Text preview:', lastLines.substring(0, 200));
          return lastLines;
        }
      }

      this.log('❌❌❌ NO AI MESSAGE FOUND! ❌❌❌');
      this.log('════════════════════════════════════════');
      return null;
    }

    extractCleanText(element) {
      if (!element) return null;

      let text = element.textContent || element.innerText || '';

      // Clean up the text
      text = text.trim();

      // Filter out metadata, JSON, code blocks
      if (text.startsWith('{') || text.startsWith('[')) {
        return null; // Skip JSON
      }

      if (text.includes('```') || text.includes('DOCTYPE')) {
        return null; // Skip code blocks
      }

      if (text.length < 30 || text.length > 5000) {
        return null; // Too short or too long
      }

      // CRITICAL: Remove common UI elements and buttons
      const skipPatterns = [
        /^(send|submit|cancel|copy|edit|delete|stop|queue|clear|reset)$/i,
        /^(stop\s*queue)$/i,
        /^(loading|processing|waiting)\.\.\.$/i,
        /^\s*(stop|queue)\s*$/i
      ];

      const lowerText = text.toLowerCase().trim();
      if (skipPatterns.some(pattern => pattern.test(lowerText))) {
        this.log('❌ Skipping UI element:', text.substring(0, 50));
        return null;
      }

      // Skip if it's mostly whitespace/newlines
      const meaningfulChars = text.replace(/\s/g, '').length;
      if (meaningfulChars < 20) {
        this.log('❌ Skipping whitespace-heavy text');
        return null;
      }

      // Skip if element has button/control classes
      if (element.tagName === 'BUTTON' ||
          element.className.includes('button') ||
          element.className.includes('control') ||
          element.className.includes('btn')) {
        this.log('❌ Skipping button element');
        return null;
      }

      return text;
    }

    speak(text) {
      this.log('════════════════════════════════════════');
      this.log('🎤 SPEAK FUNCTION CALLED');
      this.log('📝 Full text length:', text.length);
      this.log('📝 Full text:', text.substring(0, 200));
      this.log('════════════════════════════════════════');

      // Check if AI generated audio file
      if (text.includes('MEDIA:')) {
        const mediaMatch = text.match(/MEDIA:([^\s]+)/);
        if (mediaMatch) {
          const audioPath = mediaMatch[1];
          this.log('🎵 Found AI-generated audio file:', audioPath);
          this.playAIAudioFile(audioPath);
          return; // Don't do TTS, play the file instead
        }
      }

      // Clean the text
      let cleanText = text;

      // Remove any remaining media references
      if (text.includes('.mp3') || text.includes('.wav')) {
        this.log('🎵 Removing audio file references from text...');
        cleanText = text.replace(/MEDIA:[^\s]+/g, '').trim();
      }

      // Remove markdown formatting
      cleanText = cleanText.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
      cleanText = cleanText.replace(/#{1,6}\s/g, ''); // Remove headers
      cleanText = cleanText.replace(/\*\*/g, ''); // Remove bold
      cleanText = cleanText.replace(/\*/g, ''); // Remove italic
      cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links
      cleanText = cleanText.trim();

      this.log('📝 Cleaned text length:', cleanText.length);
      this.log('📝 Cleaned text preview:', cleanText.substring(0, 300));

      if (!cleanText || cleanText.length < 5) {
        this.log('❌ Text too short to speak:', cleanText);
        return;
      }

      // Truncate if too long (TTS has limits)
      if (cleanText.length > 1000) {
        this.log('⚠️ Text too long, truncating to 1000 chars');
        cleanText = cleanText.substring(0, 1000) + '...';
      }

      // Use TTS server if enabled, otherwise fall back to browser TTS
      if (this.useTTSServer) {
        this.speakWithServer(cleanText);
      } else {
        this.speakWithBrowser(cleanText);
      }
    }

    speakWithServer(text) {
      this.log('🎤 Using local TTS server...');

      // Stop any currently playing audio
      if (this.currentAudio) {
        this.log('⏹️ Stopping previous audio...');
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Call TTS server
      fetch(this.ttsServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`TTS server error: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        this.log('✅ Got audio from TTS server');

        // Create audio element and play
        const audio = new Audio(URL.createObjectURL(blob));
        this.currentAudio = audio;

        audio.onplay = () => {
          this.log('✅✅✅ TTS STARTED SPEAKING! ✅✅✅');
        };

        audio.onended = () => {
          this.log('✅ TTS finished');
          this.currentAudio = null;
          URL.revokeObjectURL(audio.src);
        };

        audio.onerror = (err) => {
          this.log('❌ Audio playback error:', err);
          this.currentAudio = null;
        };

        audio.play().catch(err => {
          this.log('❌ Failed to play audio:', err);
        });
      })
      .catch(err => {
        this.log('❌ TTS Server error:', err.message);
        this.log('💡 Falling back to browser TTS...');
        this.speakWithBrowser(text);
      });
    }

    speakWithBrowser(cleanText) {
      this.log('🎤 Using browser TTS...');
      this.synthesis.cancel();

      setTimeout(() => {
        const voices = this.synthesis.getVoices();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Find best voice
        const preferredVoices = ['Google US English', 'Samantha', 'Alex'];
        for (const preferred of preferredVoices) {
          const found = voices.find(v => v.name.includes(preferred) && v.lang.startsWith('en'));
          if (found) {
            utterance.voice = found;
            this.log('✅ Selected voice:', found.name);
            break;
          }
        }

        utterance.onstart = () => this.log('✅✅✅ Browser TTS STARTED! ✅✅✅');
        utterance.onend = () => this.log('✅ Browser TTS finished');
        utterance.onerror = (event) => this.log('❌ Browser TTS error:', event.error);

        this.synthesis.speak(utterance);
      }, 300);
    }

    playAIAudioFile(audioPath) {
      this.log('🎵 Playing AI-generated audio file:', audioPath);

      // Stop any currently playing audio
      if (this.currentAudio) {
        this.log('⏹️ Stopping previous audio...');
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Request audio file from file server
      const audioServerUrl = `http://127.0.0.1:8766/audio?path=${encodeURIComponent(audioPath)}`;

      this.log('📥 Fetching audio from:', audioServerUrl);

      fetch(audioServerUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Audio server error: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          this.log('✅ Got audio file from server');

          // Create audio element and play
          const audio = new Audio(URL.createObjectURL(blob));
          this.currentAudio = audio;

          audio.onplay = () => {
            this.log('✅✅✅ AI AUDIO PLAYING! ✅✅✅');
          };

          audio.onended = () => {
            this.log('✅ AI audio finished');
            this.currentAudio = null;
            URL.revokeObjectURL(audio.src);
          };

          audio.onerror = (err) => {
            this.log('❌ Audio playback error:', err);
            this.currentAudio = null;
          };

          audio.play().catch(err => {
            this.log('❌ Failed to play audio:', err);
          });
        })
        .catch(err => {
          this.log('❌ Audio Server error:', err.message);
          this.log('💡 Audio file might have expired or server is down');
        });
    }

    playAudioFile(text) {
      // Legacy function - redirect to new implementation
      const mediaMatch = text.match(/MEDIA:([^\s]+)/);
      if (mediaMatch) {
        this.playAIAudioFile(mediaMatch[1]);
      }
    }
  }

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.voiceUI = new SimpleVoiceUI();
      window.voiceUI.init();
    });
  } else {
    window.voiceUI = new SimpleVoiceUI();
    window.voiceUI.init();
  }

  // Global debug function - call window.downloadVoiceLogs() in browser console
  window.downloadVoiceLogs = () => {
    if (window.voiceUI) {
      window.voiceUI.saveDebugLogs();
    } else {
      console.error('Voice UI not initialized');
    }
  };

  console.log('✅ Simple Voice UI script loaded');
  console.log('💡 Tip: Call window.downloadVoiceLogs() to download debug logs');
})();
