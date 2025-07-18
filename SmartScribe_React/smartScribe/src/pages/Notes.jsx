import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Settings, List, Grid, ChevronDown } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import './Notes.css'

export default function Notes({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Title of Notes',
      content: 'First paragraph of notes',
      timestamp: '2:56 PM',
      date: 'today',
      hasImage: true
    },
    {
      id: 2,
      title: 'Meeting Notes',
      content: 'Discussion about project timeline and deliverables',
      timestamp: '1:30 PM',
      date: 'today',
      hasImage: false
    },
    {
      id: 3,
      title: 'Research Ideas',
      content: 'Key findings from market research and competitor analysis',
      timestamp: '11:45 AM',
      date: 'today',
      hasImage: true
    },
    {
      id: 4,
      title: 'Weekly Review',
      content: 'Summary of completed tasks and upcoming priorities',
      timestamp: '4:20 PM',
      date: 'week',
      hasImage: true
    }
  ]);
  const [isEditing, setIsEditing] = useState(null);
  const [editContent, setEditContent] = useState({ title: '', content: '' });

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: 'Start typing your note here...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'today',
      hasImage: false
    };
    setNotes([newNote, ...notes]);
    setIsEditing(newNote.id);
    setEditContent({ title: newNote.title, content: newNote.content });
  };

  const handleNoteClick = (note) => {
    setIsEditing(note.id);
    setEditContent({ title: note.title, content: note.content });
  };

  const handleSaveNote = () => {
    setNotes(notes.map(note => 
      note.id === isEditing 
        ? { ...note, title: editContent.title, content: editContent.content }
        : note
    ));
    setIsEditing(null);
    setEditContent({ title: '', content: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditContent({ title: '', content: '' });
  };

  const todayNotes = notes.filter(note => note.date === 'today');
  const weekNotes = notes.filter(note => note.date === 'week');

  const filteredTodayNotes = todayNotes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWeekNotes = weekNotes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  List Views
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Notes Content */}
          <div className="notes-content">
            <div className="notes-sections">
              {/* Today Section */}
              {filteredTodayNotes.length > 0 && (
                <section className="notes-section">
                  <h2 className="section-title">Today</h2>
                  <div className={`notes-grid ${viewMode}`}>
                    {filteredTodayNotes.map(note => (
                      <div
                        key={note.id}
                        className={`note-item ${viewMode} ${isEditing === note.id ? 'editing' : ''}`}
                        onClick={() => !isEditing && handleNoteClick(note)}
                      >
                        {isEditing === note.id ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              value={editContent.title}
                              onChange={(e) => setEditContent({...editContent, title: e.target.value})}
                              className="edit-title"
                            />
                            <textarea
                              value={editContent.content}
                              onChange={(e) => setEditContent({...editContent, content: e.target.value})}
                              className="edit-content"
                              rows="4"
                            />
                            <div className="edit-actions">
                              <button onClick={handleSaveNote} className="save-btn">Save</button>
                              <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="note-main">
                              <div className="note-time">{note.timestamp}</div>
                              <h3 className="note-title">{note.title}</h3>
                              <p className="note-preview">{note.content}</p>
                            </div>
                            {note.hasImage && (
                              <div className="note-image">
                                <div className="image-placeholder">IMAGE</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Previous 7 Days Section */}
              {filteredWeekNotes.length > 0 && (
                <section className="notes-section">
                  <h2 className="section-title">Previous 7 Days</h2>
                  <div className={`notes-grid ${viewMode}`}>
                    {filteredWeekNotes.map(note => (
                      <div
                        key={note.id}
                        className={`note-item ${viewMode} ${isEditing === note.id ? 'editing' : ''}`}
                        onClick={() => !isEditing && handleNoteClick(note)}
                      >
                        {isEditing === note.id ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              value={editContent.title}
                              onChange={(e) => setEditContent({...editContent, title: e.target.value})}
                              className="edit-title"
                            />
                            <textarea
                              value={editContent.content}
                              onChange={(e) => setEditContent({...editContent, content: e.target.value})}
                              className="edit-content"
                              rows="4"
                            />
                            <div className="edit-actions">
                              <button onClick={handleSaveNote} className="save-btn">Save</button>
                              <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="note-main">
                              <div className="note-time">{note.timestamp}</div>
                              <h3 className="note-title">{note.title}</h3>
                              <p className="note-preview">{note.content}</p>
                            </div>
                            {note.hasImage && (
                              <div className="note-image">
                                <div className="image-placeholder">IMAGE</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="action-sidebar">
              <div className="sidebar-item">
                <div className="sidebar-dot"></div>
                <span>Create Notes</span>
              </div>
              <div className="sidebar-item">
                <div className="sidebar-dot"></div>
                <span>Summarise</span>
              </div>
              <div className="sidebar-item">
                <div className="sidebar-dot"></div>
                <span>Create info a quiz</span>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            <button className="nav-item active">
              <div className="nav-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span>Notes</span>
            </button>
            <button className="nav-item">
              <div className="nav-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span>Quiz</span>
            </button>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={handleCreateNote}>
        <Plus size={24} />
      </button>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}