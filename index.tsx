import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { AuthProvider } from './src/store/authContext';
import { ProfileProvider } from './src/store/profileContext';
import { AppDataProvider } from './src/store/appDataContext';
import { AIProvider } from './src/store/aiContext';
import { GamificationProvider } from './src/store/gamificationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <AppDataProvider>
          <AIProvider>
            <GamificationProvider>
              <App />
            </GamificationProvider>
          </AIProvider>
        </AppDataProvider>
      </ProfileProvider>
    </AuthProvider>
  </React.StrictMode>
);