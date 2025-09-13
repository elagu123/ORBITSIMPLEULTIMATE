import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/config'; // Import i18n instance directly

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'es');
  
  const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // Initialize from localStorage and listen for language changes
  useEffect(() => {
    const savedLanguage = localStorage.getItem('orbit-language');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      i18n.changeLanguage(savedLanguage).then(() => {
        setCurrentLanguage(savedLanguage);
      });
    }

    // Listen for i18n language changes
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [currentLanguage]);

  const changeLanguage = async (languageCode: string) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('orbit-language', languageCode);
      setCurrentLanguage(languageCode);

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
    currentLanguage,
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