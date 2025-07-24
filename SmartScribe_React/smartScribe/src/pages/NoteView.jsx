import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Share, MoreVertical, Copy, Download, HelpCircle } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import './NoteView.css';

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
    // Mock note data - in real app, fetch from API
    const mockNotes = [
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
        updatedAt: new Date().toISOString()
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

### Class Components (Legacy)
While still supported, class components are less commonly used:

\`\`\`jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
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

### useContext
Consumes context values:
\`\`\`jsx
const value = useContext(MyContext);
\`\`\`

## Component Best Practices
1. Keep components small and focused
2. Use descriptive names
3. Extract reusable logic into custom hooks
4. Handle loading and error states
5. Optimize with React.memo when needed`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const foundNote = mockNotes.find(n => n.id === parseInt(id));
    setNote(foundNote);
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // In real app, call API to delete
      navigate('/notes');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    // Could add a toast notification here
  };

  const handleDownload = () => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
                  <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                  <span>Modified: {new Date(note.updatedAt).toLocaleDateString()}</span>
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
                <Download size={18} />
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
              {note.content.split('\n').map((line, index) => {
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
                } else {
                  return <p key={index} className="md-p">{line}</p>;
                }
              })}
            </div>
          </div>

          <div className="note-footer">
            <div className="note-stats">
              <span>{note.content.length} characters</span>
              <span>{note.content.split(' ').length} words</span>
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