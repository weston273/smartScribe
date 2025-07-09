import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import SplashScreen from '../src/pages/SplashScreen.jsx';
import Home from '../src/pages/Home.jsx';
import Footer from '../src/components/Footer.jsx'

function App() {
  // Initialize theme state, default to 'light'
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light');

  // Function to toggle theme 
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Update the data-theme attribute on the <html> element whenever theme changes

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  return (
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>    
  );
}

export default App;
