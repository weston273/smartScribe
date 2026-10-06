import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, LoaderCircle } from 'lucide-react';
import { supabase } from '../database/supabaseClient';
import './Login.css';

type FormData = { username: string; email: string; password: string };

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const { username, email, password } = formData;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data.user;
      let pendingProfile: Partial<{ username: string; firstName: string; lastName: string }> = {};
      try { pendingProfile = JSON.parse(localStorage.getItem('pendingProfile') || '{}'); } catch { /* Ignore malformed stale signup metadata. */ }
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        email: user.email,
        username: pendingProfile.username || username || user.email?.split('@')[0],
        firstname: pendingProfile.firstName || null,
        lastname: pendingProfile.lastName || null,
      });
      if (profileError) console.error('Error upserting profile:', profileError.message);
      localStorage.removeItem('pendingProfile');
      localStorage.setItem('supabaseSession', JSON.stringify(user));
      navigate('/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'We couldn’t sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  return <main className="login-container auth-screen">
    <Link to="/" className="auth-brand" aria-label="SmartScribe home"><span className="auth-brand-mark"><FileText size={19}/></span><span>Smart<span>Scribe</span></span></Link>
    <section className="login-card auth-card" aria-labelledby="login-title">
      <div className="auth-overline">YOUR LEARNING DESK</div>
      <div className="login-header auth-heading"><h1 id="login-title">Welcome back.</h1><p>Sign in to return to your notes and ideas.</p></div>
      <form onSubmit={handleSubmit} className="login-form auth-form">
        <label className="auth-field"><span>Email address</span><input type="email" name="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="form-input" required/></label>
        <label className="auth-field"><span>Username <small>optional</small></span><input type="text" name="username" autoComplete="username" placeholder="Your username" value={formData.username} onChange={handleChange} className="form-input"/></label>
        <label className="auth-field"><span>Password</span><span className="password-input"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Enter your password" value={formData.password} onChange={handleChange} className="form-input" required/><button type="button" className="password-toggle" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
        {errorMessage && <p className="auth-message auth-error" role="alert">{errorMessage}</p>}
        <button type="submit" className="login-button auth-submit" disabled={loading}>{loading ? <><LoaderCircle className="auth-spinner" size={17}/> Signing in…</> : 'Sign in'}</button>
      </form>
      <p className="login-footer auth-footer">New to SmartScribe? <Link to="/signup" className="signup-link">Create an account</Link></p>
      <p className="auth-note">Your notes stay yours. Pick up at your own pace.</p>
    </section>
  </main>;
}
