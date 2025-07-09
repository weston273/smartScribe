// ThemeToggle.js
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggle = (e) => {
    setTheme(e.target.checked ? 'light' : 'dark');
  };

  return (
    <input
      type="checkbox"
      id="theme-radio-btn"
      className="radiobtn"
      onChange={handleToggle}
      checked={theme === 'light'}
    />
  );
}
