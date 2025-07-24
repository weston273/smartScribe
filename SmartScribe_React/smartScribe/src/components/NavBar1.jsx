import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, UserIcon, PenIcon } from './icons/Icons';
import { useLanguage } from './contexts/LanguageContext';
import './NavBar1.css';

export default function NavBar1({ theme, onSideBarToggle, onProfileClick }) {
  const { t } = useLanguage();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button onClick={onSideBarToggle} className="navbar-menu-btn">
            <MenuIcon size={24} />
          </button>
          
          <Link to="/home" className="navbar-brand">
            <PenIcon onClick={onSideBarToggle} size={28} className="brand-icon" />
            <span className="brand-text">SmartScribe</span>
          </Link>
        </div>

        

        <div className="navbar-right">
          <button onClick={onProfileClick} className="navbar-profile-btn">
            <UserIcon size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}