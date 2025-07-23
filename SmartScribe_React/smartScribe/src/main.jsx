import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'
import { AIProvider } from './components/contexts/AIContext.jsx';
import { LanguageProvider } from './components/contexts/LanguageContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AIProvider>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </AIProvider>
);
