import React, { useState, useRef } from 'react';
import './Essentials.css';
import Notes from './../assets/note_side_bar_icon_light.png';
import Pdf from './../assets/pdf.webp';
import Cloud from '../assets/cloud.webp';
import { Link } from 'react-router-dom';

export default function Essentials({ onNotesClick }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
          // You can now use audioUrl to play or upload the recording
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

  return (
    <section className='essentials-container'>
      <span className='essentials notes'>
        <Link to='/' aria-label="Artificial Intelligence features">
          <img src={Notes} alt="notes icon" />
        </Link>
      </span>

      <span className="essentials">
        <Link to='/' aria-label="PDF features">
          <img src={Pdf} alt="pdf icon" />
        </Link>
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
