import React, { useState } from 'react';
import { Link as LinkIcon, X, Download, Loader, ExternalLink } from 'lucide-react';
import { processURL, generateSummary, generateNotes, generateQuiz } from '../utils/ai';
import './URLProcessor.css';

export default function URLProcessor({ isOpen, onClose, onSummaryGenerated, onNotesGenerated }) {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [summaryWordCount, setSummaryWordCount] = useState(150);
  const [generatedContent, setGeneratedContent] = useState({
    notes: '',
    summary: '',
    quiz: [],
    title: ''
  });

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const processURLContent = async () => {
    if (!url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    if (!isValidUrl(url)) {
      alert('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use AI to process the URL content
      const urlAnalysis = await processURL(url);
      const title = `Content from ${new URL(url).hostname}`;
      
      // Generate different content types
      const summary = await generateSummary(urlAnalysis, summaryWordCount);
      const notes = await generateNotes(urlAnalysis);
      const quiz = await generateQuiz(urlAnalysis, 5, 'intermediate');

      setGeneratedContent({
        title: title,
        summary: summary,
        notes: notes,
        quiz: quiz
      });

      // Pass content to parent components
      if (onSummaryGenerated) onSummaryGenerated(summary);
      if (onNotesGenerated) onNotesGenerated(notes);

    } catch (error) {
      console.error('Error processing URL:', error);
      alert('Error processing URL. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadContent = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const clearResults = () => {
    setGeneratedContent({ notes: '', summary: '', quiz: [], title: '' });
    setUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="url-processor-overlay">
      <div className="url-processor-modal">
        <div className="url-processor-header">
          <div className="header-info">
            <LinkIcon size={24} />
            <div>
              <h2>AI URL Processor</h2>
              <p>Analyze websites and generate notes, summaries, and quizzes</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="url-processor-content">
          <div className="input-section">
            <div className="url-input-container">
              <LinkIcon size={20} className="url-icon" />
              <input
                type="text"
                placeholder="Enter URL to analyze (e.g., https://example.com/article)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="url-input"
                onKeyPress={(e) => e.key === 'Enter' && processURLContent()}
              />
            </div>
            
            {activeTab === 'summary' && (
              <div className="summary-options">
                <label htmlFor="wordCount">Summary length (words):</label>
                <select
                  id="wordCount"
                  value={summaryWordCount}
                  onChange={(e) => setSummaryWordCount(parseInt(e.target.value))}
                  className="word-count-select"
                >
                  <option value={50}>50 words</option>
                  <option value={100}>100 words</option>
                  <option value={150}>150 words</option>
                  <option value={250}>250 words</option>
                  <option value={500}>500 words</option>
                </select>
              </div>
            )}
            
            <div className="action-buttons">
              <button
                onClick={processURLContent}
                disabled={isProcessing || !url.trim()}
                className="process-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader className="spinning" size={20} />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <LinkIcon size={20} />
                    Analyze URL with AI
                  </>
                )}
              </button>

              {generatedContent.summary && (
                <button onClick={clearResults} className="clear-btn">
                  Clear Results
                </button>
              )}
            </div>
          </div>

          {generatedContent.summary && (
            <div className="results-section">
              <div className="result-header">
                <h3 className="result-title">{generatedContent.title}</h3>
                {url && (
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="source-link"
                  >
                    <ExternalLink size={16} />
                    View Original
                  </a>
                )}
              </div>

              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  📄 AI Summary
                </button>
                <button 
                  className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  📝 AI Notes
                </button>
                <button 
                  className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quiz')}
                >
                  ❓ AI Quiz
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'summary' && (
                  <div className="content-section">
                    <div className="content-header">
                      <h4>AI-Generated Summary ({summaryWordCount} words)</h4>
                      <div className="action-buttons">
                        <button onClick={() => copyToClipboard(generatedContent.summary)}>
                          Copy
                        </button>
                        <button onClick={() => downloadContent(generatedContent.summary, 'url-summary.txt')}>
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="content-text">{generatedContent.summary}</div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="content-section">
                    <div className="content-header">
                      <h4>AI-Generated Notes</h4>
                      <div className="action-buttons">
                        <button onClick={() => copyToClipboard(generatedContent.notes)}>
                          Copy
                        </button>
                        <button onClick={() => downloadContent(generatedContent.notes, 'url-notes.md')}>
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="content-text">{generatedContent.notes}</div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="content-section">
                    <div className="content-header">
                      <h4>AI-Generated Quiz</h4>
                      <div className="action-buttons">
                        <button onClick={() => copyToClipboard(JSON.stringify(generatedContent.quiz, null, 2))}>
                          Copy JSON
                        </button>
                        <button onClick={() => downloadContent(JSON.stringify(generatedContent.quiz, null, 2), 'url-quiz.json')}>
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="quiz-questions">
                      {generatedContent.quiz.map((question, index) => (
                        <div key={index} className="quiz-question">
                          <h4>Question {index + 1}: {question.question}</h4>
                          <div className="options">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className={`option ${optIndex === question.correct ? 'correct' : ''}`}
                              >
                                <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                                <span className="option-text">{option}</span>
                                {optIndex === question.correct && (
                                  <span className="correct-indicator">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="explanation">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="tips-section">
                <h4>💡 AI Analysis Tips</h4>
                <ul>
                  <li>Works best with articles, blog posts, and educational content</li>
                  <li>Ensure the URL is publicly accessible</li>
                  <li>AI analyzes available content and generates educational materials</li>
                  <li>Some websites may block automated access</li>
                  <li>Results quality depends on content complexity and structure</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}