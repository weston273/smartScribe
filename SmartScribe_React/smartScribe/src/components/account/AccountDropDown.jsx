import React, { useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import './AccountDropDown.css';

export default function AccountDropDown({ onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="account-dropdown-overlay">
      <div className="account-dropdown" ref={dropdownRef}>
        <div className="account-header">
          <div className="account-avatar">
            <User size={32} />
          </div>
          <div className="account-info">
            <h3>Weston N Sululu</h3>
            <p>sululuweston@gmail.com</p>
          </div>
        </div>
        
        <div className="account-menu">
          <Link to="/profile" className="menu-item" onClick={onClose}>
            <User size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="menu-item" onClick={onClose}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <Link to="/login" className="menu-item" onClick={onClose}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </div>
  );
}