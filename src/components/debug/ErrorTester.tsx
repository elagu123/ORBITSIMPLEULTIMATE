import React, { useState } from 'react';
import Button from '../ui/Button';

/**
 * Debug component to test error boundaries
 * Only renders in development mode
 */
export const ErrorTester: React.FC = () => {
  const [triggerError, setTriggerError] = useState<string | null>(null);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleError = (errorType: string) => {
    setTriggerError(errorType);
  };

  // This will trigger the error boundary
  if (triggerError === 'render') {
    throw new Error('Test render error: This is a simulated component error');
  }

  if (triggerError === 'network') {
    throw new Error('NetworkError: Test network failure simulation');
  }

  if (triggerError === 'async') {
    // Simulate an async error
    setTimeout(() => {
      throw new Error('Test async error: Simulated async operation failure');
    }, 100);
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
        🧪 Error Boundary Tester
      </h4>
      <div className="space-y-2">
        <Button
          onClick={() => handleError('render')}
          variant="danger"
          size="sm"
          className="w-full text-xs"
        >
          Test Render Error
        </Button>
        <Button
          onClick={() => handleError('network')}
          variant="danger"
          size="sm"
          className="w-full text-xs"
        >
          Test Network Error
        </Button>
        <Button
          onClick={() => {
            console.error('Test console error');
            alert('Check console for error log');
          }}
          variant="secondary"
          size="sm"
          className="w-full text-xs"
        >
          Test Console Error
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Development only
      </p>
    </div>
  );
};