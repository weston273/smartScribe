import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom'; // ✅ Only import Routes & Route

import { VoiceProvider } from './components/contexts/VoiceContext';

import SplashScreen from './pages/SplashScreen.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Quiz from './pages/Quiz.jsx';
import Record from './pages/Record.jsx';
import Notes from './pages/Notes.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  console.log("OpenAI Key:", apiKey);


  return (
    <VoiceProvider>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/signup" element={<SignUp theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/record" element={<Record theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/notes" element={<Notes theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/profile" element={<Profile theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/quiz" element={<Quiz theme={theme} />} />
        <Route path="/home" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>
      {/* You can include Footer here if it's global */}
    </VoiceProvider>
  );
}

export default App;
