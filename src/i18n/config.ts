import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

const resources = {
  es: {
    translation: esTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Default language (Spanish for Orbit Marketing)
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    
    // Development options
    debug: process.env.NODE_ENV === 'development',
    
    // React specific options
    react: {
      useSuspense: false, // Disable suspense for better control
    },
    
    // Load path for additional resources
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;