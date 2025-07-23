import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect
  } from 'react';
  import { useAI } from './AIContext';
  
  const VoiceContext = createContext(undefined);
  
  export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) {
      throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
  };
  
  export const VoiceProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const { chatWithAI } = useAI();
  
    const isSupported =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
    useEffect(() => {
      if (isSupported) {
        const SpeechRecognition =
          window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
  
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
  
        recognitionInstance.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
  
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
  
          setTranscript(finalTranscript + interimTranscript);
  
          if (
            finalTranscript &&
            (finalTranscript.includes('?') ||
              finalTranscript.toLowerCase().includes('smartscribe'))
          ) {
            handleVoiceCommand(finalTranscript);
          }
        };
  
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
  
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
  
        setRecognition(recognitionInstance);
      }
    }, [isSupported]);
  
    const handleVoiceCommand = async (command) => {
      try {
        const response = await chatWithAI(command);
        speak(response);
      } catch (error) {
        console.error('Error processing voice command:', error);
      }
    };
  
    const startListening = useCallback(
      (language = 'en-US') => {
        if (recognition && !isListening) {
          recognition.lang = language;
          recognition.start();
          setIsListening(true);
          setTranscript('');
        }
      },
      [recognition, isListening]
    );
  
    const stopListening = useCallback(() => {
      if (recognition && isListening) {
        recognition.stop();
        setIsListening(false);
      }
    }, [recognition, isListening]);
  
    const speak = useCallback((text, language = 'en-US') => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
  
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1;
  
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
  
        window.speechSynthesis.speak(utterance);
      }
    }, []);
  
    const stopSpeaking = useCallback(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }, []);
  
    const clearTranscript = useCallback(() => {
      setTranscript('');
    }, []);
  
    return (
      <VoiceContext.Provider
        value={{
          isListening,
          isSpeaking,
          startListening,
          stopListening,
          speak,
          stopSpeaking,
          isSupported,
          transcript,
          clearTranscript
        }}
      >
        {children}
      </VoiceContext.Provider>
    );
  };