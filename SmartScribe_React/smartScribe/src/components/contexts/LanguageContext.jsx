import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Navigation
    'nav.home': 'Home',
    'nav.notes': 'Notes',
    'nav.chat': 'Smart Chat',
    'nav.record': 'Record',
    'nav.quiz': 'Quiz',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    
    // Chat
    'chat.title': 'SmartScribe AI',
    'chat.thinking': 'Thinking...',
    'chat.ready': 'Ready to help',
    'chat.welcome': 'Welcome to SmartScribe AI',
    'chat.welcomeDesc': "I'm here to help you with note-taking, summarization, quiz generation, and more!",
    'chat.suggest1': 'Summarize my notes',
    'chat.suggest2': 'Generate a quiz',
    'chat.suggest3': 'Help me organize my study plan',
    'chat.placeholder': 'Type your message here...',
    'chat.send': 'Send message',
    'chat.copy': 'Copy message',
    'chat.download': 'Download chat',
    'chat.clear': 'Clear chat',
    'chat.settings': 'Settings',
    'chat.listening': 'Listening...',
    'chat.stopListening': 'Stop listening',
    'chat.startVoice': 'Start voice input',
    'chat.clearConfirm': 'Are you sure you want to clear all messages?',
    'chat.error': 'Sorry, I encountered an error. Please try again.',
    
    // Notes
    'notes.title': 'Notes',
    'notes.searchPlaceholder': 'Search notes by title, content, or tags...',
    'notes.createNote': 'Create Note',
    'notes.createFirstNote': 'Create Your First Note',
    'notes.noNotes': 'No notes yet',
    'notes.noNotesDesc': 'Create your first note to get started with SmartScribe',
    'notes.noSearchResults': 'No notes found',
    'notes.noSearchResultsDesc': 'Try adjusting your search terms or create a new note.',
    'notes.edit': 'Edit note',
    'notes.delete': 'Delete note',
    'notes.deleteConfirm': 'Are you sure you want to delete this note?',
    'notes.generateQuiz': 'Generate quiz from this note',
    'notes.generateQuizDesc': 'Would you like to generate a quiz from your note',
    'notes.listView': 'List View',
    'notes.gridView': 'Grid View',
    'notes.list': 'List',
    'notes.grid': 'Grid',
    'notes.settings': 'Settings',
    'notes.today': 'Today',
    'notes.yesterday': 'Yesterday',
    'notes.thisWeek': 'This Week',
    'notes.older': 'Older',
    'notes.quickActions': 'Quick Actions',
    'notes.askAI': 'Ask AI',
    'notes.voiceNote': 'Voice Note',
    'notes.clearSearch': 'Clear search',
    
    // Note Edit
    'noteEdit.createNote': 'Create Note',
    'noteEdit.editNote': 'Edit Note',
    'noteEdit.createDesc': 'Create a new note with AI assistance',
    'noteEdit.editDesc': 'Update your note',
    'noteEdit.title': 'Title',
    'noteEdit.titlePlaceholder': 'Enter note title...',
    'noteEdit.titleRequired': 'Please enter a title for your note.',
    'noteEdit.tags': 'Tags',
    'noteEdit.tagsPlaceholder': 'Enter tags separated by commas (e.g., javascript, react, programming)...',
    'noteEdit.optional': 'optional',
    'noteEdit.content': 'Content',
    'noteEdit.contentPlaceholder': 'Start writing your note here... You can use Markdown formatting.',
    'noteEdit.characters': 'characters',
    'noteEdit.words': 'words',
    'noteEdit.lines': 'lines',
    'noteEdit.save': 'Save',
    'noteEdit.copy': 'Copy content',
    'noteEdit.export': 'Export note',
    'noteEdit.delete': 'Delete note',
    'noteEdit.deleteConfirm': 'Are you sure you want to delete this note?',
    'noteEdit.aiAssistant': 'AI Assistant',
    'noteEdit.aiDescription': 'Let AI help you generate content for your note. Describe what you want to write about.',
    'noteEdit.aiPromptPlaceholder': 'E.g., "Write about React hooks and their benefits"',
    'noteEdit.generating': 'Generating...',
    'noteEdit.generate': 'Generate',
    'noteEdit.suggestions': 'Quick suggestions:',
    'noteEdit.suggest1': 'Explain JavaScript closures',
    'noteEdit.suggest2': 'React vs Vue comparison',
    'noteEdit.suggest3': 'CSS Grid layout guide',
    'noteEdit.suggest4': 'API design best practices',
    'noteEdit.preview': 'Preview',
    'noteEdit.promptRequired': 'Please enter a prompt for AI generation.',
    'noteEdit.aiError': 'Failed to generate content. Please try again.',
    
    // PDF
    'pdf.title': 'PDF Processor',
    'pdf.subtitle': 'Extract text and generate AI summaries from PDFs',
    'pdf.dropTitle': 'Drop your PDF here',
    'pdf.dropDesc': 'or click to browse files',
    'pdf.selectFile': 'Select PDF',
    'pdf.invalidFile': 'Please select a valid PDF file.',
    'pdf.extracting': 'Extracting text...',
    'pdf.extractedText': 'Extracted Text',
    'pdf.downloadText': 'Download text',
    'pdf.characters': 'characters',
    'pdf.words': 'words',
    'pdf.selectAnother': 'Select Another',
    'pdf.generateSummary': 'Generate Summary',
    'pdf.generateNotes': 'Generate Notes',
    'pdf.extractionError': 'Error extracting text from PDF. Please try again.',
    'pdf.summaryError': 'Error generating summary. Please try again.',
    'pdf.notesError': 'Error generating notes. Please try again.',
  },
  
  es: {
    // Common
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    
    // Navigation
    'nav.home': 'Inicio',
    'nav.notes': 'Notas',
    'nav.chat': 'Chat Inteligente',
    'nav.record': 'Grabar',
    'nav.quiz': 'Cuestionario',
    'nav.settings': 'Configuración',
    'nav.profile': 'Perfil',
    
    // Chat
    'chat.title': 'SmartScribe IA',
    'chat.thinking': 'Pensando...',
    'chat.ready': 'Listo para ayudar',
    'chat.welcome': 'Bienvenido a SmartScribe IA',
    'chat.welcomeDesc': '¡Estoy aquí para ayudarte con toma de notas, resúmenes, generación de cuestionarios y más!',
    'chat.suggest1': 'Resumir mis notas',
    'chat.suggest2': 'Generar un cuestionario',
    'chat.suggest3': 'Ayúdame a organizar mi plan de estudio',
    'chat.placeholder': 'Escribe tu mensaje aquí...',
    'chat.send': 'Enviar mensaje',
    'chat.copy': 'Copiar mensaje',
    'chat.download': 'Descargar chat',
    'chat.clear': 'Limpiar chat',
    'chat.settings': 'Configuración',
    'chat.listening': 'Escuchando...',
    'chat.stopListening': 'Dejar de escuchar',
    'chat.startVoice': 'Iniciar entrada de voz',
    'chat.clearConfirm': '¿Estás seguro de que quieres borrar todos los mensajes?',
    'chat.error': 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.',
  },
  
  fr: {
    // Common
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    
    // Navigation
    'nav.home': 'Accueil',
    'nav.notes': 'Notes',
    'nav.chat': 'Chat Intelligent',
    'nav.record': 'Enregistrer',
    'nav.quiz': 'Quiz',
    'nav.settings': 'Paramètres',
    'nav.profile': 'Profil',
    
    // Chat
    'chat.title': 'SmartScribe IA',
    'chat.thinking': 'Réfléchit...',
    'chat.ready': 'Prêt à aider',
    'chat.welcome': 'Bienvenue sur SmartScribe IA',
    'chat.welcomeDesc': 'Je suis là pour vous aider avec la prise de notes, la synthèse, la génération de quiz, et plus encore !',
    'chat.suggest1': 'Résumer mes notes',
    'chat.suggest2': 'Générer un quiz',
    'chat.suggest3': 'Aidez-moi à organiser mon plan d\'étude',
    'chat.placeholder': 'Tapez votre message ici...',
    'chat.send': 'Envoyer le message',
    'chat.copy': 'Copier le message',
    'chat.download': 'Télécharger le chat',
    'chat.clear': 'Effacer le chat',
    'chat.settings': 'Paramètres',
    'chat.listening': 'À l\'écoute...',
    'chat.stopListening': 'Arrêter l\'écoute',
    'chat.startVoice': 'Démarrer la saisie vocale',
    'chat.clearConfirm': 'Êtes-vous sûr de vouloir effacer tous les messages ?',
    'chat.error': 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('smartscribe-language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('smartscribe-language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};