import React from 'react';

const WelcomeStep: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome to Orbit MKT!</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Let's get your marketing command center set up. A few quick questions will help us tailor the AI to your specific business needs.
      </p>
    </div>
  );
};

export default WelcomeStep;