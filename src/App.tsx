import React, { useEffect, useState } from 'react';
import { useOptimizedAuth } from './store/optimized/authContext';
import LoginPage from './app/(auth)/login/page';
import MainLayout from './app/layout';
import { ErrorDashboard } from './components/ui/ErrorBoundaries';
import { LanguageProvider } from './store/languageContext';
import SkipLinks from './components/ui/SkipLinks';
import i18n from './i18n/config'; // Import i18n instance

const App: React.FC = () => {
  const { isAuthenticated } = useOptimizedAuth();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to be fully initialized
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      const handleInitialized = () => setI18nReady(true);
      i18n.on('initialized', handleInitialized);
      return () => i18n.off('initialized', handleInitialized);
    }
  }, []);

  // Show loading while i18n initializes
  if (!i18nReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <SkipLinks />
      <main id="main-content">
        {isAuthenticated ? <MainLayout /> : <LoginPage />}
      </main>
      <ErrorDashboard />
    </LanguageProvider>
  );
};

export default App;