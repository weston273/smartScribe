import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown';
import './Quiz.css';

export default function Quiz({ theme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What is the main purpose of SmartScribe?",
      options: ["Gaming", "Note-taking", "Video editing", "Music production"],
      correct: 1
    },
    {
      id: 2,
      question: "Which feature allows you to convert speech to text?",
      options: ["Quiz", "Record", "Profile", "Settings"],
      correct: 1
    },
    {
      id: 3,
      question: "What does AI-powered summarization help with?",
      options: ["Playing games", "Creating music", "Extracting key points", "Editing photos"],
      correct: 2
    }
  ];

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="page-wrapper">
        <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
        
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="quiz-main">
          <div className="quiz-results">
            <h1>Quiz Complete!</h1>
            <div className="score-display">
              <span className="score">{score}</span>
              <span className="total">/ {questions.length}</span>
            </div>
            <p>You scored {score} out of {questions.length} questions correctly!</p>
            <button onClick={resetQuiz} className="retry-button">
              Try Again
            </button>
          </div>
        </main>

        {showAccountDropdown && (
          <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
        )}

        <Footer theme={theme} />
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
      
      {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
      
      <main className="quiz-main">
        <div className="quiz-container">
          <div className="quiz-header">
            <h1>SmartScribe Quiz</h1>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="question-counter">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <div className="question-card">
            <h2>{question.question}</h2>
            <div className="options">
              {question.options.map((option, index) => (
                <label key={index} className="option">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={index}
                    checked={answers[question.id] === index}
                    onChange={() => handleAnswer(question.id, index)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
              className="nav-button prev"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            
            <button 
              onClick={nextQuestion}
              disabled={answers[question.id] === undefined}
              className="nav-button next"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} />
    </div>
  );
}