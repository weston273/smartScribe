import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ toggleTheme, theme }) {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="theme-toggle">
            <input
              type="checkbox"
              id="theme-radio-btn"
              className="theme-checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <label htmlFor="theme-radio-btn" className="theme-label">
              Dark Theme
            </label>
          </div>
        </div>

        <div className="footer-right">
          <Link to="#" className="footer-link">
            powered by NYANZVI
          </Link>
          <Link to="#" className="footer-link">
            version 1.0.0
          </Link>
        </div>
      </div>
    </footer>
  );
}