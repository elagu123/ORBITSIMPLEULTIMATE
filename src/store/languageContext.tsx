import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: { code: string; name: string; flag: string }[];
  changeLanguage: (languageCode: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // Save language preference to localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('orbit-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('orbit-language', languageCode);
      
      // Update document lang attribute for accessibility
      document.documentElement.lang = languageCode;
      
      // Update page direction if needed (for future RTL support)
      document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage: i18n.language,
    availableLanguages,
    changeLanguage,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;