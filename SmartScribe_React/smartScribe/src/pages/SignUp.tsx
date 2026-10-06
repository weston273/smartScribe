import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, Eye, EyeOff, FileText, LoaderCircle } from 'lucide-react';
import { supabase } from '../database/supabaseClient';
import './SignUp.css';

type SignupForm = { firstName: string; lastName: string; username: string; email: string; password: string };

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupForm>({ firstName: '', lastName: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const { email, password, username, firstName, lastName } = formData;
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user?.id) throw new Error('Your account is awaiting email confirmation. Check your inbox, then sign in.');
      localStorage.setItem('pendingProfile', JSON.stringify({ firstName, lastName, username }));
      setAccountCreated(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'We couldn’t create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  return <main className="signup-container auth-screen">
    <Link to="/" className="auth-brand" aria-label="SmartScribe home"><span className="auth-brand-mark"><FileText size={19}/></span><span>Smart<span>Scribe</span></span></Link>
    <section className="signup-card auth-card" aria-labelledby="signup-title">
      {accountCreated ? <div className="auth-success-panel" role="status"><span className="auth-success-icon"><Check size={24}/></span><div className="auth-overline">ONE LAST STEP</div><h1 id="signup-title">Check your inbox.</h1><p>We’ve started setting up your SmartScribe account. Confirm your email, then sign in to begin.</p><Link className="signup-button auth-submit auth-link-button" to="/login">Go to sign in</Link></div> : <>
        <div className="auth-overline">YOUR LEARNING DESK</div>
        <div className="signup-header auth-heading"><h1 id="signup-title">A space for your ideas.</h1><p>Create an account and keep your notes close.</p></div>
        <form onSubmit={handleSubmit} className="signup-form auth-form">
          <div className="name-inputs"><label className="auth-field"><span>First name</span><input type="text" name="firstName" autoComplete="given-name" placeholder="First name" value={formData.firstName} onChange={handleChange} className="form-input" required/></label><label className="auth-field"><span>Last name</span><input type="text" name="lastName" autoComplete="family-name" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="form-input" required/></label></div>
          <label className="auth-field"><span>Username</span><input type="text" name="username" autoComplete="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} className="form-input" required/></label>
          <label className="auth-field"><span>Email address</span><input type="email" name="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="form-input" required/></label>
          <label className="auth-field"><span>Password</span><span className="password-input"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" placeholder="Create a password" value={formData.password} onChange={handleChange} className="form-input" required minLength={6}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
          {errorMessage && <p className="auth-message auth-error" role="alert">{errorMessage}</p>}
          <button type="submit" className="signup-button auth-submit" disabled={loading}>{loading ? <><LoaderCircle className="auth-spinner" size={17}/> Creating your account…</> : 'Create account'}</button>
        </form>
        <p className="signup-footer auth-footer">Already have an account? <Link to="/login" className="login-link">Sign in</Link></p>
      </>}
      <p className="auth-note">SmartScribe · A quieter place to think clearly.</p>
    </section>
  </main>;
}
