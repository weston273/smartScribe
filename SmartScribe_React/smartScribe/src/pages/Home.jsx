import React, { useState, useEffect, useRef } from 'react';
import NavBar1 from '../components/NavBar1.jsx';
import Hero from '../components/Hero.jsx';
import Essentials from '../components/Essentials.jsx';
import PDFProcessor from '../components/PDFProcessor'
import Footer from '../components/Footer.jsx';
import SideBar from '../components/sidebar/SideBar.jsx';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import BottomInputBox from '../components/input/BottomInputBox.jsx';

const Home = ({ theme, toggleTheme }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputBoxRef = useRef();

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  // Simulate AI response
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simple AI responses based on user input
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = "Hello! I'm SmartScribe, your AI assistant. I can help you take notes, create summaries, generate quizzes, and much more. What would you like to work on today?";
    } else if (lowerMessage.includes('help')) {
      response = "I can assist you with:\n• Taking and organizing notes\n• Creating summaries from text or documents\n• Generating quizzes for studying\n• Processing audio recordings\n• Analyzing PDFs and URLs\n\nWhat would you like to try first?";
    } else if (lowerMessage.includes('note') || lowerMessage.includes('write')) {
      response = "I'd be happy to help you with note-taking! You can share your thoughts with me and I'll help organize them into structured notes. You can also upload documents or share links for me to process.";
    } else if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
      response = "I can create custom quizzes based on any content you provide! Just share your study material with me - whether it's notes, documents, or topics - and I'll generate relevant questions to help you study.";
    } else if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
      response = "I excel at creating concise summaries! You can share text, upload PDFs, or provide URLs, and I'll extract the key points and create a comprehensive summary for you.";
    } else if (lowerMessage.includes('record') || lowerMessage.includes('audio')) {
      response = "I can help you process audio recordings! I can transcribe speech to text, create notes from recordings, and even generate summaries from your audio content.";
    } else {
      response = `I understand you're asking about "${userMessage}". I'm here to help with note-taking, summaries, quizzes, and document processing. Could you tell me more about what you'd like to accomplish?`;
    }
    
    setIsTyping(false);
    return response;
  };

  const handleHeroSend = async (message) => {
    // Add user message
    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setConversation(prev => [...prev, userMessage]);
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message);
    
    const aiMessage = {
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setConversation(prev => [...prev, aiMessage]);
  };

  const handleNewChat = () => {
    setConversation([]);
    setShowInput(false);
  };

  const handleSummaryGenerated = (summary) => {
    const summaryMessage = {
      text: `Here's the generated summary:\n\n${summary}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversation(prev => [...prev, summaryMessage]);
  };

  // Click outside to hide input bar
  useEffect(() => {
    if (!showInput) return;

    function handleClick(e) {
      if (inputBoxRef.current && !inputBoxRef.current.contains(e.target)) {
        setShowInput(false);
      }
    }
    
    function handleEsc(e) {
      if (e.key === "Escape") {
        setShowInput(false);
      }
    }

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showInput]);
    
  return (
    <div className="home-wrapper">
      <NavBar1
        theme={theme}
        onSideBarToggle={toggleSideBar}
        onProfileClick={toggleAccountDropdown}
      />

      {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
      
      <main className="main-content">
        <Hero 
          conversation={conversation} 
          onNewChat={handleNewChat}
        />
        
        {/* Add typing indicator */}
        {isTyping && (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--hero-color)', 
            fontSize: '0.9rem',
            margin: '0.5rem 0',
            opacity: 0.8
          }}>
            SmartScribe is thinking...
          </div>
        )}
        
        {showInput ? (
          <BottomInputBox onSend={handleHeroSend} ref={inputBoxRef} />
        ) : (
          <Essentials
            onNotesClick={() => setShowInput(true)}
            onSummaryGenerated={handleSummaryGenerated}
            onPDFClick={() => setShowPDFModal(true)}
          />
        )}
        
        {showPDFModal && (
          <PDFProcessor 
            isOpen={showPDFModal} 
            theme={theme}  
            onClose={() => setShowPDFModal(false)}
            onSummaryGenerated={handleSummaryGenerated}
            onNotesGenerated={(notes) => {
              const notesMessage = {
                text: `Here are the generated notes:\n\n${notes}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setConversation(prev => [...prev, notesMessage]);
            }}
          />
        )}
      </main>

      <Footer theme={theme} toggleTheme={toggleTheme} />

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}
    </div>
  );
};

export default Home;