import React, { useState, useEffect } from 'react';
import './Hero.css';

export default function Hero({ showInput, summary }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (summary) {
      setText(summary);
    }
  }, [summary]);

  return (
    <div className='hero-container'>
      <div className={text ? 'output-text' : 'placeholder-text'}>
        {text || 'SmartScribe'}
      </div>
      {showInput && (
        <input
          className='hero-input'
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here..."
        />
      )}
    </div>
  );
}
