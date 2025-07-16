import React from 'react';
import './SignUp.css';
import Input from '../components/input/Input';
import Password from '../components/input/Password';
import Buttons from '../components/buttons/Buttons';
import { Link } from 'react-router-dom';
import LogoPlaceholder from '../assets/smart_logo.png';

export default function SignUp({ theme }) {
  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={LogoPlaceholder} alt="Smart Logo" className="smart-logo" />
        <h1>Welcome back!</h1>
        <p>
          To keep connected with us please<br />
          login with your personal info
        </p>
        <Buttons btn={{ name: 'Login', path: '/login' }} />
      </div>

      <div className="signup-right">
        <h1>Create Account</h1>
        <div className="name-inputs">
          <Input theme={theme} placeholder="First Name" />
          <Input theme={theme} placeholder="Second Name" />
        </div>
        <Input theme={theme} placeholder="Username" />
        <Password theme={theme} />

        <div className="save-password">
          <input type="checkbox" id="save-password" />
          <label htmlFor="save-password">Save Password?</label>
        </div>

        <Buttons btn={{ name: 'Sign Up', path: '/' }} />

        <div className="divider">or continue with</div>
        <div className="socials">
          <img src="/google.png" alt="Google" />
          <img src="/apple.png" alt="Apple" />
          <img src="/facebook.png" alt="Facebook" />
        </div>
      </div>
    </div>
  );
}
