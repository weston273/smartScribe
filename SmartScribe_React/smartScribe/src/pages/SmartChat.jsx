import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, MoreVertical, Trash2, Copy, Download, Bot, User as UserIcon } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import { streamChatResponse, chatWithAI } from '../utils/ai';
import './SmartChat.css';

export default function SmartChat({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setCurrentStreamingMessage('');

    try {
      const messages_for_ai = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      messages_for_ai.push({ role: 'user', content: inputMessage });

      let streamingContent = '';
      const aiResponse = await streamChatResponse(
        messages_for_ai,
        (chunk) => {
          streamingContent += chunk;
          setCurrentStreamingMessage(streamingContent);
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentStreamingMessage('');
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

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      setCurrentStreamingMessage('');
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartscribe-chat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="smart-chat-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="smart-chat-main">
          <div className="chat-header">
            <div className="chat-title">
              <Bot size={28} className="chat-icon" />
              <div>
                <h1>SmartScribe AI</h1>
                <p className={`status ${isTyping ? 'typing' : 'ready'}`}>
                  {isTyping ? 'Thinking...' : 'Ready to help'}
                </p>
              </div>
            </div>
            <div className="chat-actions">
              <button onClick={downloadChat} className="action-btn" title="Download chat">
                <Download size={20} />
              </button>
              <button onClick={clearChat} className="action-btn" title="Clear chat">
                <Trash2 size={20} />
              </button>
              <button className="action-btn" title="More options">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <Bot size={64} className="welcome-icon" />
                <h2>Welcome to SmartScribe AI</h2>
                <p>I'm here to help you with note-taking, summarization, quiz generation, and more!</p>
                <div className="suggestions">
                  <button 
                    className="suggestion-btn"
                    onClick={() => setInputMessage("Summarize my notes")}
                  >
                    Summarize my notes
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setInputMessage("Generate a quiz")}
                  >
                    Generate a quiz
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setInputMessage("Help me organize my study plan")}
                  >
                    Help me study
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-avatar">
                      {message.role === 'user' ? (
                        <UserIcon size={20} />
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-actions">
                        <button 
                          onClick={() => copyMessage(message.content)}
                          className="message-action-btn"
                          title="Copy message"
                        >
                          <Copy size={14} />
                        </button>
                        <span className="message-time">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {currentStreamingMessage && (
                  <div className="message assistant streaming">
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {currentStreamingMessage}
                        <span className="cursor">|</span>
                      </div>
                    </div>
                  </div>
                )}

                {isTyping && !currentStreamingMessage && (
                  <div className="message assistant">
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </>
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

            <div className="input-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="message-input"
                rows={1}
                disabled={isTyping}
              />
              
              <div className="input-actions">
                {recognitionRef.current && (
                  <button
                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleVoiceInput}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                )}
                
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  title="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}