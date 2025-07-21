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
            <Bot className="assistant-icon" size={24} />
            <div>
              <h3>AI Assistant</h3>
              <p className={`status ${isProcessing ? 'processing' : 'ready'}`}>
                {isProcessing ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <p>{message.text}</p>
                {message.sender === 'ai' && (
                  <button
                    className="speak-btn"
                    onClick={() => handleSpeak(message.text)}
                    title="Read aloud"
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}
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
            <div className="message ai">
              <div className="message-content typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          {isListening && (
            <div className="listening-indicator">
              <div className="pulse-dot"></div>
              <span>Listening...</span>
            </div>
          )}

          <div className="input-row">
            <button
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceToggle}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="message-input"
              rows={1}
              disabled={isProcessing}
            />

            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}