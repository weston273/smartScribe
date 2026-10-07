import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Brain, FileText, Menu, Mic, Moon, Settings, Sparkles, Sun, UserRound, X } from 'lucide-react';
import AccountDropDown from './account/AccountDropDown.jsx';
import ToolsMenu from './sidebar/ToolsMenu.jsx';

type AppShellProps = { children: ReactNode; theme: string; toggleTheme: () => void };

const destinations = [
  { to: '/home', label: 'Home', icon: BookOpen, match: (path: string) => path === '/home' || path === '/' },
  { to: '/notes', label: 'Notes', icon: FileText, match: (path: string) => path.startsWith('/notes') },
  { to: '/record', label: 'Record', icon: Mic, match: (path: string) => path === '/record' },
  { to: '/smart-chat', label: 'Chat', icon: Sparkles, match: (path: string) => path === '/smart-chat' },
  { to: '/quiz', label: 'Quizzes', icon: Brain, match: (path: string) => path === '/quiz' },
];

const pageTitles: Record<string, string> = {
  '/home': 'Home', '/notes': 'Notes', '/record': 'Recording', '/smart-chat': 'Chat',
  '/quiz': 'Quizzes', '/settings': 'Settings', '/profile': 'Profile',
};

export default function AppShell({ children, theme, toggleTheme }: AppShellProps) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const title = pathname.startsWith('/notes/') ? (pathname.endsWith('/edit') || pathname.endsWith('/new') ? 'Note editor' : 'Note reader') : pageTitles[pathname] || 'Home';
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!menuOpen) return;
    railRef.current?.querySelector<HTMLElement>('.rail-primary .rail-link')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = railRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return <div className="workspace app-shell">
    <aside ref={railRef} className={`workspace-rail${menuOpen ? ' menu-open' : ''}`} aria-modal={menuOpen || undefined} role={menuOpen ? 'dialog' : undefined} aria-label={menuOpen ? 'More navigation and tools' : 'Primary navigation'}>
      <Link className="brand-lockup" to="/home" aria-label="SmartScribe home" onClick={() => setMenuOpen(false)}><span className="brand-mark"><FileText size={19}/></span><span>Smart<span className="brand-accent">Scribe</span></span></Link>
      <span className="rail-label">PRIMARY</span>
      <nav className="rail-primary" aria-label="Workspace">
        {destinations.map(({ to, label, icon: Icon, match }) => <NavLink key={to} to={to} end={to === '/home'} className={({ isActive }) => `rail-link${(isActive || match(pathname)) ? ' active' : ''}`} onClick={() => setMenuOpen(false)}><span className="rail-icon"><Icon size={19}/></span><span className="rail-link-label">{label}</span></NavLink>)}
      </nav>
      <ToolsMenu onClose={() => setMenuOpen(false)} />
      <div className="rail-bottom">
        <NavLink to="/settings" className={({ isActive }) => `rail-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}><span className="rail-icon"><Settings size={19}/></span><span className="rail-link-label">Settings</span></NavLink>
        <NavLink to="/profile" className={({ isActive }) => `rail-user${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}><span className="avatar"><UserRound size={17}/></span><span><strong>Profile</strong><small>Your account</small></span></NavLink>
      </div>
    </aside>
    {menuOpen && <button className="shell-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}/>}
    <div className="workspace-main">
      <header className="workspace-topbar">
        <div className="shell-heading"><button ref={menuButtonRef} className="shell-menu" type="button" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation and more tools'} aria-expanded={menuOpen}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}<span className="shell-menu-label">More</span></button><div className="breadcrumb"><span className="breadcrumb-context">Workspace / </span>{title}</div></div>
        <div className="topbar-actions"><button type="button" className="topbar-theme" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`} title="Switch theme">{isDark ? <Sun size={17}/> : <Moon size={17}/>}</button><button type="button" className="topbar-profile" aria-label="Open account menu" aria-expanded={accountOpen} onClick={() => setAccountOpen(open => !open)}><UserRound size={18}/></button></div>
      </header>
      <div className="shell-content">{children}</div>
    </div>
    {accountOpen && <AccountDropDown onClose={() => setAccountOpen(false)}/>}
  </div>;
}
