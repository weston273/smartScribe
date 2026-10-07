import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';
import { useVoice } from './contexts/VoiceContext';
import './VoiceCommand.css';

export default function VoiceCommand({ isOpen, onClose }) {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');

  const {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    transcript,
    clearTranscript,
    isSupported,
    voiceError
  } = useVoice();

  const voiceLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' }
  ];

  const processVoiceCommand = useCallback((command) => {
    const lowerCommand = command.toLowerCase();
    
    // Basic voice commands
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      speak('Hello! How can I help you today?');
    } else if (lowerCommand.includes('thank you') || lowerCommand.includes('thanks')) {
      speak('You\'re welcome! Is there anything else I can help you with?');
    } else if (lowerCommand.includes('time')) {
      const now = new Date();
      speak(`The current time is ${now.toLocaleTimeString()}`);
    } else if (lowerCommand.includes('date')) {
      const now = new Date();
      speak(`Today's date is ${now.toLocaleDateString()}`);
    } else if (lowerCommand.includes('create note')) {
      speak('I\'ll help you create a new note. What would you like to write?');
    } else if (lowerCommand.includes('start recording')) {
      speak('Starting audio recording now.');
    } else if (lowerCommand.includes('stop recording')) {
      speak('Stopping audio recording.');
    } else if (lowerCommand.includes('generate quiz')) {
      speak('I\'ll generate a quiz based on your notes.');
    } else if (lowerCommand.includes('summarize')) {
      speak('I\'ll create a summary of your content.');
    } else {
      speak('I understand you said: ' + command + '. How can I help you with that?');
    }
  }, [speak]);

  useEffect(() => {
    if (transcript && transcript.trim()) {
      const newCommand = { id: Date.now(), text: transcript, timestamp: new Date(), language: currentLanguage };
      setCommandHistory(prev => [newCommand, ...prev.slice(0, 9)]);
      processVoiceCommand(transcript);
    }
  }, [transcript, currentLanguage, processVoiceCommand]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(currentLanguage);
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak('Voice commands are ready. Try saying hello, what time is it, or create a note.');
    }
  };

  const clearHistory = () => {
    setCommandHistory([]);
    clearTranscript();
  };

  if (!isOpen) return null;

  if (!isSupported) {
    return (
      <div className="voice-command-overlay">
        <div className="voice-command-modal" role="dialog" aria-modal="true" aria-label="Voice commands">
          <div className="voice-command-header">
            <h2>Voice Commands</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close voice commands">
              <X size={20} />
            </button>
          </div>
          <div className="voice-command-content">
            <div className="not-supported">
              <h3>Voice commands not supported</h3>
              <p>Your browser doesn't support speech recognition. Please use a modern browser like Chrome or Edge.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-command-overlay">
      <div className="voice-command-modal" role="dialog" aria-modal="true" aria-label="Voice commands">
        <div className="voice-command-header">
          <h2>Voice Commands</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close voice commands">
            <X size={20} />
          </button>
        </div>

        <div className="voice-command-content">
          {/* Voice Controls */}
          <div className="voice-controls">
            <div className="control-group">
              <button
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceToggle}
                aria-pressed={isListening}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
              </button>

              <button
                className={`voice-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleSpeakToggle}
                aria-pressed={isSpeaking}
              >
                {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                <span>{isSpeaking ? 'Stop Speaking' : 'Test Voice'}</span>
              </button>
            </div>

            {isListening && (
              <div className="listening-status">
                <div className="pulse-indicator"></div>
                <span>Listening... Speak now</span>
              </div>
            )}

            {voiceError && <p className="inline-error" role="alert">{voiceError}</p>}

            {transcript && (
              <div className="current-transcript">
                <h4>Current Input:</h4>
                <p>"{transcript}"</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="voice-settings">
            <div className="setting-group">
              <label htmlFor="language-select">Voice Language:</label>
              <select
                id="language-select"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="language-select"
              >
                {voiceLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Command Examples */}
          <div className="command-examples">
            <h4>Try These Commands:</h4>
            <div className="command-list">
              <div className="command-item">"Hello" - Greet the assistant</div>
              <div className="command-item">"What time is it?" - Get current time</div>
              <div className="command-item">"Create note" - Start a new note</div>
              <div className="command-item">"Start recording" - Begin audio recording</div>
              <div className="command-item">"Generate quiz" - Create a quiz</div>
              <div className="command-item">"Summarize" - Create a summary</div>
            </div>
          </div>

          {/* Command History */}
          {commandHistory.length > 0 && (
            <div className="command-history">
              <div className="history-header">
                <h4>Recent Commands</h4>
                <button onClick={clearHistory} className="clear-btn">
                  Clear History
                </button>
              </div>
              <div className="history-list">
                {commandHistory.map(command => (
                  <div key={command.id} className="history-item">
                    <div className="history-text">"{command.text}"</div>
                    <div className="history-meta">
                      <span>{command.language}</span>
                      <span>{command.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
