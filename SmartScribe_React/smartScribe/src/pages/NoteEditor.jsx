import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, Bot, FileText, HelpCircle, Loader } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown';
import { useAI } from '../components/contexts/AIContext';

import './NoteEditor.css';

export default function NoteEditor({ theme, toggleTheme }) {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showAIOptions, setShowAIOptions] = useState(false);

  const { generateSummary, generateNotes, generateQuiz, isProcessing } = useAI();

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  useEffect(() => {
    if (isEditing) {
      // Load existing note
      const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
      const note = savedNotes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      } else {
        navigate('/notes');
      }
    }
  }, [id, isEditing, navigate]);

  const saveNote = async () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);

    try {
      const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
      const now = new Date().toISOString();

      if (isEditing) {
        // Update existing note
        const noteIndex = savedNotes.findIndex(n => n.id === id);
        if (noteIndex !== -1) {
          savedNotes[noteIndex] = {
            ...savedNotes[noteIndex],
            title: title || 'Untitled Note',
            content,
            updatedAt: now
          };
        }
      } else {
        // Create new note
        const newNote = {
          id: Date.now().toString(),
          title: title || 'Untitled Note',
          content,
          createdAt: now,
          updatedAt: now
        };
        savedNotes.unshift(newNote);
      }

      localStorage.setItem('smartscribe-notes', JSON.stringify(savedNotes));
      setLastSaved(new Date());

      if (!isEditing) {
        navigate('/notes');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
    const updatedNotes = savedNotes.filter(n => n.id !== id);
    localStorage.setItem('smartscribe-notes', JSON.stringify(updatedNotes));
    navigate('/notes');
  };

  const handleAISummary = async () => {
    if (!content.trim()) {
      alert('Please add some content to summarize');
      return;
    }

    try {
      const summary = await generateSummary(content);
      setContent(prev => prev + '\n\n## AI Summary\n\n' + summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleAINotes = async () => {
    if (!content.trim()) {
      alert('Please add some content to generate notes from');
      return;
    }

    try {
      const notes = await generateNotes(content);
      setContent(prev => prev + '\n\n## AI Generated Notes\n\n' + notes);
    } catch (error) {
      console.error('Error generating notes:', error);
    }
  };

  const handleAIQuiz = async () => {
    if (!content.trim()) {
      alert('Please add some content to generate a quiz from');
      return;
    }

    try {
      const quiz = await generateQuiz(content);
      let quizText = '\n\n## AI Generated Quiz\n\n';
      quiz.forEach((q, index) => {
        quizText += `**${index + 1}. ${q.question}**\n\n`;
        q.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const isCorrect = optIndex === q.correct;
          quizText += `${letter}. ${option}${isCorrect ? ' ✓' : ''}\n`;
        });
        quizText += `\n*Explanation: ${q.explanation || 'No explanation provided'}*\n\n`;
      });
      setContent(prev => prev + quizText);
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if ((title.trim() || content.trim()) && !isSaving) {
        saveNote();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [title, content, isSaving]);

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="note-editor-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}

        <main className="note-editor-main">
          <div className="editor-header">
            <div className="header-left">
              <Link to="/notes" className="back-btn">
                <ArrowLeft size={20} />
                Back to Notes
              </Link>
              <div className="save-status">
                {isSaving && (
                  <span className="saving">
                    <Loader size={16} className="spinning" />
                    Saving...
                  </span>
                )}
                {lastSaved && !isSaving && (
                  <span className="saved">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div className="header-actions">
              <button
                className="ai-btn"
                onClick={() => setShowAIOptions(!showAIOptions)}
                disabled={isProcessing}
              >
                <Bot size={20} />
                AI Tools
              </button>

              <button className="save-btn" onClick={saveNote} disabled={isSaving}>
                <Save size={20} />
                Save
              </button>

              {isEditing && (
                <button className="delete-btn" onClick={deleteNote}>
                  <Trash2 size={20} />
                  Delete
                </button>
              )}
            </div>
          </div>

          {showAIOptions && (
            <div className="ai-options">
              <button
                className="ai-option-btn"
                onClick={handleAISummary}
                disabled={isProcessing}
              >
                <FileText size={18} />
                Generate Summary
              </button>
              <button
                className="ai-option-btn"
                onClick={handleAINotes}
                disabled={isProcessing}
              >
                <Bot size={18} />
                Smart Notes
              </button>
              <button
                className="ai-option-btn"
                onClick={handleAIQuiz}
                disabled={isProcessing}
              >
                <HelpCircle size={18} />
                Generate Quiz
              </button>
            </div>
          )}

          <div className="editor-content">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="title-input"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note here..."
              className="content-textarea"
            />
          </div>

          <div className="editor-footer">
            <div className="word-count">
              {content.length} characters, {content.split(/\s+/).filter(word => word.length > 0).length} words
            </div>
            <div className="editor-tips">
              <span>💡 Tip: Use AI tools to enhance your notes with summaries and quizzes</span>
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