import React, { useRef, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { supabase } from './../../database/supabaseClient.js'; 

import { useNavigate } from 'react-router-dom';
import './AccountDropDown.css';

export default function AccountDropDown({ onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ name: 'User', email: '' });
  // to make sure logout clears session both locally and from supabase
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabaseSession');
    navigate('/login');
  };
  

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      const storedUsername = localStorage.getItem('username');

      if (user) {
        setUserInfo({
          name: storedUsername || 'User',
          email: user.email || '',
        });
      } else {
        setUserInfo({
          name: 'User',
          email: '',
        });
      }
    };

    fetchUserEmail();
  }, []);

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
            <h3>{userInfo.name}</h3>
            {userInfo.email && <p>{userInfo.email}</p>}
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
          <Link
            to="/login"
            className="menu-item"
            onClick={() => {handleLogout(); onClose(); }}
          >
            <LogOut size={18} />
            <span>{userInfo.name === 'User' ? 'Sign In' : 'Sign Out'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
