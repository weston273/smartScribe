import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Settings, List, Grid, ChevronDown, Edit, Trash2, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import Quiz from './Quiz';
import './Notes.css'

export default function Notes({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedNoteForQuiz, setSelectedNoteForQuiz] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      content: 'JavaScript is a high-level programming language that is widely used for web development. Key concepts include variables, functions, objects, and DOM manipulation. Modern JavaScript (ES6+) introduced features like arrow functions, promises, and modules.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'React Components',
      content: 'React components are the building blocks of React applications. They can be functional or class-based. Functional components with hooks are now the preferred approach. Key hooks include useState, useEffect, and useContext.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const navigate = useNavigate();

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const deleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handleQuizFromNote = (note) => {
    setSelectedNoteForQuiz(note);
    setShowQuizModal(true);
  };

  const handleGeneralQuiz = () => {
    navigate('/quiz');
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayNotes = filteredNotes.filter(note => {
    const noteDate = new Date(note.createdAt);
    const today = new Date();
    return noteDate.toDateString() === today.toDateString();
  });

  const weekNotes = filteredNotes.filter(note => {
    const noteDate = new Date(note.createdAt);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return noteDate >= weekAgo && noteDate.toDateString() !== today.toDateString();
  });

  const olderNotes = filteredNotes.filter(note => {
    const noteDate = new Date(note.createdAt);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return noteDate < weekAgo;
  });

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="notes-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="notes-main">
          {/* Header */}
          <div className="notes-header">
            <div className="notes-title-section">
              <h1 className="notes-title">
                Notes <ChevronDown size={24} className="notes-dropdown-icon" />
              </h1>
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                  List View
                </button>
                <button 
                  className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <Grid size={16} />
                  Card View
                </button>
              </div>
            </div>
            <div className="header-actions">
              <button className="menu-btn">
                <MoreVertical size={20} />
              </button>
              <button className="settings-btn">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Notes Content */}
          <div className="notes-content">
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h2>No notes yet</h2>
                <p>Create your first note to get started with SmartScribe</p>
                <Link to="/notes/new" className="create-first-note-btn">
                  <Plus size={20} />
                  Create Your First Note
                </Link>
              </div>
            ) : (
              <div className="notes-sections">
                {/* Today Section */}
                {todayNotes.length > 0 && (
                  <section className="notes-section">
                    <h2 className="section-title">Today</h2>
                    <div className={`notes-grid ${viewMode}`}>
                      {todayNotes.map(note => (
                        <div key={note.id} className={`note-item ${viewMode}`}>
                          <Link to={`/notes/${note.id}`} className="note-link">
                            <div className="note-main">
                              <div className="note-time">
                                {new Date(note.updatedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <h3 className="note-title">{note.title}</h3>
                              <p className="note-preview">
                                {note.content.substring(0, 150)}
                                {note.content.length > 150 ? '...' : ''}
                              </p>
                            </div>
                          </Link>
                          <div className="note-actions">
                            <Link to={`/notes/${note.id}/edit`} className="note-action-btn edit-btn">
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleQuizFromNote(note)} 
                              className="note-action-btn quiz-btn"
                              title="Generate quiz from this note"
                            >
                              <HelpCircle size={16} />
                            </button>
                            <button 
                              onClick={() => deleteNote(note.id)} 
                              className="note-action-btn delete-btn"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Previous 7 Days Section */}
                {weekNotes.length > 0 && (
                  <section className="notes-section">
                    <h2 className="section-title">Previous 7 Days</h2>
                    <div className={`notes-grid ${viewMode}`}>
                      {weekNotes.map(note => (
                        <div key={note.id} className={`note-item ${viewMode}`}>
                          <Link to={`/notes/${note.id}`} className="note-link">
                            <div className="note-main">
                              <div className="note-time">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </div>
                              <h3 className="note-title">{note.title}</h3>
                              <p className="note-preview">
                                {note.content.substring(0, 150)}
                                {note.content.length > 150 ? '...' : ''}
                              </p>
                            </div>
                          </Link>
                          <div className="note-actions">
                            <Link to={`/notes/${note.id}/edit`} className="note-action-btn edit-btn">
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleQuizFromNote(note)} 
                              className="note-action-btn quiz-btn"
                              title="Generate quiz from this note"
                            >
                              <HelpCircle size={16} />
                            </button>
                            <button 
                              onClick={() => deleteNote(note.id)} 
                              className="note-action-btn delete-btn"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Older Notes Section */}
                {olderNotes.length > 0 && (
                  <section className="notes-section">
                    <h2 className="section-title">Older</h2>
                    <div className={`notes-grid ${viewMode}`}>
                      {olderNotes.map(note => (
                        <div key={note.id} className={`note-item ${viewMode}`}>
                          <Link to={`/notes/${note.id}`} className="note-link">
                            <div className="note-main">
                              <div className="note-time">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </div>
                              <h3 className="note-title">{note.title}</h3>
                              <p className="note-preview">
                                {note.content.substring(0, 150)}
                                {note.content.length > 150 ? '...' : ''}
                              </p>
                            </div>
                          </Link>
                          <div className="note-actions">
                            <Link to={`/notes/${note.id}/edit`} className="note-action-btn edit-btn">
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleQuizFromNote(note)} 
                              className="note-action-btn quiz-btn"
                              title="Generate quiz from this note"
                            >
                              <HelpCircle size={16} />
                            </button>
                            <button 
                              onClick={() => deleteNote(note.id)} 
                              className="note-action-btn delete-btn"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Action Sidebar */}
            <div className="action-sidebar">
              <div className="sidebar-item">
                <div className="sidebar-dot"></div>
                <span>AI Summarize</span>
              </div>
              <div className="sidebar-item" onClick={handleGeneralQuiz}>
                <div className="sidebar-dot"></div>
                <span>Generate Quiz</span>
              </div>
              <div className="sidebar-item">
                <div className="sidebar-dot"></div>
                <span>Smart Notes</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Link to="/notes/new" className="fab">
        <Plus size={24} />
      </Link>

      {/* Quiz Modal */}
      {showQuizModal && selectedNoteForQuiz && (
        <div className="quiz-modal-overlay">
          <div className="quiz-modal">
            <h3>Generate Quiz</h3>
            <p>Would you like to generate a quiz from your note "{selectedNoteForQuiz.title}"?</p>
            <div className="quiz-modal-actions">
              <button 
                onClick={() => setShowQuizModal(false)}
                className="modal-btn secondary"
              >
                Cancel
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
                className="modal-btn primary"
              >
                Generate Quiz
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