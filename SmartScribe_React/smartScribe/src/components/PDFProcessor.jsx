// PDFProcessor.jsx
import React, { useState, useRef } from 'react';
import { UploadIcon, PDFIcon, CloseIcon, DownloadIcon } from './icons/Icons';
import { generateSummary, generateNotes } from '../utils/ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import './PDFProcessor.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PDFProcessor({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = Array.from(e.dataTransfer.files)[0];
    if (droppedFile) {
      setFile(droppedFile);
      extractText(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    e.target.value = '';
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
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Choose a PDF, DOCX or TXT file.');
      setFile(null);
      return;
    }
    setIsProcessing(true);
    setError(''); setExtractedText(''); setOutput('');
    setExtractionProgress(0);

    try {
      let text = '';
      if (ext === 'pdf') {
        text = await extractTextFromPDF(selectedFile);
      } else if (ext === 'docx') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value.trim();
      } else if (ext === 'txt') {
        text = (await selectedFile.text()).trim();
      }
      if (!selectedFile.size || !text) throw new Error('No text found');
      setExtractedText(text);
    } catch (error) {
      console.error('Error extracting text:', error);
      setError(error?.message === 'No text found' ? 'No readable text was found in this document.' : 'We could not read this document. Try another file or format.');
    } finally {
      setIsProcessing(false);
      setExtractionProgress(0);
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
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

      return fullText.trim();
  };

  const handleGenerateSummary = async () => {
    if (!extractedText) return;
    setIsProcessing(true);
    try {
      const summary = await generateSummary(extractedText);
      setOutput(summary);
    } catch {
      setError('We could not generate a summary. Please try again.');
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
    } catch {
      setError('We could not generate notes. Please try again.');
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
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pdf-processor-modal" role="dialog" aria-modal="true" aria-label="Document summarizer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Smart Document Processor</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close document summarizer">
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
              role="group" tabIndex={0} aria-label="Choose a PDF, DOCX or text document"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenFileDialog(); }}
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
                <div className="selected-file-details">
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

              {isProcessing && <p className="processor-status" role="status">{extractedText ? 'Generating your document content…' : `Reading document… ${extractionProgress ? `${extractionProgress}%` : ''}`}</p>}

              {output && (
                <div className="output-section">
                  <h4>AI Output:</h4>
                  <div className="ai-output-box">
                    <pre className="ai-output">{output}</pre>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <button onClick={handleGenerateSummary} disabled={isProcessing || !extractedText} className="btn btn-secondary">
                  📋 Generate Summary
                </button>
                <button onClick={handleGenerateNotes} disabled={isProcessing || !extractedText} className="btn btn-primary">
                  📝 Generate Notes
                </button>
                <button onClick={handleDownloadText} disabled={!extractedText} className="btn btn-ghost">
                  <DownloadIcon size={16} /> Download Extracted Text
                </button>
              </div>
            </div>
          )}
          {error && <p className="inline-error" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}
