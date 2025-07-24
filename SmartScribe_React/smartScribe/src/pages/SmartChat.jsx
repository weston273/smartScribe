import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SendIcon, MicIcon, MicOffIcon, BotIcon, UserIcon, CopyIcon, DownloadIcon, TrashIcon, SettingsIcon, MenuIcon } from '../components/icons/Icons';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import { streamChatResponse } from '../utils/ai';
import { useLanguage } from '../components/contexts/LanguageContext';
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
  const inputRef = useRef(null);
  const { t } = useLanguage();

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

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

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
        content: t('chat.error') || 'Sorry, I encountered an error. Please try again.',
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
    if (window.confirm(t('chat.clearConfirm') || 'Are you sure you want to clear all messages?')) {
      setMessages([]);
      setCurrentStreamingMessage('');
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
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

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="message-h3">{line.substring(4)}</h3>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="message-h2">{line.substring(3)}</h2>;
      } else if (line.startsWith('# ')) {
        return <h1 key={index} className="message-h1">{line.substring(2)}</h1>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="message-li">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="message-p">{line}</p>;
      }
    });
  };

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="smart-chat-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="smart-chat-main">
          <div className="chat-header">
            <div className="chat-title">
              <BotIcon size={28} className="chat-icon" />
              <div>
                <h1>{t('chat.title') || 'SmartScribe AI'}</h1>
                <p className={`status ${isTyping ? 'typing' : 'ready'}`}>
                  {isTyping ? (t('chat.thinking') || 'Thinking...') : (t('chat.ready') || 'Ready to help')}
                </p>
              </div>
            </div>
            <div className="chat-actions">
              <button onClick={downloadChat} className="btn btn-icon btn-ghost" title={t('chat.download') || 'Download chat'}>
                <DownloadIcon size={20} />
              </button>
              <button onClick={clearChat} className="btn btn-icon btn-ghost" title={t('chat.clear') || 'Clear chat'}>
                <TrashIcon size={20} />
              </button>
              <Link to="/settings" className="btn btn-icon btn-ghost" title={t('chat.settings') || 'Settings'}>
                <SettingsIcon size={20} />
              </Link>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <BotIcon size={64} className="welcome-icon" />
                <h2>{t('chat.welcome') || 'Welcome to SmartScribe AI'}</h2>
                <p>{t('chat.welcomeDesc') || "I'm here to help you with note-taking, summarization, quiz generation, and more!"}</p>
                <div className="suggestions">
                  <button 
                    className="suggestion-btn"
                    onClick={() => setInputMessage(t('chat.suggest1') || "Summarize my notes")}
                  >
                    {t('chat.suggest1') || 'Summarize my notes'}
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setInputMessage(t('chat.suggest2') || "Generate a quiz")}
                  >
                    {t('chat.suggest2') || 'Generate a quiz'}
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setInputMessage(t('chat.suggest3') || "Help me organize my study plan")}
                  >
                    {t('chat.suggest3') || 'Help me study'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-avatar">
                      {message.role === 'user' ? (
                        <UserIcon size={20} />
                      ) : (
                        <BotIcon size={20} />
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {formatMessage(message.content)}
                      </div>
                      <div className="message-actions">
                        <button 
                          onClick={() => copyMessage(message.content)}
                          className="btn btn-icon btn-ghost btn-sm"
                          title={t('chat.copy') || 'Copy message'}
                        >
                          <CopyIcon size={14} />
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
                      <BotIcon size={20} />
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {formatMessage(currentStreamingMessage)}
                        <span className="cursor">|</span>
                      </div>
                    </div>
                  </div>
                )}

                {isTyping && !currentStreamingMessage && (
                  <div className="message assistant">
                    <div className="message-avatar">
                      <BotIcon size={20} />
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
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            {isListening && (
              <div className="listening-indicator">
                <div className="pulse-dot"></div>
                <span>{t('chat.listening') || 'Listening...'}</span>
              </div>
            )}

            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.placeholder') || 'Type your message here...'}
                className="message-input"
                rows={1}
                disabled={isTyping}
              />
              
              <div className="input-actions">
                {recognitionRef.current && (
                  <button
                    className={`btn btn-icon btn-ghost voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleVoiceInput}
                    title={isListening ? (t('chat.stopListening') || 'Stop listening') : (t('chat.startVoice') || 'Start voice input')}
                  >
                    {isListening ? <MicOffIcon size={20} /> : <MicIcon size={20} />}
                  </button>
                )}
                
                <button
                  className="btn btn-primary send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  title={t('chat.send') || 'Send message'}
                >
                  <SendIcon size={20} />
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