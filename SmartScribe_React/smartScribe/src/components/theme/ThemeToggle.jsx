// ThemeToggle.js
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  // Toggle function
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: theme === 'dark' ? '#2a1018' : '#f0e0e0',
        color: theme === 'dark' ? '#f0e0e0' : '#1a0c0f',
        fontFamily: 'monospace',
        cursor: 'pointer',
        width: 'fit-content',
        borderRadius: '5px',
      }}
      onClick={toggleTheme}
    >
      <input
        type="radio"
        checked={true} // always appears selected
        readOnly
        style={{
          accentColor: theme === 'dark' ? '#000000' : '#ffffff',
          backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
          borderRadius: '50%',
        }}
      />
      {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
    </label>
  );
}
