import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';

import { VoiceProvider } from './components/contexts/VoiceContext';
import { AIProvider } from './components/contexts/AIContext';
import { LanguageProvider } from './components/contexts/LanguageContext';

import SplashScreen from './pages/SplashScreen.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Quiz from './pages/Quiz.jsx';
import Record from './pages/Record.jsx';
import Notes from './pages/Notes.jsx';
import NoteView from './pages/NoteView.jsx';
import NoteEdit from './pages/NoteEdit.jsx';
import SmartChat from './pages/SmartChat.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'dark'
  );

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      <LanguageProvider>
        <AIProvider>
          <VoiceProvider>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/signup" element={<SignUp theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/record" element={<Record theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/notes" element={<Notes theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/notes/new" element={<NoteEdit theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/notes/:id" element={<NoteView theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/notes/:id/edit" element={<NoteEdit theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/smart-chat" element={<SmartChat theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/profile" element={<Profile theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/quiz" element={<Quiz theme={theme} />} />
              <Route path="/home" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
            </Routes>
          </VoiceProvider>
        </AIProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;