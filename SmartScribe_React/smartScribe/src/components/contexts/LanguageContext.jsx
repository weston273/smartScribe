import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    'app.title': 'SmartScribe',
    'nav.dashboard': 'Dashboard',
    'nav.notes': 'Notes',
    'nav.quiz': 'Quiz',
    'nav.record': 'Record',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'record.start': 'Start Recording',
    'record.stop': 'Stop Recording',
    'record.transcribing': 'Transcribing...',
    'notes.create': 'Create Note',
    'notes.summary': 'Summary',
    'ai.processing': 'AI Processing...',
    'ai.generateNotes': 'Generate Notes',
    'ai.generateQuiz': 'Generate Quiz',
    'voice.listening': 'Listening...',
    'voice.speak': 'Click to speak'
  },
  es: {
    'app.title': 'SmartScribe',
    'nav.dashboard': 'Panel',
    'nav.notes': 'Notas',
    'nav.quiz': 'Cuestionario',
    'nav.record': 'Grabar',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'record.start': 'Iniciar Grabación',
    'record.stop': 'Detener Grabación',
    'record.transcribing': 'Transcribiendo...',
    'notes.create': 'Crear Nota',
    'notes.summary': 'Resumen',
    'ai.processing': 'Procesando IA...',
    'ai.generateNotes': 'Generar Notas',
    'ai.generateQuiz': 'Generar Cuestionario',
    'voice.listening': 'Escuchando...',
    'voice.speak': 'Haz clic para hablar'
  },
  fr: {
    'app.title': 'SmartScribe',
    'nav.dashboard': 'Tableau de bord',
    'nav.notes': 'Notes',
    'nav.quiz': 'Quiz',
    'nav.record': 'Enregistrer',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'record.start': 'Démarrer l\'enregistrement',
    'record.stop': 'Arrêter l\'enregistrement',
    'record.transcribing': 'Transcription...',
    'notes.create': 'Créer une note',
    'notes.summary': 'Résumé',
    'ai.processing': 'Traitement IA...',
    'ai.generateNotes': 'Générer des notes',
    'ai.generateQuiz': 'Générer un quiz',
    'voice.listening': 'Écoute...',
    'voice.speak': 'Cliquez pour parler'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const setLanguage = useCallback((language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  }, []);

  const translate = useCallback((key) => {
    const languageTranslations = translations[currentLanguage] || {};
    return languageTranslations[key] || key;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      supportedLanguages,
      setLanguage,
      translate
    }}>
      {children}
    </LanguageContext.Provider>
  );
};