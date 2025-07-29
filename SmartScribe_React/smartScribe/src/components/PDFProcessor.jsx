// PDFProcessor.jsx
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, PDFIcon, CloseIcon, DownloadIcon } from './icons/Icons';
import { generateSummary, generateNotes } from '../utils/ai';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import './PDFProcessor.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

export default function PDFProcessor({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [output, setOutput] = useState('');
  const fileInputRef = useRef();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = Array.from(e.dataTransfer.files)[0];
    if (droppedFile) {
      setFile(droppedFile);
      extractText(droppedFile);
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      extractText(selectedFile);
    }
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const extractText = async (selectedFile) => {
    setIsProcessing(true);
    setExtractionProgress(0);
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    try {
      if (ext === 'pdf') {
        await extractTextFromPDF(selectedFile);
      } else if (ext === 'docx') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(result.value.trim());
      } else if (ext === 'txt') {
        const reader = new FileReader();
        reader.onload = () => setExtractedText(reader.result.trim());
        reader.readAsText(selectedFile);
      } else {
        alert('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Error extracting text. Please try again.');
    } finally {
      setIsProcessing(false);
      setExtractionProgress(0);
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';
      const totalPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();
        fullText += pageText + '\n\n';
        setExtractionProgress(Math.round((pageNum / totalPages) * 100));
      }

      setExtractedText(fullText.trim());
    } catch (error) {
      console.error('PDF extraction failed:', error);
      alert('Failed to extract text from PDF.');
    }
  };

  const handleGenerateSummary = async () => {
    if (!extractedText) return;
    setIsProcessing(true);
    try {
      const summary = await generateSummary(extractedText);
      setOutput(summary);
    } catch (err) {
      alert('Failed to generate summary.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!extractedText) return;
    setIsProcessing(true);
    try {
      const notes = await generateNotes(extractedText);
      setOutput(notes);
    } catch (err) {
      alert('Failed to generate notes.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}-extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setOutput('');
    setIsProcessing(false);
    setExtractionProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pdf-processor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Smart Document Processor</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal-content">
          {!file ? (
            <div
              className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
              onClick={handleOpenFileDialog}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <PDFIcon size={64} />
              <h3>Drop your document here or click to upload</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="file-input"
                style={{ display: 'none' }}
              />
              <button className="btn btn-primary" onClick={handleOpenFileDialog}>
                <UploadIcon size={20} /> Select Document
              </button>
            </div>
          ) : (
            <div className="pdf-content">
              <div className="file-info">
                <PDFIcon size={32} />
                <div>
                  <h4>{file.name}</h4>
                  <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={reset} className="btn btn-icon btn-ghost">
                  <CloseIcon size={16} />
                </button>
              </div>

              {extractedText && (
                <div className="extracted-content">
                  <h4>Extracted Preview:</h4>
                  <div className="text-preview">
                    {extractedText.substring(0, 300)}...
                  </div>
                </div>
              )}

              {output && (
                <div className="output-section">
                  <h4>AI Output:</h4>
                  <div className="ai-output-box">
                    <pre className="ai-output">{output}</pre>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <button onClick={handleGenerateSummary} disabled={isProcessing} className="btn btn-secondary">
                  📋 Generate Summary
                </button>
                <button onClick={handleGenerateNotes} disabled={isProcessing} className="btn btn-primary">
                  📝 Generate Notes
                </button>
                <button onClick={handleDownloadText} disabled={!extractedText} className="btn btn-ghost">
                  <DownloadIcon size={16} /> Download Extracted Text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
