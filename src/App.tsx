import React from 'react';
import { useOptimizedAuth } from './store/optimized/authContext';
import LoginPage from './app/(auth)/login/page';
import MainLayout from './app/layout';
import { ErrorDashboard } from './components/ui/ErrorBoundaries';
import { LanguageProvider } from './store/languageContext';
import SkipLinks from './components/ui/SkipLinks';
import './i18n/config'; // Initialize i18n

const App: React.FC = () => {
  const { isAuthenticated } = useOptimizedAuth();

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