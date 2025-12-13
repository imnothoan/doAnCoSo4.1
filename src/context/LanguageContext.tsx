import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, Translations } from '../constants/translations';

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = '@app_language';
const DEFAULT_LANGUAGE: Language = 'vi';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, []);

  const toggleLanguage = useCallback(async () => {
    const newLang = language === 'vi' ? 'en' : 'vi';
    await setLanguage(newLang);
  }, [language, setLanguage]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
