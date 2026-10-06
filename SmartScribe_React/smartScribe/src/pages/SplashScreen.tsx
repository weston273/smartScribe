import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import './SplashScreen.css';

const featureFallbacks = [
  'A calmer way to collect what you learn.',
  'Keep your thoughts, notes and recordings together.',
  'Make space for clearer thinking.',
];

export default function SplashScreen() {
  const [feature, setFeature] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let redirectTimer: number;
    const controller = new AbortController();
    const openWorkspace = async () => {
      try {
        const response = await fetch('/mock/f7bfa7b7-8a11-4f7a-bbde-2df2a01b4c8b', { signal: controller.signal });
        if (!response.ok) throw new Error('Feature service unavailable');
        const payload = await response.json() as { features?: string[] };
        const choices = payload.features?.filter(Boolean) ?? [];
        setFeature(choices[Math.floor(Math.random() * choices.length)] || featureFallbacks[0]);
      } catch {
        if (!controller.signal.aborted) setFeature(featureFallbacks[Math.floor(Math.random() * featureFallbacks.length)]);
      } finally {
        if (!controller.signal.aborted) redirectTimer = window.setTimeout(() => navigate('/home'), 2600);
      }
    };
    void openWorkspace();
    return () => { controller.abort(); window.clearTimeout(redirectTimer); };
  }, [navigate]);

  return <main className="splash-container splash-screen">
    <div className="splash-panel"><span className="splash-mark"><FileText size={23}/></span><span className="splash-wordmark">Smart<span>Scribe</span></span><div className="splash-rule"/><span className="splash-kicker"><Sparkles size={13}/> YOUR LEARNING DESK</span><h1>A quieter place to<br/><em>think clearly.</em></h1><p className="splash-feature">{feature || 'Gather your thoughts. We’ll meet you there.'}</p><button className="splash-enter" onClick={()=>navigate('/home')}>Open workspace <ArrowRight size={16}/></button><span className="splash-note">Notes, recordings and ideas — thoughtfully together.</span></div>
    <span className="splash-corner-mark" aria-hidden="true">SS&nbsp; · &nbsp;EST. FOR THE CURIOUS</span>
  </main>;
}
