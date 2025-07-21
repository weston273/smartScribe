import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Download, Loader } from 'lucide-react';
import { useAI } from './contexts/AIContext';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFProcessor.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

export default function PDFProcessor({ isOpen, onClose, onNotesGenerated, onSummaryGenerated }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);
  
  const { generateSummary, generateNotes } = useAI();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setExtractedText('');
      setSummary('');
      setNotes('');
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let textContent = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => item.str).join(' ') + '\n';
          }

          resolve(textContent);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processPDF = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(selectedFile);
      setExtractedText(text);

      // Generate summary and notes using AI
      await generateSummary(text);
      await generateNotes(text);

      // Simulate AI processing for demo
      const generatedSummary = `Summary of ${selectedFile.name}:\n\nThis document contains important information that has been processed and summarized. The key points include the main topics discussed throughout the document, relevant data and statistics, and actionable insights that can be derived from the content.`;
      
      const generatedNotes = `# Notes from ${selectedFile.name}\n\n## Key Points:\n- Main topic 1: Important concept discussed\n- Main topic 2: Supporting evidence and data\n- Main topic 3: Conclusions and recommendations\n\n## Action Items:\n- Review key concepts\n- Apply insights to current projects\n- Further research on related topics`;

      setSummary(generatedSummary);
      setNotes(generatedNotes);
      
      // Pass content to parent components
      if (onSummaryGenerated) onSummaryGenerated(generatedSummary);
      if (onNotesGenerated) onNotesGenerated(generatedNotes);

    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
    <div className="pdf-processor-overlay">
      <div className="pdf-processor-modal">
        <div className="pdf-processor-header">
          <h2>PDF Processor</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="pdf-processor-content">
          <div className="upload-section">
            <div 
              className="drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="file-selected">
                  <FileText size={48} />
                  <p>{selectedFile.name}</p>
                  <small>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              ) : (
                <div className="upload-prompt">
                  <Upload size={48} />
                  <p>Click to select PDF file</p>
                  <small>Or drag and drop your PDF here</small>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="file-input"
            />

            <button
              onClick={processPDF}
              disabled={!selectedFile || isProcessing}
              className="process-btn"
            >
              {isProcessing ? (
                <>
                  <Loader className="spinning" size={20} />
                  Processing...
                </>
              ) : (
                'Process PDF'
              )}
            </button>
          </div>

          {(summary || notes) && (
            <div className="results-section">
              <div className="tabs">
                <button className="tab active">Summary</button>
                <button className="tab">Notes</button>
                <button className="tab">Original Text</button>
              </div>

              <div className="content-area">
                {summary && (
                  <div className="content-section">
                    <div className="content-header">
                      <h3>AI-Generated Summary</h3>
                      <button
                        onClick={() => downloadContent(summary, 'summary.txt')}
                        className="download-btn"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                    <div className="content-text">{summary}</div>
                  </div>
                )}

                {notes && (
                  <div className="content-section">
                    <div className="content-header">
                      <h3>Smart Notes</h3>
                      <button
                        onClick={() => downloadContent(notes, 'notes.md', 'markdown')}
                        className="download-btn"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                    <div className="content-text notes-content">{notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}