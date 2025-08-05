import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Send, Mic, MicOff } from 'lucide-react';
import './BottomInputBox.css';

const BottomInputBox = forwardRef(({ onSend }, ref) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    
    // Setup speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  return (
    <div className="input-row" ref={ref}>
      <div className="input-container">
        <textarea
          ref={inputRef}
          className="input-text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Press Enter to send)"
          rows={1}
        />
        
        <div className="input-actions">
          {recognitionRef.current && (
            <button 
              className={`voicee-btn ${isListening ? 'listening' : ''}`} 
              onClick={toggleVoiceInput}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          
          <button 
            className="send-btn" 
            onClick={handleSend} 
            disabled={!input.trim()}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});

BottomInputBox.displayName = 'BottomInputBox';

export default BottomInputBox;