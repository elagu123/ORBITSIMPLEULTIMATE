import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { CombinedProvider } from './src/store/optimized/CombinedProvider';
import { initSentry } from './src/services/sentry';

// Initialize Sentry error tracking
initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CombinedProvider>
      <App />
    </CombinedProvider>
  </React.StrictMode>
);