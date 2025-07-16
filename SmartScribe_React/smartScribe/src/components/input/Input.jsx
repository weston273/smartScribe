import React from 'react';
import './Input.css';

function Input({ placeholder = 'Username' }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="input"
    />
  );
}

export default Input;
