import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;

  return (
    <div className="progress-bar">
      <div className="filler" style={{ width: `${percent}%` }} />
      <p>{current} / {total}</p>
    </div>
  );
}
