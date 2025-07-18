import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText, HelpCircle, Mic, User, X } from 'lucide-react';
import './SideBar.css';

export default function SideBar({ onClose }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">SmartScribe</h2>
        <button className="sidebar-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/home" className="nav-item">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/notes" className="nav-item">
          <FileText size={20} />
          <span>Notes</span>
        </Link>
        <Link to="/quiz" className="nav-item">
          <HelpCircle size={20} />
          <span>Quiz</span>
        </Link>
        <Link to="/record" className="nav-item">
          <Mic size={20} />
          <span>Record</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}