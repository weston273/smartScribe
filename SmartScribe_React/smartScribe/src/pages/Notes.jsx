import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, SettingsIcon, MenuIcon, EditIcon, TrashIcon, QuestionIcon, NotesIcon } from '../components/icons/Icons';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import { useLanguage } from '../components/contexts/LanguageContext';
import './Notes.css';

export default function Notes({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedNoteForQuiz, setSelectedNoteForQuiz] = useState(null);
  const [viewMode, setViewMode] = useState(() => 
    localStorage.getItem('notesViewMode') || 'list'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('smartscribe-notes');
    if (savedNotes) {
      return JSON.parse(savedNotes);
    }
    return [
      {
        id: 1,
        title: 'JavaScript Fundamentals',
        content: `# JavaScript Fundamentals

## Introduction
JavaScript is a high-level, interpreted programming language that is widely used for web development. It was initially created to make web pages interactive, but it has evolved to become a versatile language used for both frontend and backend development.

## Key Concepts

### Variables
JavaScript supports different types of variables:
- **let**: Block-scoped variable declaration
- **const**: Block-scoped constant declaration
- **var**: Function-scoped variable declaration (legacy)

### Functions
Functions are first-class citizens in JavaScript:
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

const greetArrow = (name) => \`Hello, \${name}!\`;
\`\`\`

### Objects and Arrays
JavaScript objects and arrays are fundamental data structures:
- Objects store key-value pairs
- Arrays store ordered lists of values
- Both are reference types

## Modern JavaScript (ES6+)
Modern JavaScript introduced many powerful features:
- Arrow functions
- Template literals
- Destructuring
- Promises and async/await
- Modules (import/export)
- Classes

## Best Practices
1. Use meaningful variable names
2. Write modular, reusable code
3. Handle errors appropriately
4. Follow consistent coding style
5. Use modern JavaScript features when appropriate`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['javascript', 'programming', 'web-development']
      },
      {
        id: 2,
        title: 'React Components',
        content: `# React Components

## Overview
React components are the building blocks of React applications. They encapsulate the logic and UI of a part of your application into reusable pieces.

## Types of Components

### Functional Components
Modern React development primarily uses functional components with hooks:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Key Hooks

### useState
Manages component state:
\`\`\`jsx
const [state, setState] = useState(initialValue);
\`\`\`

### useEffect
Handles side effects:
\`\`\`jsx
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup logic
  };
}, [dependencies]);
\`\`\`

## Component Best Practices
1. Keep components small and focused
2. Use descriptive names
3. Extract reusable logic into custom hooks
4. Handle loading and error states
5. Optimize with React.memo when needed`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ['react', 'javascript', 'frontend']
      }
    ];
  });

  const navigate = useNavigate();
  const { t } = useLanguage();

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('smartscribe-notes', JSON.stringify(notes));
  }, [notes]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('notesViewMode', viewMode);
  }, [viewMode]);

  const deleteNote = (noteId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm(t('notes.deleteConfirm') || 'Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handleQuizFromNote = (note, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedNoteForQuiz(note);
    setShowQuizModal(true);
  };

  const handleGeneralQuiz = () => {
    navigate('/quiz');
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupNotesByDate = (notes) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    notes.forEach(note => {
      const noteDate = new Date(note.createdAt);
      
      if (noteDate.toDateString() === today.toDateString()) {
        groups.today.push(note);
      } else if (noteDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(note);
      } else if (noteDate >= weekAgo) {
        groups.thisWeek.push(note);
      } else {
        groups.older.push(note);
      }
    });

    return groups;
  };

  const noteGroups = groupNotesByDate(filteredNotes);

  const renderNoteCard = (note) => (
    <div key={note.id} className={`note-card ${viewMode}`}>
      <Link to={`/notes/${note.id}`} className="note-link">
        <div className="note-content">
          <div className="note-header">
            <h3 className="note-title">{note.title}</h3>
            <div className="note-meta">
              <span className="note-date">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              <span className="note-time">
                {new Date(note.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          
          <p className="note-preview">
            {note.content.substring(0, viewMode === 'grid' ? 120 : 200)}
            {note.content.length > (viewMode === 'grid' ? 120 : 200) ? '...' : ''}
          </p>
          
          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.slice(0, 3).map(tag => (
                <span key={tag} className="note-tag">#{tag}</span>
              ))}
              {note.tags.length > 3 && (
                <span className="note-tag more">+{note.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Link>
      
      <div className="note-actions">
        <Link 
          to={`/notes/${note.id}/edit`} 
          className="btn btn-icon btn-ghost btn-sm"
          title={t('notes.edit') || 'Edit note'}
          onClick={(e) => e.stopPropagation()}
        >
          <EditIcon size={16} />
        </Link>
        <button 
          onClick={(e) => handleQuizFromNote(note, e)} 
          className="btn btn-icon btn-ghost btn-sm"
          title={t('notes.generateQuiz') || 'Generate quiz from this note'}
        >
          <QuestionIcon size={16} />
        </button>
        <button 
          onClick={(e) => deleteNote(note.id, e)} 
          className="btn btn-icon btn-ghost btn-sm delete-btn"
          title={t('notes.delete') || 'Delete note'}
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );

  const renderNoteGroup = (title, notes) => {
    if (notes.length === 0) return null;
    
    return (
      <section className="notes-section" key={title}>
        <h2 className="section-title">{title}</h2>
        <div className={`notes-grid ${viewMode}`}>
          {notes.map(renderNoteCard)}
        </div>
      </section>
    );
  };

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="notes-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="notes-main">
          {/* Header */}
          <div className="notes-header">
            <div className="notes-title-section">
              <div className="notes-title-group">
                <NotesIcon size={32} className="notes-icon" />
                <h1 className="notes-title">{t('notes.title') || 'Notes'}</h1>
                <span className="notes-count">({filteredNotes.length})</span>
              </div>
              
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title={t('notes.listView') || 'List View'}
                >
                  <MenuIcon size={16} />
                  <span className="view-label">{t('notes.list') || 'List'}</span>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title={t('notes.gridView') || 'Grid View'}
                >
                  <div className="grid-icon">
                    <div></div><div></div><div></div><div></div>
                  </div>
                  <span className="view-label">{t('notes.grid') || 'Grid'}</span>
                </button>
              </div>
            </div>
            
            <div className="header-actions">
              <Link to="/settings" className="btn btn-icon btn-ghost" title={t('notes.settings') || 'Settings'}>
                <SettingsIcon size={20} />
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-wrapper">
              <SearchIcon size={20} className="search-icon" />
              <input
                type="text"
                placeholder={t('notes.searchPlaceholder') || 'Search notes by title, content, or tags...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="btn btn-icon btn-ghost btn-sm clear-search"
                  title={t('notes.clearSearch') || 'Clear search'}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Notes Content */}
          <div className="notes-content">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <SearchIcon size={64} className="empty-icon" />
                    <h2>{t('notes.noSearchResults') || 'No notes found'}</h2>
                    <p>{t('notes.noSearchResultsDesc') || 'Try adjusting your search terms or create a new note.'}</p>
                    <Link to="/notes/new" className="btn btn-primary">
                      <PlusIcon size={20} />
                      {t('notes.createNote') || 'Create Note'}
                    </Link>
                  </>
                ) : (
                  <>
                    <NotesIcon size={64} className="empty-icon" />
                    <h2>{t('notes.noNotes') || 'No notes yet'}</h2>
                    <p>{t('notes.noNotesDesc') || 'Create your first note to get started with SmartScribe'}</p>
                    <Link to="/notes/new" className="btn btn-primary btn-lg">
                      <PlusIcon size={20} />
                      {t('notes.createFirstNote') || 'Create Your First Note'}
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="notes-sections">
                {renderNoteGroup(t('notes.today') || 'Today', noteGroups.today)}
                {renderNoteGroup(t('notes.yesterday') || 'Yesterday', noteGroups.yesterday)}
                {renderNoteGroup(t('notes.thisWeek') || 'This Week', noteGroups.thisWeek)}
                {renderNoteGroup(t('notes.older') || 'Older', noteGroups.older)}
              </div>
            )}

            {/* Quick Actions Sidebar */}
            {/* <div className="quick-actions">
              <h3 className="quick-actions-title">{t('notes.quickActions') || 'Quick Actions'}</h3> */}
              {/* <div className="action-items">
                <button className="action-item" onClick={handleGeneralQuiz}>
                  <QuestionIcon size={20} />
                  <span>{t('notes.generateQuiz') || 'Generate Quiz'}</span>
                </button>
                <Link to="/smart-chat" className="action-item">
                  <div className="chat-icon-simple"></div>
                  <span>{t('notes.askAI') || 'Ask AI'}</span>
                </Link>
                <Link to="/record" className="action-item">
                   <MicIcon size={20} /> 
                  <span>{t('notes.voiceNote') || 'Voice Note'}</span>
                </Link>
              </div> */}
            {/* </div> */}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Link to="/notes/new" className="fab" title={t('notes.createNote') || 'Create Note'}>
        <PlusIcon size={24} />
      </Link>

      {/* Quiz Modal */}
      {showQuizModal && selectedNoteForQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('notes.generateQuiz') || 'Generate Quiz'}</h3>
              <button 
                onClick={() => setShowQuizModal(false)}
                className="btn btn-icon btn-ghost"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                {t('notes.generateQuizDesc') || 'Would you like to generate a quiz from your note'} 
                "<strong>{selectedNoteForQuiz.title}</strong>"?
              </p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowQuizModal(false)}
                className="btn btn-ghost"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button 
                onClick={() => {
                  setShowQuizModal(false);
                  navigate('/quiz', { 
                    state: { 
                      fromNotes: true, 
                      noteContent: selectedNoteForQuiz.content,
                      noteTitle: selectedNoteForQuiz.title
                    }
                  });
                }}
                className="btn btn-primary"
              >
                <QuestionIcon size={16} />
                {t('notes.generateQuiz') || 'Generate Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}