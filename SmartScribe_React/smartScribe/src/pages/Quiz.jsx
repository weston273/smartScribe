import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, RefreshCw, Brain } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown';
import { generateQuiz, generateTopicQuiz } from '../utils/ai';
import './Quiz.css';

export default function Quiz({ theme, fromNotes = false, notesContent = '' }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz settings
  const [quizSettings, setQuizSettings] = useState({
    numberOfQuestions: 5,
    difficulty: 'intermediate',
    topic: '',
    useNotes: fromNotes
  });

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  useEffect(() => {
    if (fromNotes && notesContent) {
      setQuizSettings(prev => ({ ...prev, useNotes: true }));
    }
  }, [fromNotes, notesContent]);

  const generateQuizQuestions = async () => {
    setIsGenerating(true);
    try {
      let generatedQuestions = [];

      if (quizSettings.useNotes && notesContent) {
        generatedQuestions = await generateQuiz(
          notesContent,
          quizSettings.numberOfQuestions,
          quizSettings.difficulty,
          quizSettings.topic
        );
      } else if (quizSettings.topic) {
        generatedQuestions = await generateTopicQuiz(
          quizSettings.topic,
          quizSettings.numberOfQuestions,
          quizSettings.difficulty
        );
      }

      // fallback if nothing was returned
      if (!generatedQuestions || generatedQuestions.length === 0) {
        generatedQuestions = [
          {
            question: "What is the main purpose of SmartScribe?",
            options: ["Gaming", "Note-taking and AI assistance", "Video editing", "Music production"],
            correct: 1,
            explanation: "SmartScribe is designed for intelligent note-taking and AI-powered learning assistance."
          },
          {
            question: "Which AI model does SmartScribe use?",
            options: ["mistral AI", "DeepSeek", "Claude", "Gemini"],
            correct: 1,
            explanation: "SmartScribe uses the DeepSeek AI model for AI processing and responses."
          }
        ];
      }

      console.log("Generated questions:", generatedQuestions);
      setQuestions(generatedQuestions);
      setShowSettings(false);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
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
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setShowSettings(true);
  };

  const handleFromNotesChoice = (useNotes) => {
    setQuizSettings(prev => ({ ...prev, useNotes }));
    if (!useNotes) {
      setQuizSettings(prev => ({ ...prev, topic: '' }));
    }
  };

  // ✅ Show settings screen
  if (showSettings) {
    return (
      <div className="page-wrapper">
        <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
        
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="quiz-main">
          <div className="quiz-settings">
            <div className="settings-header">
              <div className="icon-wrapper">
                <Brain size={48} className="settings-icon" />
              </div>
              <h1>Quiz Generator</h1>
              <p>Create a personalized quiz with AI</p>
            </div>

            {fromNotes && (
              <div className="notes-choice">
                <h3>Quiz Source</h3>
                <div className="choice-buttons">
                  <button 
                    className={`choice-btn ${quizSettings.useNotes ? 'active' : ''}`}
                    onClick={() => handleFromNotesChoice(true)}
                  >
                    Use My Notes
                  </button>
                  <button 
                    className={`choice-btn ${!quizSettings.useNotes ? 'active' : ''}`}
                    onClick={() => handleFromNotesChoice(false)}
                  >
                    Custom Topic
                  </button>
                </div>
              </div>
            )}

            <div className="settings-form">
              <div className="form-group">
                <label>Number of Questions</label>
                <select
                  value={quizSettings.numberOfQuestions}
                  onChange={(e) => setQuizSettings(prev => ({ 
                    ...prev, 
                    numberOfQuestions: parseInt(e.target.value) 
                  }))}
                  className="form-select"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={quizSettings.difficulty}
                  onChange={(e) => setQuizSettings(prev => ({ 
                    ...prev, 
                    difficulty: e.target.value 
                  }))}
                  className="form-select"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {(!quizSettings.useNotes || !fromNotes) && (
                <div className="form-group">
                  <label>Topic (Optional)</label>
                  <input
                    type="text"
                    value={quizSettings.topic}
                    onChange={(e) => setQuizSettings(prev => ({ 
                      ...prev, 
                      topic: e.target.value 
                    }))}
                    placeholder="e.g., JavaScript, History, Biology..."
                    className="form-input"
                  />
                  <small>Leave empty for general questions</small>
                </div>
              )}

              <button
                onClick={generateQuizQuestions}
                disabled={isGenerating}
                className="generate-btn"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="spinning" size={20} />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    Generate Quiz
                  </>
                )}
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

  // ✅ Show generating/loading state
  if (isGenerating) {
    return (
      <div className="page-wrapper">
        <main className="quiz-main">
          <div className="loading-state">
            <div className="loading-spinner">
              <RefreshCw className="spinning" size={48} />
            </div>
            <h2>Generating Quiz...</h2>
            <p>Please wait while we prepare your questions</p>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Handle case where nothing came back
  if (!isGenerating && questions.length === 0) {
    return (
      <div className="page-wrapper">
        <main className="quiz-main">
          <div className="loading-state">
            <h2>No questions generated</h2>
            <p>Try again with different settings</p>
            <button onClick={resetQuiz} className="retry-button">
              <RefreshCw size={20} /> Back to Settings
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Show results screen
  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="page-wrapper">
        <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
        
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="quiz-main">
          <div className="quiz-results">
            <div className="results-header">
              <div className="score-circle">
                <div className="score-inner">
                  <span className="score-percentage">{percentage}%</span>
                  <span className="score-fraction">{score}/{questions.length}</span>
                </div>
              </div>
              <h1>Quiz Complete!</h1>
              <p className={`performance ${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'needs-improvement'}`}>
                {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="results-breakdown">
              <h3>Question Review</h3>
              {questions.map((question, index) => (
                <div key={index} className="question-review">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`result-indicator ${answers[index] === question.correct ? 'correct' : 'incorrect'}`}>
                      {answers[index] === question.correct ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="question-text">{question.question}</p>
                  <div className="answer-comparison">
                    <div className="your-answer">
                      <strong>Your answer:</strong> {question.options[answers[index]] || 'Not answered'}
                    </div>
                    <div className="correct-answer">
                      <strong>Correct answer:</strong> {question.options[question.correct]}
                    </div>
                    {question.explanation && (
                      <div className="explanation">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button onClick={resetQuiz} className="retry-button">
                <RefreshCw size={20} />
                Try Again
              </button>
              <button onClick={() => setShowSettings(true)} className="new-quiz-button">
                <Settings size={20} />
                New Quiz
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

  // ✅ Show quiz screen
  const question = questions[currentQuestion];

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
      
      {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
      
      <main className="quiz-main">
        <div className="quiz-container">
          <div className="quiz-header">
            <div className="quiz-info">
              <h1>AI Generated Quiz</h1>
              <div className="quiz-meta">
                <span className={`difficulty-badge difficulty-${quizSettings.difficulty}`}>
                  {quizSettings.difficulty}
                </span>
                {quizSettings.topic && (
                  <span className="topic-badge">{quizSettings.topic}</span>
                )}
              </div>
            </div>
            <button onClick={() => setShowSettings(true)} className="settings-btn">
              <Settings size={20} />
            </button>
          </div>

          <div className="progress-section">
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
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswer(currentQuestion, index)}
                  />
                  <span className="option-text">{option}</span>
                  <div className="option-indicator"></div>
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
              disabled={answers[currentQuestion] === undefined}
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
