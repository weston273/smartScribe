import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Share, MoreVertical, Copy, Download, HelpCircle } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import './NoteView.css';

// === Markdown-style renderer (uses your md-* classNames) ===
function renderNoteContent(content) {
  let inCodeBlock = false;
  return content.split('\n').map((line, index) => {
    // Code blocks (```
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      // Open or close block
      if (inCodeBlock) {
        return <div key={index} className="md-code-block"> {/* opening tag only, code lines follow */} </div>;
      } else {
        // closing tag; nothing to return (code lines in-between handled below)
        return null;
      }
    }
    if (inCodeBlock) {
      // Inside code block - show as pre/code inside md-code-block
      return <pre key={index} className="md-code-block" style={{margin:0, background: 'none', padding: 0}}><code>{line}</code></pre>;
    }

    // Markdown headers
    if (line.startsWith('### ')) {
      return <h3 key={index} className="md-h3">{line.substring(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="md-h2">{line.substring(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="md-h1">{line.substring(2)}</h1>;
    }
    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={index} className="md-li">{line.substring(2)}</li>;
    }
    // Multiple bold segments per paragraph ( **like this** and **that** )
    if (line.includes('**')) {
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;
      let parts = [];
      let boldKey = 0;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        // matched phrase is match[1]
        parts.push(<span key={`${index}-b${boldKey++}`} className="md-bold">{match[1]}</span>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }
      return <p key={index} className="md-p">{parts}</p>;
    }
    if (line.trim() === '') {
      return <br key={index} />;
    }
    // Plain paragraph
    return <p key={index} className="md-p">{line}</p>;
  });
}

export default function NoteView({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [note, setNote] = useState(null);

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  useEffect(() => {
    // Read notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
    const foundNote = savedNotes.find(n => String(n.id) === String(id));
    setNote(foundNote);
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // In real app, call API to delete
      const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
      const filteredNotes = savedNotes.filter(n => String(n.id) !== String(id));
      localStorage.setItem('smartscribe-notes', JSON.stringify(filteredNotes));
      navigate('/notes');
    }
  };

  const handleCopy = () => {
    if (note && note.content)
      navigator.clipboard.writeText(note.content);
  };

  const handleDownload = () => {
    if (note && note.content) {
      const blob = new Blob([note.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateQuiz = () => {
    navigate('/quiz', { 
      state: { 
        fromNotes: true, 
        noteContent: note.content,
        noteTitle: note.title
      }
    });
  };

  if (!note) {
    return (
      <div className="page-wrapper">
        <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
        <div className="note-view-body">
          <main className="note-view-main">
            <div className="note-not-found">
              <h1>Note not found</h1>
              <Link to="/notes" className="back-link">
                <ArrowLeft size={20} />
                Back to Notes
              </Link>
            </div>
          </main>
        </div>
        <Footer theme={theme} toggleTheme={toggleTheme} />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="note-view-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="note-view-main">
          <div className="note-view-header">
            <div className="header-left">
              <Link to="/notes" className="back-btn">
                <ArrowLeft size={20} />
              </Link>
              <div className="note-meta">
                <h1 className="note-title">{note.title}</h1>
                <div className="note-timestamps">
                  <span>Created: {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</span>
                  <span>Modified: {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button onClick={handleGenerateQuiz} className="action-btn quiz-btn" title="Generate quiz from this note">
                <HelpCircle size={18} />
              </button>
              <Link to={`/notes/${id}/edit`} className="action-btn edit-btn">
                <Edit size={18} />
              </Link>
              <button onClick={handleCopy} className="action-btn copy-btn" title="Copy content">
                <Copy size={18} />
              </button>
              <button onClick={handleDownload} className="action-btn download-btn" title="Download note">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>

              <div className="actions-dropdown">
                <button 
                  onClick={() => setShowActions(!showActions)}
                  className="action-btn more-btn"
                >
                  <MoreVertical size={18} />
                </button>
                {showActions && (
                  <div className="dropdown-menu">
                    <button onClick={() => {}} className="dropdown-item">
                      <Share size={16} />
                      Share
                    </button>
                    <button onClick={handleDelete} className="dropdown-item delete-item">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="note-content">
            <div className="content-display">
              {renderNoteContent(note.content)}
            </div>
          </div>

          <div className="note-footer">
            <div className="note-stats">
              <span>{note.content.length} characters</span>
              <span>{note.content.split(' ').filter(Boolean).length} words</span>
              <span>{note.content.split('\n').length} lines</span>
            </div>
          </div>
        </main>
      </div>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}