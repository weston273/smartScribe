import React, { useState } from 'react';
import { Brain, X, FileText, Lightbulb, Target, BookOpen, Download } from 'lucide-react';
import { useAI } from './contexts/AIContext';
import './TopicBreakdown.css';

export default function TopicBreakdown({ isOpen, onClose }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  
  const { isProcessing: aiProcessing } = useAI();

  const processTopicBreakdown = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock topic breakdown
      const mockBreakdown = {
        mainTopic: "Understanding Machine Learning",
        subtopics: [
          {
            id: 1,
            title: "Introduction to Machine Learning",
            keyPoints: [
              "Definition and core concepts",
              "Types of machine learning",
              "Applications in real world"
            ],
            difficulty: "Beginner",
            timeToLearn: "2-3 hours"
          },
          {
            id: 2,
            title: "Supervised Learning",
            keyPoints: [
              "Classification algorithms",
              "Regression techniques",
              "Training and validation"
            ],
            difficulty: "Intermediate",
            timeToLearn: "4-6 hours"
          },
          {
            id: 3,
            title: "Unsupervised Learning",
            keyPoints: [
              "Clustering methods",
              "Dimensionality reduction",
              "Pattern discovery"
            ],
            difficulty: "Intermediate",
            timeToLearn: "3-4 hours"
          },
          {
            id: 4,
            title: "Deep Learning",
            keyPoints: [
              "Neural networks",
              "Backpropagation",
              "Modern architectures"
            ],
            difficulty: "Advanced",
            timeToLearn: "8-12 hours"
          }
        ],
        studyPath: [
          "Start with Introduction to Machine Learning",
          "Practice with Supervised Learning examples",
          "Explore Unsupervised Learning techniques",
          "Dive into Deep Learning when comfortable"
        ],
        resources: [
          "Online courses and tutorials",
          "Practical coding exercises",
          "Research papers and articles",
          "Community forums and discussions"
        ],
        estimatedTotalTime: "17-25 hours"
      };

      setBreakdown(mockBreakdown);

    } catch (error) {
      console.error('Error processing topic breakdown:', error);
      alert('Error processing topic breakdown. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return 'var(--hero-color)';
    }
  };

  const downloadBreakdown = () => {
    if (!breakdown) return;

    const content = `# Topic Breakdown: ${breakdown.mainTopic}

## Subtopics

${breakdown.subtopics.map(subtopic => `
### ${subtopic.title} (${subtopic.difficulty})
Time to learn: ${subtopic.timeToLearn}

Key Points:
${subtopic.keyPoints.map(point => `- ${point}`).join('\n')}
`).join('\n')}

## Recommended Study Path

${breakdown.studyPath.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Recommended Resources

${breakdown.resources.map(resource => `- ${resource}`).join('\n')}

**Estimated Total Time:** ${breakdown.estimatedTotalTime}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'topic-breakdown.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="topic-breakdown-overlay">
      <div className="topic-breakdown-modal">
        <div className="topic-breakdown-header">
          <div className="header-info">
            <Brain size={24} />
            <div>
              <h2>Topic Breakdown</h2>
              <p>Analyze and break down complex topics</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="topic-breakdown-content">
          <div className="input-section">
            <h3>Enter your content to analyze</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your notes, article, or any text content here. The AI will break it down into digestible topics and create a learning path for you..."
              className="content-input"
              rows={8}
            />
            
            <button
              onClick={processTopicBreakdown}
              disabled={isProcessing || !inputText.trim()}
              className="analyze-btn"
            >
              {isProcessing ? (
                <>
                  <Brain className="spinning" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={20} />
                  Analyze & Breakdown
                </>
              )}
            </button>
          </div>

          {breakdown && (
            <div className="breakdown-results">
              <div className="results-header">
                <h3>{breakdown.mainTopic}</h3>
                <button onClick={downloadBreakdown} className="download-btn">
                  <Download size={16} />
                  Download
                </button>
              </div>

              <div className="overview-stats">
                <div className="stat-item">
                  <BookOpen size={20} />
                  <div>
                    <div className="stat-value">{breakdown.subtopics.length}</div>
                    <div className="stat-label">Subtopics</div>
                  </div>
                </div>
                <div className="stat-item">
                  <Target size={20} />
                  <div>
                    <div className="stat-value">{breakdown.estimatedTotalTime}</div>
                    <div className="stat-label">Est. Study Time</div>
                  </div>
                </div>
              </div>

              <div className="subtopics-grid">
                {breakdown.subtopics.map((subtopic, index) => (
                  <div key={subtopic.id} className="subtopic-card">
                    <div className="subtopic-header">
                      <div className="subtopic-number">{index + 1}</div>
                      <div className="subtopic-info">
                        <h4 className="subtopic-title">{subtopic.title}</h4>
                        <div className="subtopic-meta">
                          <span 
                            className="difficulty-badge"
                            style={{ backgroundColor: getDifficultyColor(subtopic.difficulty) }}
                          >
                            {subtopic.difficulty}
                          </span>
                          <span className="time-estimate">{subtopic.timeToLearn}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="key-points">
                      <h5>Key Points:</h5>
                      <ul>
                        {subtopic.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="study-path">
                <h4><Target size={20} />Recommended Study Path</h4>
                <div className="path-steps">
                  {breakdown.studyPath.map((step, index) => (
                    <div key={index} className="path-step">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-content">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="resources-section">
                <h4><Lightbulb size={20} />Recommended Resources</h4>
                <div className="resources-list">
                  {breakdown.resources.map((resource, index) => (
                    <div key={index} className="resource-item">
                      <FileText size={16} />
                      <span>{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}