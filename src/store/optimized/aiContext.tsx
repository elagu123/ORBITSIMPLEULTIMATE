import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { AppContextState, Page } from '../../types/index';

// ===================================================================
// CONTEXT DEFINITION WITH SEPARATION OF CONCERNS
// ===================================================================

interface AIState {
  appContext: AppContextState;
  isProcessing: boolean;
  lastAIAction: string | null;
}

interface AIActions {
  setAppContext: (context: AppContextState | ((prev: AppContextState) => AppContextState)) => void;
  updateAppContext: (updates: Partial<AppContextState>) => void;
  setIsProcessing: (processing: boolean) => void;
  setLastAIAction: (action: string | null) => void;
  resetAIState: () => void;
}

interface AIContextType extends AIState, AIActions {}

const AIContext = createContext<AIContextType | undefined>(undefined);

// ===================================================================
// OPTIMIZED PROVIDER
// ===================================================================

const DEFAULT_APP_CONTEXT: AppContextState = {
  page: 'Dashboard' as Page,
};

export const OptimizedAIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Separate state pieces to minimize re-renders
  const [appContext, setAppContext] = useState<AppContextState>(DEFAULT_APP_CONTEXT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAIAction, setLastAIAction] = useState<string | null>(null);

  // Memoized actions - stable references
  const actions = useMemo(() => ({
    setAppContext,
    
    updateAppContext: (updates: Partial<AppContextState>) => {
      setAppContext(prev => ({ ...prev, ...updates }));
    },

    setIsProcessing,
    
    setLastAIAction,
    
    resetAIState: () => {
      setAppContext(DEFAULT_APP_CONTEXT);
      setIsProcessing(false);
      setLastAIAction(null);
    }
  }), []);

  // Memoized context value - only changes when state changes
  const contextValue = useMemo((): AIContextType => ({
    // State
    appContext,
    isProcessing,
    lastAIAction,
    
    // Actions
    ...actions
  }), [appContext, isProcessing, lastAIAction, actions]);

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

// ===================================================================
// OPTIMIZED HOOKS WITH SELECTORS
// ===================================================================

export const useOptimizedAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useOptimizedAI must be used within an OptimizedAIProvider');
  }
  return context;
};

// Selector hooks to prevent unnecessary re-renders
export const useAIAppContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIAppContext must be used within an OptimizedAIProvider');
  }
  return {
    appContext: context.appContext,
    setAppContext: context.setAppContext,
    updateAppContext: context.updateAppContext
  };
};

export const useAIProcessing = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIProcessing must be used within an OptimizedAIProvider');
  }
  return {
    isProcessing: context.isProcessing,
    setIsProcessing: context.setIsProcessing,
    lastAIAction: context.lastAIAction,
    setLastAIAction: context.setLastAIAction
  };
};

// Specific selector for current page only
export const useCurrentPage = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useCurrentPage must be used within an OptimizedAIProvider');
  }
  return context.appContext.page;
};

// Action-only hook (never causes re-renders)
export const useAIActions = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIActions must be used within an OptimizedAIProvider');
  }
  
  // Return stable references
  return {
    setAppContext: context.setAppContext,
    updateAppContext: context.updateAppContext,
    setIsProcessing: context.setIsProcessing,
    setLastAIAction: context.setLastAIAction,
    resetAIState: context.resetAIState
  };
};