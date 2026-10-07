import React from 'react';
import './Footer.css'

/** @param {{ theme?: string; toggleTheme?: () => void }} props */
export default function Footer({ theme, toggleTheme } = {}) {
  void theme;
  void toggleTheme;
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left"><span className="footer-brand">SmartScribe</span></div>

        <div className="footer-right">
          <a href="https://www.hellocooperations.com" target="_blank" rel="noopener noreferrer" className="footer-link">Powered by Hello</a>
          <span className="footer-version">SmartScribe</span>
        </div>
      </div>
    </footer>
  );
}
