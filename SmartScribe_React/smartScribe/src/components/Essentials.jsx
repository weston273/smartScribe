import React, { useState, useRef } from 'react';
import './Essentials.css';
import Notes from './../assets/note_side_bar_icon_light.png';
import Pdf from './../assets/pdf.webp';
import Cloud from '../assets/cloud.webp';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';


pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

export default function Essentials({ onNotesClick, onSummaryGenerated }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef();
  

  const handleRecordClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('Audio URL:', audioUrl);
        };

        audioChunksRef.current = [];
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone permission denied or error:', error);
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePdfClick = () => {
    fileInputRef.current.click(); // open file explorer
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let textContent = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map(item => item.str).join(' ') + ' ';
        }

        // Simple summarizer (first 3 lines or 250 chars)
        const summary = textContent.split('. ').slice(0, 3).join('. ') || textContent.slice(0, 250);
        onSummaryGenerated(summary);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <section className='essentials-container'>
      <span className='essentials notes'>
        <Link to='/notes' aria-label="Take Notes">
          <img src={Notes} alt="notes icon" />
        </Link>
      </span>

      <span className="essentials" onClick={handlePdfClick}>
        <img src={Pdf} alt="pdf icon" />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
          style={{ display: 'none' }}
        />
      </span>

      <span className="essentials-notes" onClick={onNotesClick}>
        <Link to='' aria-label="Take Notes">
          <h1>+</h1>
        </Link>
      </span>

      <span className='essentials' onClick={handleRecordClick}>
        <p>{isRecording ? 'Stop' : 'Record'}</p>
      </span>

      <span className="essentials">
        <Link to='/' aria-label="Cloud features">
          <img src={Cloud} alt="cloud icon" />
        </Link>
      </span>
    </section>
  );
}
