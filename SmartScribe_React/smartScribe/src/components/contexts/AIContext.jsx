import React, { createContext, useState, useContext } from 'react';
import { askOpenAI } from '../../utils/ai';

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
    setIsProcessing(true);
    try {
      const messages = [
        { role: 'system', content: 'Summarize the following content in a concise and clear way.' },
        { role: 'user', content }
      ];
      const summaryText = await askOpenAI(messages);
      setSummary(summaryText);
      return summaryText;
    } catch (err) {
      setSummary('Error generating summary.');
      return 'Error generating summary.';
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNotes = async (content, lang = 'en') => {
    setIsProcessing(true);
    try {
      const messages = [
        { role: 'system', content: 'Extract and organize the following content into clear, structured study notes with bullet points and headings.' },
        { role: 'user', content }
      ];
      const notesText = await askOpenAI(messages);
      setNotes(notesText);
      return notesText;
    } catch (err) {
      setNotes('Error generating notes.');
      return 'Error generating notes.';
    } finally {
      setIsProcessing(false);
    }
  };

  const generateQuiz = async (content, lang = 'en') => {
    setIsProcessing(true);
    try {
      const messages = [
        { role: 'system', content: 'Create a short quiz (3-5 questions) with multiple choice answers based on the following content. Format as JSON: [{question, options, correct, explanation}]' },
        { role: 'user', content }
      ];
      const quizText = await askOpenAI(messages);
      let quizArr = [];
      try {
        quizArr = JSON.parse(quizText);
      } catch {
        quizArr = [];
      }
      setQuiz(quizArr);
      return quizArr;
    } catch (err) {
      setQuiz([]);
      return [];
    } finally {
      setIsProcessing(false);
    }
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
    setIsProcessing(true);
    try {
      // Build the messages array for OpenAI
      const messages = [
        { role: 'system', content: 'You are a helpful assistant for note-taking, summarization, and quizzes.' },
      ];
      if (context) {
        messages.push({ role: 'user', content: `Context: ${context}` });
      }
      messages.push({ role: 'user', content: message });
      const aiResponse = await askOpenAI(messages);
      const newEntry = { user: message, ai: aiResponse, timestamp: new Date() };
      setChatHistory((prev) => [...prev, newEntry]);
      return aiResponse;
    } catch (err) {
      const errorMsg = 'Sorry, I could not get a response from the AI.';
      setChatHistory((prev) => [...prev, { user: message, ai: errorMsg, timestamp: new Date() }]);
      return errorMsg;
    } finally {
      setIsProcessing(false);
    }
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