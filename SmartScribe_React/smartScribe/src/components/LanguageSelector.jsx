import React, { useState } from 'react';
import { Languages, X, Globe, Check } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import './LanguageSelector.css';

export default function LanguageSelector({ isOpen, onClose }) {
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const allLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'sn', name: 'Shona', nativeName: 'ChiShona', flag: '🇿🇼' }
  ];

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleSave = () => {
    setLanguage(selectedLanguage);
    onClose();
  };

  const handleCancel = () => {
    setSelectedLanguage(currentLanguage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="language-selector-overlay">
      <div className="language-selector-modal">
        <div className="language-selector-header">
          <div className="header-info">
            <Languages size={24} />
            <div>
              <h2>Language Settings</h2>
              <p>Choose your preferred language</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="language-selector-content">
          <div className="current-language">
            <Globe size={20} />
            <span>Current Language: {allLanguages.find(lang => lang.code === currentLanguage)?.name}</span>
          </div>

          <div className="language-grid">
            {allLanguages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${selectedLanguage === language.code ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <div className="language-flag">{language.flag}</div>
                <div className="language-info">
                  <div className="language-name">{language.name}</div>
                  <div className="language-native">{language.nativeName}</div>
                </div>
                {selectedLanguage === language.code && (
                  <Check size={20} className="selected-icon" />
                )}
              </button>
            ))}
          </div>

          <div className="feature-info">
            <h4>🌍 Multi-language Features</h4>
            <ul>
              <li>Interface translations for all features</li>
              <li>Voice commands in your selected language</li>
              <li>AI responses in your preferred language</li>
              <li>Text-to-speech in multiple languages</li>
              <li>Notes and summaries generated in your language</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleSave} className="save-btn">
              Save Language
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}