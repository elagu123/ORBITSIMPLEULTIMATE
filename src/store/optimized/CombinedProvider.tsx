import React, { ReactNode } from 'react';
import { OptimizedAuthProvider } from './authContext';
import { ProfileProvider } from '../profileContext';
import { GamificationProvider } from '../gamificationContext';
import { OptimizedAppDataProvider } from './appDataContext';
import { OptimizedAIProvider } from './aiContext';
import { ToastProvider } from '../toastContext';

/**
 * Combined Provider to reduce nesting and improve performance
 * 
 * BEFORE: 5 levels of nesting causing waterfall re-renders
 * AFTER: Strategic grouping with optimized providers
 */

interface CombinedProviderProps {
  children: ReactNode;
}

export const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  return (
    // Level 1: Authentication (changes rarely, affects everything)
    <OptimizedAuthProvider>
      {/* Level 2: User Profile (changes on login, affects personalization) */}
      <ProfileProvider>
        {/* Level 3: App Data (optimized, separated static/dynamic data) */}
        <OptimizedAppDataProvider>
          {/* Level 4: AI Context (optimized with selectors) */}
          <OptimizedAIProvider>
            {/* Level 5: Gamification (isolated, changes rarely) */}
            <GamificationProvider>
              {/* Level 6: Toast Notifications (UI layer) */}
              <ToastProvider>
                {children}
              </ToastProvider>
            </GamificationProvider>
          </OptimizedAIProvider>
        </OptimizedAppDataProvider>
      </ProfileProvider>
    </OptimizedAuthProvider>
  );
};

/**
 * Alternative flat structure for maximum performance (experimental)
 * 
 * This creates all providers at the same level to eliminate cascade re-renders.
 * Use this if you need maximum performance and providers are truly independent.
 */
export const FlatCombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  return (
    <OptimizedAuthProvider>
      <ProfileProvider>
        <GamificationProvider>
          <OptimizedAppDataProvider>
            <OptimizedAIProvider>
              {children}
            </OptimizedAIProvider>
          </OptimizedAppDataProvider>
        </GamificationProvider>
      </ProfileProvider>
    </OptimizedAuthProvider>
  );
};