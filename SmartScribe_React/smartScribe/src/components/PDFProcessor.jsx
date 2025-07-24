import React, { useState, useCallback } from 'react';
import { UploadIcon, PDFIcon, CloseIcon, DownloadIcon } from './icons/Icons';
import { useAI } from './contexts/AIContext';
import { useLanguage } from './contexts/LanguageContext';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFProcessor.css';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

export default function PDFProcessor({ isOpen, onClose, onSummaryGenerated, onNotesGenerated }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const { generateSummary, generateNotes } = useAI();
  const { t } = useLanguage();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFile) {
      setFile(pdfFile);
      extractTextFromPDF(pdfFile);
    } else {
      alert(t('pdf.invalidFile') || 'Please drop a valid PDF file.');
    }
  }, [t]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf'))) {
      setFile(selectedFile);
      extractTextFromPDF(selectedFile);
    } else {
      alert(t('pdf.invalidFile') || 'Please select a valid PDF file.');
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
    setIsProcessing(true);
    setExtractionProgress(0);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      const totalPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        fullText += pageText + '\n\n';
        setExtractionProgress(Math.round((pageNum / totalPages) * 100));
      }
      
      setExtractedText(fullText.trim());
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      alert(t('pdf.extractionError') || 'Error extracting text from PDF. Please try again.');
    } finally {
      setIsProcessing(false);
      setExtractionProgress(0);
    }
  };

  const handleGenerateSummary = async () => {
    if (!extractedText) return;
    
    setIsProcessing(true);
    try {
      const summary = await generateSummary(extractedText);
      onSummaryGenerated(summary);
      onClose();
    } catch (error) {
      console.error('Error generating summary:', error);
      alert(t('pdf.summaryError') || 'Error generating summary. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!extractedText) return;
    
    setIsProcessing(true);
    try {
      const notes = await generateNotes(extractedText);
      onNotesGenerated(notes);
      onClose();
    } catch (error) {
      console.error('Error generating notes:', error);
      alert(t('pdf.notesError') || 'Error generating notes. Please try again.');
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
    a.download = `${file.name.replace('.pdf', '')}-extracted-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setIsProcessing(false);
    setExtractionProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pdf-processor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <PDFIcon size={24} />
            <div>
              <h2 className="modal-title">{t('pdf.title') || 'PDF Processor'}</h2>
              <p className="modal-subtitle">{t('pdf.subtitle') || 'Extract text and generate AI summaries from PDFs'}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-ghost">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal-content">
          {!file ? (
            <div 
              className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <PDFIcon size={64} className="drop-icon" />
              <h3>{t('pdf.dropTitle') || 'Drop your PDF here'}</h3>
              <p>{t('pdf.dropDesc') || 'or click to browse files'}</p>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="file-input"
                id="pdf-input"
              />
              <label htmlFor="pdf-input" className="btn btn-primary">
                <UploadIcon size={20} />
                {t('pdf.selectFile') || 'Select PDF'}
              </label>
            </div>
          ) : (
            <div className="pdf-content">
              <div className="file-info">
                <PDFIcon size={32} />
                <div className="file-details">
                  <h3 className="file-name">{file.name}</h3>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button onClick={reset} className="btn btn-icon btn-ghost">
                  <CloseIcon size={16} />
                </button>
              </div>

              {isProcessing && extractionProgress > 0 && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>
                  <p className="progress-text">
                    {t('pdf.extracting') || 'Extracting text...'} {extractionProgress}%
                  </p>
                </div>
              )}

              {extractedText && (
                <div className="extracted-content">
                  <div className="content-header">
                    <h4>{t('pdf.extractedText') || 'Extracted Text'}</h4>
                    <button 
                      onClick={handleDownloadText}
                      className="btn btn-icon btn-ghost btn-sm"
                      title={t('pdf.downloadText') || 'Download text'}
                    >
                      <DownloadIcon size={16} />
                    </button>
                  </div>
                  <div className="text-preview">
                    {extractedText.substring(0, 500)}
                    {extractedText.length > 500 && '...'}
                  </div>
                  <div className="text-stats">
                    <span>{extractedText.length} {t('pdf.characters') || 'characters'}</span>
                    <span>{extractedText.split(/\s+/).length} {t('pdf.words') || 'words'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {extractedText && (
          <div className="modal-footer">
            <button onClick={reset} className="btn btn-ghost">
              {t('pdf.selectAnother') || 'Select Another'}
            </button>
            <div className="action-buttons">
              <button 
                onClick={handleGenerateSummary}
                disabled={isProcessing}
                className="btn btn-secondary"
              >
                {isProcessing ? (
                  <span className="spinning">🧠</span>
                ) : (
                  '📋'
                )}
                {t('pdf.generateSummary') || 'Generate Summary'}
              </button>
              <button 
                onClick={handleGenerateNotes}
                disabled={isProcessing}
                className="btn btn-primary"
              >
                {isProcessing ? (
                  <span className="spinning">🧠</span>
                ) : (
                  '📝'
                )}
                {t('pdf.generateNotes') || 'Generate Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}