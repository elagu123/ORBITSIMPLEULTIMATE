import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppContextState, Page } from '../types/index';

interface AIContextType {
  appContext: AppContextState;
  setAppContext: React.Dispatch<React.SetStateAction<AppContextState>>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appContext, setAppContext] = useState<AppContextState>({
    page: 'Dashboard',
  });

  return (
    <AIContext.Provider value={{ appContext, setAppContext }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};