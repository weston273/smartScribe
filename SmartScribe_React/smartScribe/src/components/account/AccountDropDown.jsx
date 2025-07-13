import React, { useRef, useEffect, useState } from "react";
import './AccountDropDown.css';
import { Link } from 'react-router-dom';

import AccountImage from '../../assets/profile_dark.png'
import DotLight from '../../assets/dot.png'
import DotDark from '../../assets/dot_dark.png'
import SignUp from '../../assets/sign_up.png'

export default function AccountDropDown({ theme, onClose }) {
    const Dot = theme === 'light' ? DotLight : DotDark;

  const dropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700); // 700ms loading
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown if click is outside
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
        {isLoading ? (
          <div className='loading-bar-container' theme={theme}>
            <div className="loading-bar" />
          </div>
        ) : (
          <>
            <div className="account-details">
              <p className="account-name">USER</p>
              <div className="account-avatar">
                <img src={AccountImage} alt="User Avatar" />
              </div>

              <p className="account-login-text">PLEASE LOG IN</p>
              <button className="login-btn">LOG IN</button>

            </div>
            <div className="account-actions">
              <button className="add-account-btn">
                <span className="account-button-image">+</span>
                Add Account
              </button>
              <button className="sign-up-btn">
                <span className="sign-up-button-image">
                    <img src={SignUp} alt="" />
                </span>
                Sign Up
              </button>
            </div>
            <div className="account-links-container">
              <Link to="#" className="privacy-policy">Privacy policy</Link>
              <span className="dot">
                <img src={Dot} alt="Dot" />
              </span>
              <Link to="#" className="sign-up-link">Sign Up</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
