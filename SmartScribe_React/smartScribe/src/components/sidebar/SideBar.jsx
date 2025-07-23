import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
          <h2 className="sidebar-logo">SmartScribe</h2>
          <button className="sidebar-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            <h3 className="nav-section-title">Main</h3>
            <Link to="/home" className="nav-item" onClick={onClose}>
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/notes" className="nav-item" onClick={onClose}>
              <FileText size={20} />
              <span>Notes</span>
            </Link>
            <Link to="/quiz" className="nav-item" onClick={onClose}>
              <HelpCircle size={20} />
              <span>Quiz</span>
            </Link>
            <Link to="/record" className="nav-item" onClick={onClose}>
              <Mic size={20} />
              <span>Record</span>
            </Link>
            <Link to="/profile" className="nav-item" onClick={onClose}>
              <User size={20} />
              <span>Profile</span>
            </Link>
          </div>

          {/* AI Features */}
          <div className="nav-section">
            <h3 className="nav-section-title">AI Features</h3>
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
            <button className="nav-item">
              <MessageCircle size={20} />
              <span>Smart Chat</span>
            </button>
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