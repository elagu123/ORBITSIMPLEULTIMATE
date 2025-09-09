import React from 'react';
import { useAuth } from './store/authContext';
import LoginPage from './app/(auth)/login/page';
import MainLayout from './app/layout';
import ErrorBoundary from './components/ui/ErrorBoundary';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      {isAuthenticated ? <MainLayout /> : <LoginPage />}
    </ErrorBoundary>
  );
};

export default App;