import { Link } from 'react-router-dom';
import { FileText, Menu, UserRound } from 'lucide-react';
import './NavBar1.css';

type NavBarProps = { theme?: string; onSideBarToggle: () => void; onProfileClick: () => void };

export default function NavBar1({ onSideBarToggle, onProfileClick }: NavBarProps) {
  return <header className="navbar"><div className="navbar-content"><div className="navbar-left">
    <button type="button" onClick={onSideBarToggle} className="navbar-menu-btn" aria-label="Open navigation" title="Open navigation"><Menu size={19}/></button>
    <Link to="/home" className="navbar-brand"><span className="navbar-brand-mark"><FileText size={17}/></span><span className="brand-text">Smart<span>Scribe</span></span></Link>
  </div><div className="navbar-right"><button type="button" onClick={onProfileClick} className="navbar-profile-btn" aria-label="Open account menu" title="Account"><UserRound size={18}/></button></div></div></header>;
}
