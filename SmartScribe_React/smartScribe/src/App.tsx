import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { VoiceProvider } from './components/contexts/VoiceContext';
import { AIProvider } from './components/contexts/AIContext';
import { LanguageProvider } from './components/contexts/LanguageContext';
import { AuthProvider } from './components/contexts/AuthContext';
import AppShell from './components/AppShell';
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
  const [palette, setPalette] = useState(() => localStorage.getItem('smartscribe-palette') || 'sage');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('smartscribe-font-size') || 'medium');
  const toggleTheme = () => setTheme(value => value === 'light' ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem('smartscribe-palette', palette);
  }, [palette]);
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('smartscribe-font-size', fontSize);
  }, [fontSize]);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) localStorage.setItem('supabaseSession', JSON.stringify(session));
      else localStorage.removeItem('supabaseSession');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <div className="app-container"><LanguageProvider><AIProvider><VoiceProvider><AuthProvider><Suspense fallback={<div className="route-loading" role="status"><span className="loading-mark"><span/></span><p>Opening your workspace…</p></div>}><Routes>
    <Route path="/" element={<AppShell theme={theme} toggleTheme={toggleTheme}><SplashScreen/></AppShell>}/>
    <Route path="/login" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Login/></AppShell>}/>
    <Route path="/signup" element={<AppShell theme={theme} toggleTheme={toggleTheme}><SignUp/></AppShell>}/>
    <Route path="/record" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Record theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/notes" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Notes theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/notes/new" element={<AppShell theme={theme} toggleTheme={toggleTheme}><NoteEdit theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/notes/:id" element={<AppShell theme={theme} toggleTheme={toggleTheme}><NoteView theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/notes/:id/edit" element={<AppShell theme={theme} toggleTheme={toggleTheme}><NoteEdit theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/smart-chat" element={<AppShell theme={theme} toggleTheme={toggleTheme}><SmartChat theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/settings" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Settings theme={theme} setTheme={setTheme} palette={palette} setPalette={setPalette} fontSize={fontSize} setFontSize={setFontSize}/></AppShell>}/>
    <Route path="/profile" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Profile theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/quiz" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Quiz theme={theme} toggleTheme={toggleTheme}/></AppShell>}/>
    <Route path="/home" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Home/></AppShell>}/>
    <Route path="*" element={<AppShell theme={theme} toggleTheme={toggleTheme}><Home/></AppShell>}/>
  </Routes></Suspense></AuthProvider></VoiceProvider></AIProvider></LanguageProvider></div>;
}
