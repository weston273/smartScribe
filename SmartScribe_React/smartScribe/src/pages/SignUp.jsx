import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../database/supabaseClient';
import './SignUp.css';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password, username, firstName, lastName } = formData;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert("Sign-up failed: " + signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData?.user?.id;

    if (!userId) {
      alert("Signup succeeded, but user ID is missing. This might be due to pending email confirmation.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('profiles').insert([
      {
        user_id: userId,
        email,
        username,
        firstname: firstName,
        lastname: lastName,
      },
    ]);

    if (insertError) {
      alert("Error saving profile data: " + insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join SmartScribe and start taking smarter notes</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="name-inputs">
            <div className="input-wrapper">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />

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

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
