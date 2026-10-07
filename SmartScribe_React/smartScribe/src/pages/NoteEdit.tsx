import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, TrashIcon, DownloadIcon, CopyIcon } from '../components/icons/Icons.jsx';
import Footer from '../components/Footer.jsx';
import { useLanguage } from '../components/contexts/LanguageContext.jsx';
import { useAI } from '../components/contexts/AIContext.jsx';
import { supabase } from '../database/supabaseClient.js';
import { useAuth } from '../components/contexts/AuthContext';
import './NoteEdit.css';

export default function NoteEdit({ theme, toggleTheme }) {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiError, setAiError] = useState('');
  const { t } = useLanguage();
  const { generateNotes } = useAI();
  // ✅ Load existing note from Supabase or localStorage
  useEffect(() => {
    const loadNote = async () => {
      if (!isEditing) return;

      if (user) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          console.error('Note not found:', error);
          navigate('/notes');
          return;
        }

        setTitle(data.title);
        setContent(data.content);
        setTags(data.tags?.join(', ') || '');
      } else {
        const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
        const note = savedNotes.find(n => n.id === parseInt(id));
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags?.join(', ') || '');
        } else {
          navigate('/notes');
        }
      }
    };

    loadNote();
  }, [id, isEditing, user, navigate]);

  // ✅ Save note (Supabase for logged-in, localStorage for guests)
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title.');
      return;
    }

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      tags: tagList,
      updated_at: new Date().toISOString(),
    };

    if (user) {
      try {
        if (isEditing) {
          const { error } = await supabase
            .from('notes')
            .update(noteData)
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from('notes').insert({
            ...noteData,
            user_id: user.id,
          }).select().single();
          if (error) throw error;
          const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
          const nextNotes = [data, ...savedNotes.filter(note => String(note.id) !== String(data.id))];
          localStorage.setItem('smartscribe-notes', JSON.stringify(nextNotes));
        }
        navigate('/notes');
      } catch (error) {
        console.error('Error saving note to Supabase:', error);
        alert('Failed to save note. Please try again.');
      }
      return;
    }

    // Fallback to localStorage (guest mode)
    const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
    const now = new Date().toISOString();

    if (isEditing) {
      const updatedNotes = savedNotes.map(n =>
        String(n.id) === String(id)
          ? { ...n, ...noteData, updatedAt: now }
          : n
      );
      localStorage.setItem('smartscribe-notes', JSON.stringify(updatedNotes));
    } else {
      const newNote = {
        id: crypto.randomUUID(),
        ...noteData,
        createdAt: now,
        updatedAt: now,
      };
      localStorage.setItem('smartscribe-notes', JSON.stringify([newNote, ...savedNotes]));
    }

    navigate('/notes');
  };

  // ✅ Delete note
  const handleDelete = async () => {
    if (!window.confirm('Delete this note?')) return;

    if (user) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting note from Supabase:', error);
      }
    }

    const savedNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
    const updatedNotes = savedNotes.filter(n => String(n.id) !== String(id));
    localStorage.setItem('smartscribe-notes', JSON.stringify(updatedNotes));

    navigate('/notes');
  };

  // ✅ AI generation handler
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      setAiError(t('noteEdit.promptRequired') || 'Please enter a prompt for AI generation.');
      return;
    }

    setIsAIGenerating(true);
    setAiError('');
    try {
      const generatedContent = await generateNotes(aiPrompt);
      if (generatedContent.startsWith('Error generating notes')) {
        setAiError('SmartScribe AI is unavailable right now. Your note is unchanged. Please try again later.');
        return;
      }
      setContent(prevContent =>
        prevContent ? `${prevContent}\n\n${generatedContent}` : generatedContent
      );
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating content:', error);
      setAiError('SmartScribe AI is unavailable right now. Your note is unchanged. Please try again later.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // ✅ Export and Copy handlers
  const handleExport = () => {
    const noteContent = `# ${title}\n\n${content}`;
    const blob = new Blob([noteContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const noteContent = `${title}\n\n${content}`;
    navigator.clipboard.writeText(noteContent);
  };

  // ✅ UI Layout
  return (
    <div className="page-wrapper">
<div className="note-edit-body">
<main className="note-edit-main">
          <div className="note-edit-header">
            <div className="header-left">
              <Link to="/notes" className="btn btn-icon btn-ghost">
                <ArrowLeftIcon size={20} />
              </Link>
              <div className="header-info">
                <h1>{isEditing ? 'Edit Note' : 'Create Note'}</h1>
                <p className="header-subtitle">
                  {isEditing ? 'Update your note' : 'Create a new note with AI assistance'}
                </p>
              </div>
            </div>

            <div className="header-actions">
              <button onClick={handleCopy} className="btn btn-icon btn-ghost" title="Copy content">
                <CopyIcon size={18} />
              </button>
              <button onClick={handleExport} className="btn btn-icon btn-ghost" title="Export note">
                <DownloadIcon size={18} />
              </button>
              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="btn btn-icon btn-ghost delete-btn"
                  title="Delete note"
                >
                  <TrashIcon size={18} />
                </button>
              )}
              <button onClick={handleSave} className="btn btn-primary">
                <EditIcon size={18} />
                Save
              </button>
            </div>
          </div>

          <div className="note-edit-content">
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="input-field title-input"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Tags <span className="optional">(optional)</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="Enter tags separated by commas..."
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Start writing your note here..."
                  className="textarea-field content-textarea"
                  rows={20}
                />
                <div className="content-stats">
                  <span>{content.length} characters</span>
                  <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{content.split('\n').length} lines</span>
                </div>
              </div>

              {/* ✅ AI Assistant Section */}
              <div className="ai-assistant">
                <h3 className="ai-title"><Bot size={17}/> AI Assistant</h3>
                <p className="ai-description">
                  Let AI help you generate content for your note. Describe what you want to write about.
                </p>
                <div className="ai-input-group">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder='E.g., "Write about React hooks and their benefits"'
                    className="input-field ai-prompt-input"
                    disabled={isAIGenerating}
                  />
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={isAIGenerating || !aiPrompt.trim()}
                    className="btn btn-primary ai-generate-btn"
                  >
                    {isAIGenerating ? '🧠 Generating...' : '🧠 Generate'}
                  </button>
                </div>
                {aiError && <p className="auth-message auth-error" role="alert">{aiError}</p>}
              </div>
            </div>

            {/* ✅ Markdown Preview */}
            {content && (
              <div className="note-preview">
                <h3 className="preview-title">Preview</h3>
                <div className="preview-content">
                  {content.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) return <h1 key={index}>{line.substring(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={index}>{line.substring(3)}</h2>;
                    if (line.startsWith('- ') || line.startsWith('* '))
                      return <li key={index}>{line.substring(2)}</li>;
                    if (line.trim() === '') return <br key={index} />;
                    return <p key={index}>{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
<Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
