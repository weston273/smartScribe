import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Share, MoreVertical, Copy, Download, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';
import './NoteView.css';

function renderInlineMarkdown(text, keyPrefix) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith('**') || token.startsWith('__')) {
      parts.push(<strong key={`${keyPrefix}-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      parts.push(<em key={`${keyPrefix}-${key++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      parts.push(<code key={`${keyPrefix}-${key++}`}>{token.slice(1, -1)}</code>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const safeHref = link?.[2].trim();
      if (link && /^(https?:|mailto:|\/|#)/i.test(safeHref)) {
        parts.push(<a key={`${keyPrefix}-${key++}`} href={safeHref} target={safeHref.startsWith('http') ? '_blank' : undefined} rel={safeHref.startsWith('http') ? 'noreferrer' : undefined}>{link[1]}</a>);
      } else {
        parts.push(token);
      }
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderNoteContent(content = '') {
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const fence = /^\s*```(.*)$/.exec(line);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={`code-${index}`} className="md-code-block"><code>{code.join('\n')}</code></pre>);
      continue;
    }
    if (!line.trim()) { index += 1; continue; }

    const heading = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const headingContent = renderInlineMarkdown(heading[2], `h-${index}`);
      if (level === 1) blocks.push(<h1 key={`heading-${index}`} className="md-h1">{headingContent}</h1>);
      else if (level === 2) blocks.push(<h2 key={`heading-${index}`} className="md-h2">{headingContent}</h2>);
      else blocks.push(<h3 key={`heading-${index}`} className="md-h3">{headingContent}</h3>);
      index += 1;
      continue;
    }

    const listMatch = /^\s*((?:[-*+])|(?:\d+[.)]))\s+(.+)$/.exec(line);
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const items = [];
      while (index < lines.length) {
        const item = /^\s*((?:[-*+])|(?:\d+[.)]))\s+(.+)$/.exec(lines[index]);
        if (!item || /^\d/.test(item[1]) !== ordered) break;
        items.push(<li key={`item-${index}`} className="md-li">{renderInlineMarkdown(item[2], `li-${index}`)}</li>);
        index += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List key={`list-${index}`}>{items}</List>);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s+/.test(lines[index]) && !/^\s*((?:[-*+])|(?:\d+[.)]))\s+/.test(lines[index]) && !/^\s*```/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="md-p">{renderInlineMarkdown(paragraph.join(' '), `p-${index}`)}</p>);
  }
  return blocks;
}

export default function NoteView({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showActions, setShowActions] = useState(false);
  const [note, setNote] = useState(null);
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
<div className="note-view-body">
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
<Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
