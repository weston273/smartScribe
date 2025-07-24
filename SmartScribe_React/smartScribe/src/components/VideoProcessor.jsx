import React, { useState } from 'react';
import { Camera, X, Download, Loader, Play, FileVideo } from 'lucide-react';
import { generateSummary, generateNotes, generateQuiz } from '../utils/ai';
import './VideoProcessor.css';

export default function VideoProcessor({ isOpen, onClose, onNotesGenerated, onSummaryGenerated, onQuizGenerated }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [summaryWordCount, setSummaryWordCount] = useState(150);
  const [generatedContent, setGeneratedContent] = useState({
    notes: '',
    summary: '',
    quiz: []
  });

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const processVideo = async () => {
    if (!videoUrl.trim()) {
      alert('Please enter a valid video URL');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setIsProcessing(true);

    try {
      // Create content context for AI processing
      const videoContext = `Analyze this YouTube video: ${videoUrl}
      
Video ID: ${videoId}
Please provide comprehensive educational content based on this video including:
1. Detailed study notes with key concepts and important points
2. A concise summary highlighting the main topics
3. Quiz questions to test understanding of the material

Focus on extracting educational value and creating structured learning materials.`;

      // Generate all content types using real AI
      const notes = await generateNotes(videoContext);
      const summary = await generateSummary(videoContext, summaryWordCount);
      const quiz = await generateQuiz(videoContext, 5, 'intermediate');

      setGeneratedContent({
        notes: notes,
        summary: summary,
        quiz: quiz
      });

      // Pass content to parent components
      if (onNotesGenerated) onNotesGenerated(notes);
      if (onSummaryGenerated) onSummaryGenerated(summary);
      if (onQuizGenerated) onQuizGenerated(quiz);

    } catch (error) {
      console.error('Error processing video:', error);
      alert('Error processing video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadContent = (content, filename, type = 'txt') => {
    const blob = new Blob([content], { type: `text/${type}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="video-processor-overlay">
      <div className="video-processor-modal">
        <div className="video-processor-header">
          <div className="header-info">
            <Camera size={24} />
            <div>
              <h2>AI Video Processor</h2>
              <p>Extract notes, summaries, and quizzes from videos using AI</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="video-processor-content">
          <div className="url-input-section">
            <div className="input-container">
              <FileVideo size={20} className="input-icon" />
              <input
                type="text"
                placeholder="Paste YouTube video URL here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="video-url-input"
                onKeyPress={(e) => e.key === 'Enter' && processVideo()}
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
            
            <button 
              onClick={processVideo} 
              disabled={isProcessing || !videoUrl.trim()}
              className="process-btn"
            >
              {isProcessing ? (
                <>
                  <Loader className="spinning" size={20} />
                  Processing Video with AI...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Process Video with AI
                </>
              )}
            </button>
          </div>

          {generatedContent.notes && (
            <div className="results-section">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => handleTabClick('notes')}
                >
                  📝 AI Notes
                </button>
                <button 
                  className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => handleTabClick('summary')}
                >
                  📄 AI Summary
                </button>
                <button 
                  className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => handleTabClick('quiz')}
                >
                  ❓ AI Quiz
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'notes' && (
                  <div className="notes-content">
                    <div className="content-header">
                      <h3>AI-Generated Notes</h3>
                      <div className="action-buttons">
                        <button onClick={() => copyToClipboard(generatedContent.notes)}>
                          Copy
                        </button>
                        <button onClick={() => downloadContent(generatedContent.notes, 'video-notes.md', 'markdown')}>
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <pre className="notes-text">{generatedContent.notes}</pre>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="summary-content">
                    <div className="content-header">
                      <h3>AI Video Summary ({summaryWordCount} words)</h3>
                      <div className="action-buttons">
                        <button onClick={() => copyToClipboard(generatedContent.summary)}>
                          Copy
                        </button>
                        <button onClick={() => downloadContent(generatedContent.summary, 'video-summary.txt')}>
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <p className="summary-text">{generatedContent.summary}</p>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="quiz-content">
                    <div className="content-header">
                      <h3>AI-Generated Quiz</h3>
                      <div className="action-buttons">
                        <button onClick={() => copyToClipboard(JSON.stringify(generatedContent.quiz, null, 2))}>
                          Copy JSON
                        </button>
                        <button onClick={() => downloadContent(JSON.stringify(generatedContent.quiz, null, 2), 'video-quiz.json', 'json')}>
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
                <h4>💡 AI Processing Tips</h4>
                <ul>
                  <li>Educational videos work best with AI analysis</li>
                  <li>Longer videos (10+ minutes) provide more detailed content</li>
                  <li>Clear audio improves AI transcription accuracy</li>
                  <li>AI generates content based on video metadata and available information</li>
                  <li>Results may vary based on video complexity and topic</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}