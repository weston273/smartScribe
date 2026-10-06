import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { VoiceProvider } from './components/contexts/VoiceContext';
import { AIProvider } from './components/contexts/AIContext';
import { LanguageProvider } from './components/contexts/LanguageContext';
import { AuthProvider } from './components/contexts/AuthContext';
import { supabase } from './database/supabaseClient.js';

const SplashScreen = lazy(() => import('./pages/SplashScreen'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Record = lazy(() => import('./pages/Record'));
const Notes = lazy(() => import('./pages/Notes'));
const NoteView = lazy(() => import('./pages/NoteView'));
const NoteEdit = lazy(() => import('./pages/NoteEdit'));
const SmartChat = lazy(() => import('./pages/SmartChat'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const toggleTheme = () => setTheme(value => value === 'light' ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) localStorage.setItem('supabaseSession', JSON.stringify(session));
      else localStorage.removeItem('supabaseSession');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <div className="app-container"><LanguageProvider><AIProvider><VoiceProvider><AuthProvider><Suspense fallback={<div className="route-loading" role="status"><span className="loading-mark"><span/></span><p>Opening your workspace…</p></div>}><Routes>
    <Route path="/" element={<SplashScreen/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/record" element={<Record theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/notes" element={<Notes theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/notes/new" element={<NoteEdit theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/notes/:id" element={<NoteView theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/notes/:id/edit" element={<NoteEdit theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/smart-chat" element={<SmartChat theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/profile" element={<Profile theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/quiz" element={<Quiz theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="/home" element={<Home theme={theme} toggleTheme={toggleTheme}/>}/>
    <Route path="*" element={<Home theme={theme} toggleTheme={toggleTheme}/>}/>
  </Routes></Suspense></AuthProvider></VoiceProvider></AIProvider></LanguageProvider></div>;
}
