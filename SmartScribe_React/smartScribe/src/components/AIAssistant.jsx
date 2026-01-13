import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Mic, MicOff, Volume2, VolumeX, X, Bot } from 'lucide-react';
import { useAI } from './contexts/AIContext';
import { useVoice } from './contexts/VoiceContext';
import { useLanguage } from './contexts/LanguageContext';
import './AIAssistant.css';

export default function AIAssistant({ isOpen, onClose, context }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. I can help you with your notes, generate summaries, create quizzes, and answer questions about your content. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageAnimations, setMessageAnimations] = useState({});
  const messagesEndRef = useRef(null);

  const { chatWithAI, isProcessing } = useAI();
  const {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    transcript,
    clearTranscript
  } = useVoice();

  const { translate } = useLanguage();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (transcript && transcript.trim()) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // Initialize animations for new messages
  useEffect(() => {
    const newAnimations = {};
    messages.forEach((message, index) => {
      if (!messageAnimations[message.id]) {
        newAnimations[message.id] = {
          shouldAnimate: true,
          delay: index * 100
        };
      }
    });
    
    if (Object.keys(newAnimations).length > 0) {
      setMessageAnimations(prev => ({ ...prev, ...newAnimations }));
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    clearTranscript();
    setIsTyping(true);

    try {
      const response = await chatWithAI(inputMessage, context);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeak = (text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant-container">
        <div className="ai-assistant-header">
          <div className="assistant-info">
            <div className="assistant-icon-wrapper">
            <Bot className="assistant-icon" size={24} />
              <div className="icon-glow"></div>
              <div className="icon-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
            </div>
            <div className="assistant-details">
              <h3>AI Assistant</h3>
              <p className={`status ${isProcessing ? 'processing' : 'ready'}`}>
                {isProcessing ? (
                  <span>
                    <span className="status-dot processing"></span>
                    <span className="status-text">Thinking</span>
                    <span className="thinking-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </span>
                ) : (
                  <span>
                    <span className="status-dot ready"></span>
                    <span className="status-text">Ready to help</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
            <div className="button-ripple"></div>
            <div className="close-hover-effect"></div>
          </button>
        </div>

        <div className="messages-container">
          <div className="messages-background">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
          </div>
          
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`message ${message.sender} message-enter`}
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: 1
              }}
            >
              <div className="message-content">
                <div className="message-bubble">
                <p>{message.text}</p>
                {message.sender === 'ai' && (
                  <button
                      className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
                    onClick={() => handleSpeak(message.text)}
                    title="Read aloud"
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      <div className="button-ripple"></div>
                      {isSpeaking && <div className="sound-waves">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                      </div>}
                  </button>
                )}
                </div>
                <div className="message-glow"></div>
              </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="message ai message-enter typing-message">
              <div className="message-content">
                <div className="message-bubble typing">
                <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <div className="ai-thinking-text">AI is crafting a response...</div>
                </div>
                <div className="message-glow typing-glow"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-containers">
          {isListening && (
            <div className="listening-indicator">
              <div className="pulse-dot"></div>
              <span className="listening-text">Listening for your voice...</span>
              <div className="voice-visualizer">
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
              </div>
            </div>
          )}

          <div className="input-row">
            <button
              className={`ai-voice-btn ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
              onClick={handleVoiceToggle}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              <div className="button-ripple"></div>
              {isListening && (
                <>
                  <div className="listening-ring ring-1"></div>
                  <div className="listening-ring ring-2"></div>
                  <div className="listening-ring ring-3"></div>
                </>
              )}
              <div className="button-glow"></div>
            </button>

            <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="message-input"
              rows={1}
              disabled={isProcessing}
            />
              <div className="input-glow"></div>
              <div className="input-border-animation"></div>
            </div>

            <button
              className={`send-btn ${inputMessage.trim() ? 'has-content' : ''} ${isProcessing ? 'processing' : ''}`}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              title="Send message"
            >
              {isProcessing ? (
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                </div>
              ) : (
              <Send size={20} />
              )}
              <div className="button-ripple"></div>
              <div className="send-glow"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}