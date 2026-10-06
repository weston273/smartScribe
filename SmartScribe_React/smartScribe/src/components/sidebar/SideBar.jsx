import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  HelpCircle, 
  Mic, 
  User, 
  X, 
  Bot,
  Languages,
  FileUp,
  Link as LinkIcon,
  Volume2,
  Brain,
  MessageCircle,
  Camera,
  Lightbulb
} from 'lucide-react';
import AIAssistant from '../AIAssistant';
import PDFProcessor from '../PDFProcessor';
import URLProcessor from '../URLProcessor';
import VoiceCommand from '../VoiceCommand';
import LanguageSelector from '../LanguageSelector';
import TopicBreakdown from '../TopicBreakdown';
import VideoProcessor from '../VideoProcessor';
import './SideBar.css';

export default function SideBar({ onClose }) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPDFProcessor, setShowPDFProcessor] = useState(false);
  const [showURLProcessor, setShowURLProcessor] = useState(false);
  const [showVoiceCommand, setShowVoiceCommand] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showTopicBreakdown, setShowTopicBreakdown] = useState(false);
  const [showVideoProcessor, setShowVideoProcessor] = useState(false);

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo"><span className="sidebar-brand-mark"><FileText size={16} /></span><span>Smart<span className="sidebar-brand-accent">Scribe</span></span></h2>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation" title="Close navigation">
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            <h3 className="nav-section-title">Workspace</h3>
            <NavLink to="/home" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/notes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
              <FileText size={20} />
              <span>Notes</span>
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
              <HelpCircle size={20} />
              <span>Quiz</span>
            </NavLink>
            <NavLink to="/record" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
              <Mic size={20} />
              <span>Record</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
              <User size={20} />
              <span>Profile</span>
            </NavLink>
          </div>

          {/* AI Features */}
          <div className="nav-section">
            <h3 className="nav-section-title">AI tools</h3>
            <button 
              className="nav-item" 
              onClick={() => setShowAIAssistant(true)}
            >
              <Bot size={20} />
              <span>AI Assistant</span>
            </button>
            <button 
              className="nav-item" 
              onClick={() => setShowVoiceCommand(true)}
            >
              <Volume2 size={20} />
              <span>Voice Commands</span>
            </button>
            <button 
              className="nav-item" 
              onClick={() => setShowTopicBreakdown(true)}
            >
              <Brain size={20} />
              <span>Topic Breakdown</span>
            </button>
            <button 
              className="nav-item" 
              onClick={() => setShowLanguageSelector(true)}
            >
              <Languages size={20} />
              <span>Languages</span>
            </button>
          </div>

          {/* Content Processing */}
          <div className="nav-section">
            <h3 className="nav-section-title">Content Processing</h3>
            <button 
              className="nav-item" 
              onClick={() => setShowPDFProcessor(true)}
            >
              <FileUp size={20} />
              <span>PDF Upload</span>
            </button>
            <button 
              className="nav-item" 
              onClick={() => setShowURLProcessor(true)}
            >
              <LinkIcon size={20} />
              <span>Link Summarizer</span>
            </button>
            <button 
              className="nav-item" 
              onClick={() => setShowVideoProcessor(true)}
            >
              <Camera size={20} />
              <span>Video Processor</span>
            </button>
          </div>

          {/* Smart Features */}
          <div className="nav-section">
            <h3 className="nav-section-title">Smart Tools</h3>
            <Link to="/quiz" className="nav-item" onClick={onClose}>
              <Lightbulb size={20} />
              <span>Generate Quiz</span>
            </Link>
            <Link to="/smart-chat" className="nav-item" onClick={onClose}>
              <MessageCircle size={20} />
              <span>Smart Chat</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Modals */}
      {showAIAssistant && (
        <AIAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          context="sidebar"
        />
      )}

      {showPDFProcessor && (
        <PDFProcessor
          isOpen={showPDFProcessor}
          onClose={() => setShowPDFProcessor(false)}
          onNotesGenerated={(notes) => console.log('Notes:', notes)}
          onSummaryGenerated={(summary) => console.log('Summary:', summary)}
        />
      )}

      {showURLProcessor && (
        <URLProcessor
          isOpen={showURLProcessor}
          onClose={() => setShowURLProcessor(false)}
          onSummaryGenerated={(summary) => console.log('Summary:', summary)}
        />
      )}

      {showVoiceCommand && (
        <VoiceCommand
          isOpen={showVoiceCommand}
          onClose={() => setShowVoiceCommand(false)}
        />
      )}

      {showLanguageSelector && (
        <LanguageSelector
          isOpen={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
        />
      )}

      {showTopicBreakdown && (
        <TopicBreakdown
          isOpen={showTopicBreakdown}
          onClose={() => setShowTopicBreakdown(false)}
        />
      )}

      {showVideoProcessor && (
        <VideoProcessor
          isOpen={showVideoProcessor}
          onClose={() => setShowVideoProcessor(false)}
          onNotesGenerated={(notes) => console.log('Notes:', notes)}
          onSummaryGenerated={(summary) => console.log('Summary:', summary)}
          onQuizGenerated={(quiz) => console.log('Quiz:', quiz)}
        />
      )}
    </>
  );
}
