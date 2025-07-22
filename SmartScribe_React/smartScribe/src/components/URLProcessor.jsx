import React, { useState } from 'react';
import { Link as LinkIcon, X, Download, Loader, ExternalLink } from 'lucide-react';
import { useAI } from './contexts/AIContext';
import './URLProcessor.css';

export default function URLProcessor({ isOpen, onClose, onSummaryGenerated }) {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  
  const { generateSummary } = useAI();

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const processURL = async () => {
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
      // In a real implementation, you would use a backend service to scrape the URL
      // For demo purposes, we'll simulate the process of fetching content
      // TODO: Replace this with real content fetching in production
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate scraped content
      const simulatedTitle = `Article from ${new URL(url).hostname}`;
      const simulatedContent = `This is a comprehensive article that discusses various important topics related to the subject matter. The content includes detailed analysis, supporting data, and expert opinions that provide valuable insights into the field.`;

      setTitle(simulatedTitle);
      setContent(simulatedContent);

      // Use AI to summarize the simulated content
      const aiSummary = await generateSummary(simulatedContent);
      setSummary(aiSummary);
      
      // Pass summary to parent component
      if (onSummaryGenerated) {
        onSummaryGenerated(aiSummary);
      }

    } catch {
      console.error('Error processing URL');
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

  const clearResults = () => {
    setContent('');
    setSummary('');
    setTitle('');
    setUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="url-processor-overlay">
      <div className="url-processor-modal">
        <div className="url-processor-header">
          <h2>URL Summarizer</h2>
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
                placeholder="Enter URL to summarize (e.g., https://example.com/article)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="url-input"
                onKeyPress={(e) => e.key === 'Enter' && processURL()}
              />
            </div>
            
            <div className="action-buttons">
              <button
                onClick={processURL}
                disabled={isProcessing || !url.trim()}
                className="process-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader className="spinning" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <LinkIcon size={20} />
                    Summarize URL
                  </>
                )}
              </button>

              {(summary || content) && (
                <button onClick={clearResults} className="clear-btn">
                  Clear Results
                </button>
              )}
            </div>
          </div>

          {summary && (
            <div className="results-section">
              <div className="result-header">
                <h3 className="result-title">{title}</h3>
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
                <button className="tab active">Summary</button>
                <button className="tab">Full Content</button>
              </div>

              <div className="content-section">
                <div className="content-header">
                  <h4>AI-Generated Summary</h4>
                  <button
                    onClick={() => downloadContent(summary, 'url-summary.txt')}
                    className="download-btn"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
                <div className="content-text">{summary}</div>
              </div>

              {content && (
                <div className="content-section">
                  <div className="content-header">
                    <h4>Original Content</h4>
                    <button
                      onClick={() => downloadContent(content, 'original-content.txt')}
                      className="download-btn"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                  <div className="content-text original-content">{content}</div>
                </div>
              )}

              <div className="tips-section">
                <h4>💡 Tips for Better Results</h4>
                <ul>
                  <li>Use direct links to articles, blog posts, or documentation</li>
                  <li>Ensure the URL is accessible and doesn't require login</li>
                  <li>Works best with text-heavy content rather than multimedia</li>
                  <li>Some websites may block automated access</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}