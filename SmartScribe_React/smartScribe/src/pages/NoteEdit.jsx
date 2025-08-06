import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, TrashIcon, DownloadIcon, CopyIcon } from '../components/icons/Icons.jsx';
import NavBar1 from '../components/NavBar1.jsx';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer.jsx';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import { useLanguage } from '../components/contexts/LanguageContext.jsx';
import { useAI } from '../components/contexts/AIContext.jsx';
import './NoteEdit.css';

export default function NoteEdit({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { t } = useLanguage();
  const { generateNotes } = useAI();

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  useEffect(() => {
    if (isEditing) {
      // Load existing note
      const savedNotes = localStorage.getItem('smartscribe-notes');
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const note = notes.find(n => n.id === parseInt(id));
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags ? note.tags.join(', ') : '');
        } else {
          navigate('/notes');
        }
      } else {
        navigate('/notes');
      }
    }
  }, [id, isEditing, navigate]);

  const handleSave = () => {
    if (!title.trim()) {
      alert(t('noteEdit.titleRequired') || 'Please enter a title for your note.');
      return;
    }

    const savedNotes = localStorage.getItem('smartscribe-notes');
    const notes = savedNotes ? JSON.parse(savedNotes) : [];
    
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      // Update existing note
      const noteIndex = notes.findIndex(n => n.id === parseInt(id));
      if (noteIndex !== -1) {
        notes[noteIndex] = { ...notes[noteIndex], ...noteData };
      }
    } else {
      // Create new note
      const newNote = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...noteData
      };
      notes.unshift(newNote);
    }

    localStorage.setItem('smartscribe-notes', JSON.stringify(notes));
    navigate('/notes');
  };

  const handleDelete = () => {
    if (!isEditing) return;
    
    if (window.confirm(t('noteEdit.deleteConfirm') || 'Are you sure you want to delete this note?')) {
      const savedNotes = localStorage.getItem('smartscribe-notes');
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const updatedNotes = notes.filter(n => n.id !== parseInt(id));
        localStorage.setItem('smartscribe-notes', JSON.stringify(updatedNotes));
      }
      navigate('/notes');
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert(t('noteEdit.promptRequired') || 'Please enter a prompt for AI generation.');
      return;
    }

    setIsAIGenerating(true);
    try {
      const generatedContent = await generateNotes(aiPrompt);
      setContent(prevContent => 
        prevContent ? `${prevContent}\n\n${generatedContent}` : generatedContent
      );
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating content:', error);
      alert(t('noteEdit.aiError') || 'Failed to generate content. Please try again.');
    } finally {
      setIsAIGenerating(false);
    }
  };

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

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="note-edit-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="note-edit-main">
          <div className="note-edit-header">
            <div className="header-left">
              <Link to="/notes" className="btn btn-icon btn-ghost">
                <ArrowLeftIcon size={20} />
              </Link>
              <div className="header-info">
                <h1>
                  {isEditing ? (t('noteEdit.editNote') || 'Edit Note') : (t('noteEdit.createNote') || 'Create Note')}
                </h1>
                <p className="header-subtitle">
                  {isEditing ? (t('noteEdit.editDesc') || 'Update your note') : (t('noteEdit.createDesc') || 'Create a new note with AI assistance')}
                </p>
              </div>
            </div>

            <div className="header-actions">
              <button onClick={handleCopy} className="btn btn-icon btn-ghost" title={t('noteEdit.copy') || 'Copy content'}>
                <CopyIcon size={18} />
              </button>
              <button onClick={handleExport} className="btn btn-icon btn-ghost" title={t('noteEdit.export') || 'Export note'}>
                <DownloadIcon size={18} />
              </button>
              {isEditing && (
                <button onClick={handleDelete} className="btn btn-icon btn-ghost delete-btn" title={t('noteEdit.delete') || 'Delete note'}>
                  <TrashIcon size={18} />
                </button>
              )}
              <button onClick={handleSave} className="btn btn-primary">
                <EditIcon size={18} />
                {t('noteEdit.save') || 'Save'}
              </button>
            </div>
          </div>

          <div className="note-edit-content">
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  {t('noteEdit.title') || 'Title'} <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('noteEdit.titlePlaceholder') || 'Enter note title...'}
                  className="input-field title-input"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  {t('noteEdit.tags') || 'Tags'} <span className="optional">({t('noteEdit.optional') || 'optional'})</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t('noteEdit.tagsPlaceholder') || 'Enter tags separated by commas (e.g., javascript, react, programming)...'}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  {t('noteEdit.content') || 'Content'}
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('noteEdit.contentPlaceholder') || 'Start writing your note here... You can use Markdown formatting.'}
                  className="textarea-field content-textarea"
                  rows={20}
                />
                <div className="content-stats">
                  <span>{content.length} {t('noteEdit.characters') || 'characters'}</span>
                  <span>{content.split(/\s+/).filter(word => word).length} {t('noteEdit.words') || 'words'}</span>
                  <span>{content.split('\n').length} {t('noteEdit.lines') || 'lines'}</span>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="ai-assistant">
                <h3 className="ai-title">
                  🤖 {t('noteEdit.aiAssistant') || 'AI Assistant'}
                </h3>
                <p className="ai-description">
                  {t('noteEdit.aiDescription') || 'Let AI help you generate content for your note. Describe what you want to write about.'}
                </p>
                
                <div className="ai-input-group">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={t('noteEdit.aiPromptPlaceholder') || 'E.g., "Write about React hooks and their benefits"'}
                    className="input-field ai-prompt-input"
                    disabled={isAIGenerating}
                  />
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={isAIGenerating || !aiPrompt.trim()}
                    className="btn btn-primary ai-generate-btn"
                  >
                    {isAIGenerating ? (
                      <>
                        <div className="spinning">🧠</div>
                        {t('noteEdit.generating') || 'Generating...'}
                      </>
                    ) : (
                      <>
                        🧠 {t('noteEdit.generate') || 'Generate'}
                      </>
                    )}
                  </button>
                </div>

                <div className="ai-suggestions">
                  <p className="suggestions-title">{t('noteEdit.suggestions') || 'Quick suggestions:'}</p>
                  <div className="suggestion-chips">
                    {[
                      t('noteEdit.suggest1') || 'Explain JavaScript closures',
                      t('noteEdit.suggest2') || 'React vs Vue comparison',
                      t('noteEdit.suggest3') || 'CSS Grid layout guide',
                      t('noteEdit.suggest4') || 'API design best practices'
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setAiPrompt(suggestion)}
                        className="suggestion-chip"
                        disabled={isAIGenerating}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            {content && (
              <div className="note-preview">
                <h3 className="preview-title">{t('noteEdit.preview') || 'Preview'}</h3>
                <div className="preview-content">
                  {content.split('\n').map((line, index) => {
                    // Simple markdown rendering
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="md-h1">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="md-h2">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="md-h3">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={index} className="md-li">{line.substring(2)}</li>;
                    } else if (line.startsWith('```')) {
                      return <div key={index} className="md-code-block">{line}</div>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else if (line.includes('**')) {
                        const boldRegex = /\*\*(.*?)\*\*/g;
                        let lastIndex = 0;
                        let match;
                        let parts = [];
                        let boldKey = 0;
                        while ((match = boldRegex.exec(line)) !== null) {
                          if (match.index > lastIndex) {
                            parts.push(line.slice(lastIndex, match.index));
                          } 
                          parts.push(<span key={`${index}-b${boldKey++}`} className='md-bold'>{match[1]}</span>);
                          lastIndex = boldRegex.lastIndex;
                        }
                        // Add any remaining text after the last match
                        if (lastIndex < line.length) {
                          parts.push(line.slice(lastIndex));
                        }
                        return <p key={index} className="md-p">{parts}</p>;
                    } else {
                      return <p key={index} className="md-p">{line}</p>;
                    }
                  })}
                </div>
              </div>
            )}
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