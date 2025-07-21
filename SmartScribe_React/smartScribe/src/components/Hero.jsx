import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

export default function Hero({ showInput, summary, onSend }) {
  const [text, setText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef();

  // Update "chat output" if a PDF summary is passed
  useEffect(() => {
    if (summary) {
      setText(summary);
      setInputValue(''); // clear input if summary loads
    }
  }, [summary]);

  // When showInput toggles on, focus input
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      setInputValue(''); // clear previous input
    }
  }, [showInput]);

  // Handle Enter key
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setText(inputValue);        // set typed value as output
      onSend && onSend(inputValue); // optional: notify parent
      setInputValue('');
    }
  };

  return (
    <div className='hero-container'>
      {/* Only show output text if input is not shown */}
      {!showInput && (
        <div className={text ? 'output-text' : 'placeholder-text'}>
          {text || 'SmartScribe'}
        </div>
      )}
      {/* Show input if toggled */}
      {showInput && (
        <input
          className='hero-input'
          type="text"
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type here..."
        />
      )}
    </div>
  );
}
