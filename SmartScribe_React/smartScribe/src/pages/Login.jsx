import React from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import Input from '../components/input/Input';
import Password from '../components/input/Password';
import Buttons from '../components/buttons/Buttons';
import LogoLight from '../assets/smart_logo.png';
import LogoDark from '../assets/smart_logo_dark.png'
import GoogleIcon from '../assets/google_icon.png'
import GoogleIconDark from '../assets/google_icon_dark.png'
import AppleIcon from '../assets/apple_icon.png'
import AppleIconDark from '../assets/apple_icon_dark.png'
import FacebookIcon from '../assets/facebook_icon.png'
import FacebookIconDark from '../assets/facebook_icon_dark.png'

export default function Login({ theme }) {
    const Google = theme === 'light' ? GoogleIcon : GoogleIconDark
    const Apple = theme === 'light' ? AppleIcon : AppleIconDark
    const Facebook = theme === 'light' ? FacebookIcon : FacebookIconDark
    const Logo = theme === 'light' ? LogoLight : LogoDark
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
            <img src={Google} alt="Google" />
            <img src={Apple} alt="Apple" />
            <img src={Facebook} alt="Facebook" />
          </div>
          <p className="footer-note">Not a member? <Link to="/signup">Sign Up now</Link></p>
        </div>
      </div>
      <div className="login-right">
        <img src={Logo} alt="Smart Logo" className="smart-logo" />
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
