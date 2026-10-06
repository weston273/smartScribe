import { lazy, Suspense, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, BookOpen, Brain, FileText, Headphones, Mic, Moon, Plus, Search, Sparkles, Sun, Upload, X } from 'lucide-react';
import { useAI } from '../components/contexts/AIContext';
const PDFProcessor = lazy(() => import('../components/PDFProcessor'));

type Note = { id: string | number; title: string; content?: string; tags?: string[]; updated_at?: string; updatedAt?: string; created_at?: string; createdAt?: string };

type HomeProps = { theme: string; toggleTheme: () => void };

export default function Home({ theme, toggleTheme }: HomeProps) {
  const { chatWithAI, isProcessing } = useAI();
  const navigate = useNavigate();
  const [notes] = useState<Note[]>(() => {
    try { return JSON.parse(localStorage.getItem('smartscribe-notes') || '[]'); } catch { return []; }
  });
  const [showPDF, setShowPDF] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [chatError, setChatError] = useState('');
  const recentNotes = useMemo(() => [...notes].sort((a,b) => new Date(b.updated_at || b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updated_at || a.updatedAt || a.createdAt || 0).getTime()).slice(0,3), [notes]);

  const ask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    setAnswer(''); setChatError('');
    try { const result = await chatWithAI(prompt.trim()); if (!result || result.startsWith('Sorry, I could not get a response')) setChatError('SmartScribe AI is unavailable right now. Your notes are still available. Please try again later.'); else setAnswer(result); }
    catch { setChatError('SmartScribe AI is unavailable right now. Your notes are still available. Please try again later.'); }
  };

  return <div className="workspace">
    <aside className="workspace-rail" aria-label="Primary navigation">
      <Link className="brand-lockup" to="/home" aria-label="SmartScribe home"><span className="brand-mark"><FileText size={19}/></span><span>Smart<span className="brand-accent">Scribe</span></span></Link>
      <span className="rail-label">WORKSPACE</span>
      <Link className="rail-link active" to="/home" aria-label="Overview"><span className="rail-icon"><BookOpen size={18}/></span>Overview</Link>
      <Link className="rail-link" to="/notes" aria-label={`My notes, ${notes.length} total`}><span className="rail-icon"><FileText size={18}/></span>My notes<span className="rail-count">{notes.length}</span></Link>
      <Link className="rail-link" to="/record" aria-label="Record"><span className="rail-icon"><Mic size={18}/></span>Record</Link>
      <Link className="rail-link" to="/quiz" aria-label="Study quiz"><span className="rail-icon"><Brain size={18}/></span>Study quiz</Link>
      <Link className="rail-link" to="/smart-chat" aria-label="Smart chat"><span className="rail-icon"><Sparkles size={18}/></span>Smart chat</Link>
      <div className="rail-bottom"><div className="rail-tip"><span className="tip-icon"><Sparkles size={16}/></span><strong>A little more clarity</strong><p>Turn your notes into a study plan with Smart Chat.</p><Link to="/smart-chat">Open Smart Chat <ArrowRight size={14}/></Link></div><Link className="rail-user" to="/profile"><span className="avatar">S</span><span><strong>Your workspace</strong><small>Personal account</small></span><ArrowDownRight size={15}/></Link></div>
    </aside>

    <main className="workspace-main">
      <header className="workspace-topbar"><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="topbar-actions"><button className="topbar-theme" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title="Switch theme">{theme === 'light' ? <Moon size={15}/> : <Sun size={15}/>}</button><Link to="/settings" className="topbar-link">Settings</Link><Link to="/profile" className="avatar" aria-label="Your profile">S</Link></div></header>
      <div className="dashboard-content">
        <section className="welcome-row"><div><span className="eyebrow"><span className="status-dot"/> YOUR LEARNING DESK</span><h1>A quieter place to<br/><em>think clearly.</em></h1><p className="welcome-copy">Keep your thoughts, recordings and study notes together. Pick up right where you left off.</p></div><div className="welcome-note" aria-hidden="true"><span className="note-sun"/><span className="note-line line-long"/><span className="note-line"/><span className="note-line line-short"/><span className="note-sign">a thought, kept.</span></div></section>

        <section className="capture-card"><div className="capture-copy"><span className="capture-kicker"><Sparkles size={15}/> A CLEAR START</span><h2>What’s on your mind?</h2><p>Ask a question, untangle a thought, or turn an idea into something useful.</p><form className="capture-form" onSubmit={ask}><label className="sr-only" htmlFor="quick-prompt">Ask SmartScribe</label><input id="quick-prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Try “Help me organize my study notes…”"/><button type="submit" disabled={!prompt.trim() || isProcessing} aria-label="Send prompt">{isProcessing ? <span className="mini-spinner"/> : <ArrowRight size={18}/>}</button></form><div className="capture-links"><button onClick={()=>navigate('/notes/new')}><Plus size={14}/> New note</button><button onClick={()=>setShowPDF(true)}><Upload size={14}/> Summarize a PDF</button><Link to="/smart-chat"><Search size={14}/> Explore with AI</Link></div>{chatError && <p className="inline-error" role="alert">{chatError}</p>}{answer && <div className="quick-answer"><button className="answer-close" onClick={()=>setAnswer('')} aria-label="Dismiss response"><X size={15}/></button><strong>SmartScribe says</strong><p>{answer}</p></div>}</div><div className="capture-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><Sparkles size={23}/></div><span className="orbit-stem"/></div></section>

        <section className="section-heading"><div><span className="eyebrow">YOUR TOOLKIT</span><h2>Make space for good ideas</h2></div><span className="section-note">Small steps, clearer thinking.</span></section>
        <section className="tool-grid" aria-label="SmartScribe tools"><Link to="/notes/new" className="tool-card tool-note"><span className="tool-icon"><FileText size={19}/></span><span className="tool-arrow"><ArrowDownRight size={17}/></span><span className="tool-caption">WRITE &amp; KEEP</span><h3>Notes that<br/>stay yours.</h3><p>Capture a thought or shape it with a little AI help.</p></Link><Link to="/record" className="tool-card tool-record"><span className="tool-icon"><Mic size={19}/></span><span className="tool-arrow"><ArrowDownRight size={17}/></span><span className="tool-caption">SPEAK IT OUT</span><h3>Ideas, while<br/>they’re fresh.</h3><p>Record a voice note and turn it into something useful.</p></Link><Link to="/quiz" className="tool-card tool-study"><span className="tool-icon"><Brain size={19}/></span><span className="tool-arrow"><ArrowDownRight size={17}/></span><span className="tool-caption">LEARN BY DOING</span><h3>Remember<br/>what matters.</h3><p>Make a quick quiz from the topics you’re learning.</p></Link><Link to="/smart-chat" className="tool-card tool-chat"><span className="tool-icon"><Headphones size={19}/></span><span className="tool-arrow"><ArrowDownRight size={17}/></span><span className="tool-caption">THINK TOGETHER</span><h3>A thoughtful<br/>second voice.</h3><p>Talk through a question with your notes beside you.</p></Link></section>

        <section className="recent-section"><div className="section-heading recent-heading"><div><span className="eyebrow">FROM YOUR DESK</span><h2>Recently tended</h2></div><Link to="/notes" className="text-link">All notes <ArrowRight size={15}/></Link></div>{recentNotes.length ? <div className="recent-list">{recentNotes.map(note=><Link className="recent-item" to={`/notes/${note.id}`} key={note.id}><span className="recent-file"><FileText size={18}/></span><span className="recent-text"><strong>{note.title || 'Untitled note'}</strong><small>{(note.content || '').slice(0,100) || 'No preview available'}</small></span><span className="recent-date">{new Date(note.updated_at || note.updatedAt || note.createdAt || Date.now()).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><ArrowRight size={16} className="recent-arrow"/></Link>)}</div> : <div className="recent-empty"><span className="empty-icon"><FileText size={19}/></span><div><strong>Your notes will find a home here.</strong><p>Create your first note to start building your personal study space.</p></div><Link to="/notes/new" className="button-secondary">Create a note <ArrowRight size={15}/></Link></div>}</section>
        <footer className="workspace-footer"><span>SmartScribe <span>·</span> Thoughtfully yours.</span><span>Keep learning at your own pace.</span></footer>
      </div>
    </main>
    {showPDF && <Suspense fallback={<div className="compose-backdrop"><div className="loading-card" role="status"><span className="loading-mark"><span/></span><p>Preparing your document tools…</p></div></div>}><PDFProcessor isOpen={showPDF} onClose={()=>setShowPDF(false)}/></Suspense>}
  </div>;
}
