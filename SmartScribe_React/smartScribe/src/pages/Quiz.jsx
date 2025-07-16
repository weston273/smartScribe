import React, { useState } from 'react';
import './Quiz.css';
import QuestionCard from '../components/quiz/QuestionCard';
import ProgressBar from '../components/quiz/ProgressBar';
import ScoreDisplay from '../components/quiz/ScoreDisplay';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar';
import AccountDropDown from '../components/account/AccountDropDown';

export default function Quiz({ theme }) {
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  // Sidebar and dropdown control
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const sampleQuestions = [
    {
      id: 1,
      type: 'mcq',
      question: 'What is the main idea of your last note?',
      options: ['Summary', 'Heading', 'Goal', 'Index'],
      answer: 'Summary',
    },
    {
      id: 2,
      type: 'text',
      question: 'Explain one key point from your note in your own words.',
      answer: null,
    },
    {
      id: 3,
      type: 'mcq',
      question: 'Which of these best represents a conclusion?',
      options: ['Introduction', 'Middle point', 'Summary statement', 'Reference'],
      answer: 'Summary statement',
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (current < sampleQuestions.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      calculateScore();
      setShowScore(true);
    }
  };

  const prevQuestion = () => {
    if (current > 0) setCurrent(prev => prev - 1);
  };

  const calculateScore = () => {
    let points = 0;
    sampleQuestions.forEach(q => {
      if (q.type === 'mcq' && userAnswers[q.id] === q.answer) {
        points += 1;
      }
    });
    setScore(points);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleAccountDropdown = () => setDropdownOpen(prev => !prev);
  const closeAccountDropdown = () => setDropdownOpen(false);

  return (
    <div className="quiz-page-layout">
      {/* NavBar with sidebar + account dropdown toggle */}
      <NavBar1 
        theme={theme} 
        onSideBarToggle={toggleSidebar} 
        onProfileClick={toggleAccountDropdown} 
      />

      {isSidebarOpen && <SideBar theme={theme} onClose={toggleSidebar} />}
      {isDropdownOpen && <AccountDropDown theme={theme} onClose={closeAccountDropdown} />}

      <div className="main-quiz-content">
        <div className="quiz-container">
          <ProgressBar current={current + 1} total={sampleQuestions.length} />
          {!showScore ? (
            <>
              <QuestionCard
                question={sampleQuestions[current]}
                onAnswer={handleAnswer}
                currentAnswer={userAnswers[sampleQuestions[current].id]}
              />
              <div className="quiz-controls">
                <button onClick={prevQuestion} disabled={current === 0}>Previous</button>
                <button onClick={nextQuestion}>
                  {current === sampleQuestions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </>
          ) : (
            <ScoreDisplay score={score} total={sampleQuestions.length} />
          )}
        </div>
      </div>
    </div>
  );
}
