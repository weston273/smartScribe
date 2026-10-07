import { lazy, Suspense, useState } from 'react';
import { Bot, Brain, FileUp, Languages, Link as LinkIcon, Video, Volume2 } from 'lucide-react';

const AIAssistant = lazy(() => import('../AIAssistant'));
const PDFProcessor = lazy(() => import('../PDFProcessor'));
const URLProcessor = lazy(() => import('../URLProcessor'));
const VoiceCommand = lazy(() => import('../VoiceCommand'));
const LanguageSelector = lazy(() => import('../LanguageSelector'));
const TopicBreakdown = lazy(() => import('../TopicBreakdown'));
const VideoProcessor = lazy(() => import('../VideoProcessor'));

export default function ToolsMenu({ onClose = () => {} }) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPDFProcessor, setShowPDFProcessor] = useState(false);
  const [showURLProcessor, setShowURLProcessor] = useState(false);
  const [showVoiceCommand, setShowVoiceCommand] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showTopicBreakdown, setShowTopicBreakdown] = useState(false);
  const [showVideoProcessor, setShowVideoProcessor] = useState(false);

  const openTool = (setVisible) => {
    onClose();
    setVisible(true);
  };

  return <>
    <section className="shell-tools" aria-labelledby="shell-tools-title">
      <h2 className="rail-label" id="shell-tools-title">TOOLS</h2>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowAIAssistant)}><Bot size={19}/><span>AI Assistant</span></button>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowVoiceCommand)}><Volume2 size={19}/><span>Voice Commands</span></button>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowTopicBreakdown)}><Brain size={19}/><span>Topic Breakdown</span></button>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowLanguageSelector)}><Languages size={19}/><span>Languages</span></button>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowPDFProcessor)}><FileUp size={19}/><span>PDF Summarizer</span></button>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowURLProcessor)}><LinkIcon size={19}/><span>Link Summarizer</span></button>
      <button type="button" className="shell-tool-link" onClick={() => openTool(setShowVideoProcessor)}><Video size={19}/><span>Video Processor</span></button>
    </section>
    <Suspense fallback={<div className="tool-loading" role="status">Opening tool…</div>}>
      {showAIAssistant && <AIAssistant isOpen onClose={() => setShowAIAssistant(false)} context="sidebar"/>}
      {showPDFProcessor && <PDFProcessor isOpen onClose={() => setShowPDFProcessor(false)} onNotesGenerated={(notes) => console.log('Notes:', notes)} onSummaryGenerated={(summary) => console.log('Summary:', summary)}/>}
      {showURLProcessor && <URLProcessor isOpen onClose={() => setShowURLProcessor(false)} onSummaryGenerated={(summary) => console.log('Summary:', summary)}/>}
      {showVoiceCommand && <VoiceCommand isOpen onClose={() => setShowVoiceCommand(false)}/>}
      {showLanguageSelector && <LanguageSelector isOpen onClose={() => setShowLanguageSelector(false)}/>}
      {showTopicBreakdown && <TopicBreakdown isOpen onClose={() => setShowTopicBreakdown(false)}/>}
      {showVideoProcessor && <VideoProcessor isOpen onClose={() => setShowVideoProcessor(false)} onNotesGenerated={(notes) => console.log('Notes:', notes)} onSummaryGenerated={(summary) => console.log('Summary:', summary)} onQuizGenerated={(quiz) => console.log('Quiz:', quiz)}/>}
    </Suspense>
  </>;
}
