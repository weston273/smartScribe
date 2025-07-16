import React from 'react';
import './QuestionCard.css';

export default function QuestionCard({ question, onAnswer, currentAnswer }) {
  const handleChange = (e) => {
    onAnswer(question.id, e.target.value);
  };

  return (
    <div className="question-card">
      <h2>{question.question}</h2>
      {question.type === 'mcq' ? (
        <ul>
          {question.options.map((option, index) => (
            <li key={index}>
              <label>
                <input
                  type="radio"
                  value={option}
                  checked={currentAnswer === option}
                  onChange={handleChange}
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <textarea
          value={currentAnswer || ''}
          onChange={handleChange}
          placeholder="Type your answer here..."
        />
      )}
    </div>
  );
}
