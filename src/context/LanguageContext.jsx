import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n/index.js';

const LanguageContext = createContext(null);

function applyLangToDocument(lang) {
  const isRTL = lang === 'he';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('phonestop_lang') || 'en';
  });

  // Apply on first render
  useEffect(() => {
    applyLangToDocument(lang);
  }, []);

  const setLang = useCallback((newLang) => {
    localStorage.setItem('phonestop_lang', newLang);
    i18n.changeLanguage(newLang);
    applyLangToDocument(newLang);
    setLangState(newLang);
  }, []);

  const isRTL = lang === 'he';

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
