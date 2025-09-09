import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook that extends react-i18next's useTranslation
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  // Helper functions for common translation patterns
  const formatMessage = (key: string, values?: Record<string, any>) => {
    return t(key, values);
  };

  const getPageTitle = (page: string) => {
    return t(`navigation.${page}`, { defaultValue: page });
  };

  const getButtonText = (action: string) => {
    return t(`buttons.${action}`, { defaultValue: action });
  };

  const getFormLabel = (field: string) => {
    return t(`forms.labels.${field}`, { defaultValue: field });
  };

  const getValidationMessage = (type: string, options?: Record<string, any>) => {
    return t(`forms.validation.${type}`, options);
  };

  const getSuccessMessage = (action: string) => {
    return t(`messages.success.${action}`);
  };

  const getErrorMessage = (error: string) => {
    return t(`messages.errors.${error}`);
  };

  // Language switching
  const changeLanguage = (lng: string) => {
    return i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isLanguageLoading = () => {
    return !i18n.isInitialized;
  };

  return {
    t,
    i18n,
    formatMessage,
    getPageTitle,
    getButtonText,
    getFormLabel,
    getValidationMessage,
    getSuccessMessage,
    getErrorMessage,
    changeLanguage,
    getCurrentLanguage,
    isLanguageLoading,
  };
};

// Type-safe translation keys
export type TranslationKey = 
  | `navigation.${string}`
  | `buttons.${string}`
  | `forms.${string}`
  | `messages.${string}`
  | `dashboard.${string}`
  | `customers.${string}`
  | `content.${string}`
  | `calendar.${string}`
  | `settings.${string}`
  | `auth.${string}`
  | `common.${string}`
  | `time.${string}`;

export default useTranslation;