import React, { createContext, useState, useContext } from 'react';

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateProcessing = async (ms = 1000) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, ms));
    setIsProcessing(false);
  };

  const generateSummary = async (content, lang = 'en') => {
    await simulateProcessing();
    setSummary(`This is a summary of the content in ${lang}: ${content.slice(0, 100)}...`);
  };

  const generateNotes = async (content, lang = 'en') => {
    await simulateProcessing();
    setNotes(`These are notes generated from the content in ${lang}: - ${content.slice(0, 50)}...`);
  };

  const generateQuiz = async (content, lang = 'en') => {
    await simulateProcessing();
    setQuiz([
      {
        id: 1,
        question: 'What is the main idea of the content?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 0,
        explanation: 'The main idea is explained in the first paragraph.',
      },
    ]);
  };

  const transcribeAudio = async (audioBlob) => {
    await simulateProcessing();
    return 'Transcribed text from audio.';
  };

  const processPDF = async (pdfFile) => {
    await simulateProcessing();
    return 'Extracted text from PDF.';
  };

  const processURL = async (url) => {
    await simulateProcessing();
    return `Fetched and processed content from ${url}`;
  };

  const chatWithAI = async (message, context, lang = 'en') => {
    await simulateProcessing();
    
    // Simple AI responses based on message content
    let response = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = `Hello! I'm your AI assistant. How can I help you today?`;
    } else if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
      response = `I can help you create summaries from your notes, PDFs, or URLs. Would you like me to summarize some content for you?`;
    } else if (lowerMessage.includes('notes') || lowerMessage.includes('note')) {
      response = `I can help you organize and create structured notes from various sources. What would you like to take notes about?`;
    } else if (lowerMessage.includes('quiz') || lowerMessage.includes('question')) {
      response = `I can generate quizzes and questions based on your content to help you study better. What topic would you like a quiz on?`;
    } else if (lowerMessage.includes('record') || lowerMessage.includes('audio')) {
      response = `I can help you process audio recordings and convert them to text or notes. Would you like to start a recording?`;
    } else if (lowerMessage.includes('language')) {
      response = `I support multiple languages including English, Spanish, French, German, and more. What language would you prefer?`;
    } else if (lowerMessage.includes('help')) {
      response = `I can help you with:
- Creating and organizing notes
- Generating summaries from text, PDFs, or URLs
- Processing audio recordings
- Creating quizzes for studying
- Multi-language support
- Voice commands

What would you like to do?`;
    } else {
      response = `I understand you're asking about "${message}". I can help you with note-taking, summaries, quizzes, and more. Could you be more specific about what you'd like me to help you with?`;
    }
    
    const aiResponse = `${response}`;
    const newEntry = { user: message, ai: aiResponse, timestamp: new Date() };
    setChatHistory((prev) => [...prev, newEntry]);
    return aiResponse;
  };

  return (
    <AIContext.Provider
      value={{
        summary,
        notes,
        quiz,
        chatHistory,
        language,
        isProcessing,
        setLanguage,
        generateSummary,
        generateNotes,
        generateQuiz,
        transcribeAudio,
        processPDF,
        processURL,
        chatWithAI,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};