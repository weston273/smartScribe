import React from 'react';
import './Essentials.css';
import Notes from './../assets/note_side_bar_icon_light.png';
import Pdf from './../assets/pdf.webp';
import Chat from '../assets/chat.png';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

export default function Essentials({ onNotesClick, onPDFClick }) {

  return (
    <section className='essentials-container'>
      <span className='essentials notes'>
        <Link to='/notes' aria-label="Take Notes">
          <img src={Notes} alt="notes icon" />
        </Link>
      </span>

      <span className="essentials" onClick={() => {
        console.log('PDF icon clicked');
        onPDFClick();
      }}>
        <img src={Pdf} alt="pdf icon" />
      </span>

      <span className="essentials-notes" onClick={onNotesClick}>
        <Link to='' aria-label="Take Notes">
          <h1>+</h1>
        </Link>
      </span>

      <span className='essentials' >
        <Link to='/record'>
          <p>{'Record'}</p>
        </Link>
      </span>

      <span className="essentials chat" >
        <Link to='/smart-chat' aria-label="Smart Chat">
          <img src={Chat} alt="chat icon" />
        </Link>
      </span>
    </section>
  );
}