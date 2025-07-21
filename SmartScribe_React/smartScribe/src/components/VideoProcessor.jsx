import React, { useState } from 'react';
import { Camera, X, Download, Loader, Play, FileVideo } from 'lucide-react';
import { useAI } from './contexts/AIContext';
import './VideoProcessor.css';

export default function VideoProcessor({ isOpen, onClose, onNotesGenerated, onSummaryGenerated, onQuizGenerated }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'summary', 'quiz'
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
      // Simulate API call to process video
      // In a real implementation, you would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated content based on video processing
      const mockNotes = `# Video Notes

## Key Points
- Introduction to the topic
- Main concepts discussed
- Important takeaways
- Questions for further research

## Detailed Notes
This video covers essential concepts that are fundamental to understanding the subject matter. The presenter explains complex ideas in an accessible way, making it easier for viewers to grasp the core principles.

## Action Items
- Review key concepts
- Practice with examples
- Apply knowledge to real scenarios`;

      const mockSummary = `This video provides a comprehensive overview of the topic, covering essential concepts and practical applications. The content is well-structured and includes both theoretical foundations and practical examples. Key highlights include the main principles, common challenges, and best practices for implementation.`;

      const mockQuiz = [
        {
          question: "What is the main topic discussed in this video?",
          options: ["Advanced concepts", "Basic principles", "Practical applications", "All of the above"],
          correctAnswer: 3
        },
        {
          question: "Which of the following is NOT mentioned as a key point?",
          options: ["Introduction to topic", "Main concepts", "Advanced techniques", "Practical examples"],
          correctAnswer: 2
        },
        {
          question: "What should viewers do after watching this video?",
          options: ["Forget everything", "Review key concepts", "Skip to next video", "None of the above"],
          correctAnswer: 1
        }
      ];

      setGeneratedContent({
        notes: mockNotes,
        summary: mockSummary,
        quiz: mockQuiz
      });

      // Pass content to parent components
      onNotesGenerated(mockNotes);
      onSummaryGenerated(mockSummary);
      onQuizGenerated(mockQuiz);

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
              <h2>Video Processor</h2>
              <p>Extract notes, summaries, and quizzes from videos</p>
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
            
            <button 
              onClick={processVideo} 
              disabled={isProcessing || !videoUrl.trim()}
              className="process-btn"
            >
              {isProcessing ? (
                <>
                  <Loader className="spinning" size={20} />
                  Processing Video...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Process Video
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
                  📝 Notes
                </button>
                <button 
                  className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => handleTabClick('summary')}
                >
                  📄 Summary
                </button>
                <button 
                  className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => handleTabClick('quiz')}
                >
                  ❓ Quiz
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'notes' && (
                  <div className="notes-content">
                    <div className="content-header">
                      <h3>Generated Notes</h3>
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
                      <h3>Video Summary</h3>
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
                      <h3>Generated Quiz</h3>
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
                                className={`option ${optIndex === question.correctAnswer ? 'correct' : ''}`}
                              >
                                <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                                <span className="option-text">{option}</span>
                                {optIndex === question.correctAnswer && (
                                  <span className="correct-indicator">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="tips-section">
                <h4>💡 Tips for Best Results</h4>
                <ul>
                  <li>Use educational videos with clear speech</li>
                  <li>Longer videos (10+ minutes) provide better content analysis</li>
                  <li>Videos with subtitles/captions improve accuracy</li>
                  <li>Avoid videos with excessive background music</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}