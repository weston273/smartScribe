import React from 'react';
import './ScoreDisplay.css';

export default function ScoreDisplay({ score, total }) {
  return (
    <div className="score-display">
      <h1>Quiz Complete!</h1>
      <p>You scored {score} out of {total}</p>
      <button onClick={() => window.location.reload()}>Retake Quiz</button>
    </div>
  );
}
