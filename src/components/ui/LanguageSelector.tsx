import React from 'react';
import { useLanguage } from '../../store/languageContext';
import { useTranslation } from '../../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showFlag = true 
}) => {
  const { currentLanguage, availableLanguages, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode !== currentLanguage && !isLoading) {
      changeLanguage(languageCode);
    }
  };

  return (
    <div className={`language-selector ${className}`}>
      <select
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={isLoading}
        className={`px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white
                   ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={t('settings.language')}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {showFlag ? `${lang.flag} ` : ''}{lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;