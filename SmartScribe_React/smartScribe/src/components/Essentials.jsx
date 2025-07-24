import React from 'react';
import './Essentials.css';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

// SVG Icons
const NotesIcon = ({ size = 32 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h6M8 16h4" />
  </svg>
);

const PdfIcon = ({ size = 32 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth={1.5}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <path d="M14 2v6h6" />
    <text x="9" y="17" fontSize="6" fill="currentColor">PDF</text>
  </svg>
);

const ChatIcon = ({ size = 32 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4-.8l-4 1 1-3c-1.3-1.3-2-3-2-5 0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export default function Essentials({ onNotesClick, onPDFClick }) {
  return (
    <section className='essentials-container'>

      <span className='essentials notes'>
        <Link to='/notes' aria-label="Take Notes">
          <NotesIcon />
        </Link>
      </span>

      <span className="essentials" onClick={() => {
        console.log('PDF icon clicked');
        onPDFClick();
      }}>
        <PdfIcon />
      </span>

      <span className="essentials-notes" onClick={onNotesClick}>
        <Link to='' aria-label="Take Notes">
          <h1>+</h1>
        </Link>
      </span>

      <span className='essentials'>
        <Link to='/record'>
          <p>Record</p>
        </Link>
      </span>

      <span className="essentials chat">
        <Link to='/smart-chat' aria-label="Smart Chat">
          <ChatIcon />
        </Link>
      </span>

    </section>
  );
}
