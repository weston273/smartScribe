import React from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import Input from '../components/input/Input';
import Password from '../components/input/Password';
import Buttons from '../components/buttons/Buttons';
import LogoPlaceholder from '../assets/smart_logo.png';

export default function Login({ theme }) {
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="welcome-text">
          <h1>Welcome back!</h1>
          <p>
            Smarter notes. Sharper focus. <br />
            Greater impact — with SmartScribe
          </p>
          <div className="form-fields">
            <Input theme={theme} placeholder="Username" />
            <Password theme={theme} />
            <Link to="#" className="forgot-password">Forgot Password?</Link>
          </div>
          <Buttons btn={{ name: 'Login', path: '/' }} />
          <div className="divider">or continue with</div>
          <div className="socials">
            <img src="/google.png" alt="Google" />
            <img src="/apple.png" alt="Apple" />
            <img src="/facebook.png" alt="Facebook" />
          </div>
          <p className="footer-note">Not a member? <Link to="/signup">Sign Up now</Link></p>
        </div>
      </div>
      <div className="login-right">
        <img src={LogoPlaceholder} alt="Smart Logo" className="smart-logo" />
        <div className="login-tagline">
          <p>Smarter notes start here. <br />Note it. Know it. Nail it</p>
          <div className="dots">
            <span className="dot" />
            <span className="dot active" />
            <span className="dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
