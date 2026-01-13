import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../database/supabaseClient';
import './Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { username, email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const { user } = data;

    // Retrieve any stored profile info from signup
    const pendingProfile = JSON.parse(localStorage.getItem('pendingProfile'));

    // Upsert the user profile into Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        email: user.email,
        username: pendingProfile?.username || username || user.email.split('@')[0],
        firstname: pendingProfile?.firstName || null,
        lastname: pendingProfile?.lastName || null,
      });

    if (profileError) {
      console.error("Error upserting profile:", profileError.message);
    } else {
      console.log("Profile saved successfully!");
    }

    // Clean up stored data
    localStorage.removeItem('pendingProfile');

    // Save user session locally
    localStorage.setItem('supabaseSession', JSON.stringify(user));

    setLoading(false);
    navigate('/home');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your SmartScribe account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Link to="/signup" className="forgot-password">
            Forgot Password?
          </Link>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don’t have an account?{' '}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
