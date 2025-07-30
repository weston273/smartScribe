import React, { createContext, useState, useContext } from 'react';
import { 
  askOpenAI, 
  generateSummary as utilGenerateSummary,
  generateNotes as utilGenerateNotes,
  generateQuiz as utilGenerateQuiz,
  chatWithAI as utilChatWithAI,
  processURL as utilProcessURL,
  extractTopics as utilExtractTopics
} from '../../utils/ai';

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);

  const generateSummary = async (content, lang = 'en') => {
    setIsProcessing(true);
    try {
      const summaryText = await utilGenerateSummary(content);
      setSummary(summaryText);
      return summaryText;
    } catch (err) {
      console.error('Error generating summary:', err);
      const errorMsg = 'Error generating summary. Please try again.';
      setSummary(errorMsg);
      return errorMsg;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNotes = async (content, lang = 'en') => {
    setIsProcessing(true);
    try {
      const notesText = await utilGenerateNotes(content);
      setNotes(notesText);
      return notesText;
    } catch (err) {
      console.error('Error generating notes:', err);
      const errorMsg = 'Error generating notes. Please try again.';
      setNotes(errorMsg);
      return errorMsg;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateQuiz = async (content, numberOfQuestions = 5, lang = 'en') => {
    setIsProcessing(true);
    try {
      const quizArray = await utilGenerateQuiz(content, numberOfQuestions);
      setQuiz(quizArray);
      return quizArray;
    } catch (err) {
      console.error('Error generating quiz:', err);
      setQuiz([]);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // For now, return a placeholder. In production, you'd implement actual transcription
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'Audio transcription feature will be implemented with a speech-to-text service.';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return 'Error transcribing audio. Please try again.';
    } finally {
      setIsProcessing(false);
    }
  };

  const processPDF = async (pdfText) => {
    setIsProcessing(true);
    try {
      const summary = await generateSummary(pdfText);
      const notes = await generateNotes(pdfText);
      return { summary, notes };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return { summary: 'Error processing PDF', notes: 'Error processing PDF' };
    } finally {
      setIsProcessing(false);
    }
  };

  const processURL = async (url) => {
    setIsProcessing(true);
    try {
      const result = await utilProcessURL(url);
      return result;
    } catch (error) {
      console.error('Error processing URL:', error);
      return 'Error processing URL. Please try again.';
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTopics = async (content) => {
    setIsProcessing(true);
    try {
      const topics = await utilExtractTopics(content);
      return topics;
    } catch (error) {
      console.error('Error extracting topics:', error);
      return 'Error extracting topics. Please try again.';
    } finally {
      setIsProcessing(false);
    }
  };

  const chatWithAI = async (message, context, lang = 'en') => {
    setIsProcessing(true);
    try {
      const aiResponse = await utilChatWithAI(message, context);
      const newEntry = { user: message, ai: aiResponse, timestamp: new Date() };
      setChatHistory((prev) => [...prev, newEntry]);
      return aiResponse;
    } catch (err) {
      console.error('Error in AI chat:', err);
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
        extractTopics,
        chatWithAI,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};