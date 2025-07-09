import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import SplashScreen from '../src/pages/SplashScreen.jsx';
import NavBar from '../src/components/NavBar.jsx';
import Home from '../src/pages/Home.jsx';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle handler
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      {/* If you have a NavBar, you can pass toggleTheme down as prop */}
      <NavBar toggleTheme={toggleTheme} theme={theme} />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
