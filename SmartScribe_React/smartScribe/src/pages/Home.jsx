import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../components/contexts/AIContext';
import NavBar1 from '../components/NavBar1.jsx';
import Hero from '../components/Hero.jsx';
import Essentials from '../components/Essentials.jsx';
import PDFProcessor from '../components/PDFProcessor';
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
  const { chatWithAI } = useAI();

  // Toggle handlers
  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const handleHeroSend = async (message) => {
    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConversation(prev => [...prev, userMessage]);

    setIsTyping(true);
    try {
      const aiResponse = await chatWithAI(message);
      const aiMessage = {
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setConversation([]);
    setShowInput(false);
  };

  const handleSummaryGenerated = (summary) => {
    const summaryMessage = {
      text: `Here's the generated summary:\n\n${summary}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConversation(prev => [...prev, summaryMessage]);
  };

  // Close input box when clicking outside or pressing Escape
  useEffect(() => {
    if (!showInput) return;

    const handleClick = (e) => {
      if (inputBoxRef.current && !inputBoxRef.current.contains(e.target)) {
        setShowInput(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowInput(false);
      }
    };

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

        {isTyping && (
          <div style={{
            textAlign: 'center',
            color: 'var(--hero-color)',
            fontSize: '0.9rem',
            margin: '0.5rem 0',
            opacity: 0.8,
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
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
