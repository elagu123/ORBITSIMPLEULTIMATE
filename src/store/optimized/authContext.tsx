import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { hybridAuthService, User, LoginCredentials, RegisterData, AuthResponse } from '../../services/hybridAuthService';

// =============================================================================
// CONTEXT INTERFACES
// =============================================================================

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

interface AuthContextType extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// OPTIMIZED AUTH PROVIDER
// =============================================================================

export const OptimizedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Separate state pieces for optimal re-rendering
  // PRODUCTION: Real authentication system
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for stored tokens
        const storedUser = hybridAuthService.getStoredUser();
        const tokens = hybridAuthService.getStoredTokens();
        
        if (storedUser && tokens) {
          // Verify token is still valid
          if (Date.now() < tokens.expiresAt) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Try to refresh the token
            try {
              await hybridAuthService.refreshSession();
              const refreshedUser = hybridAuthService.getStoredUser();
              if (refreshedUser) {
                setUser(refreshedUser);
                setIsAuthenticated(true);
              }
            } catch {
              // Refresh failed, clear stored data
              hybridAuthService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any corrupted stored data
        hybridAuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Memoized actions with stable references
  const actions = useMemo(() => ({
    login: async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const authResponse: AuthResponse = await hybridAuthService.login(credentials);
        
        setIsAuthenticated(true);
        setUser(authResponse.user);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    loginDemo: async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const authResponse = await hybridAuthService.loginDemo();
        
        setIsAuthenticated(true);
        setUser(authResponse.user);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Demo login failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    register: async (data: RegisterData) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const authResponse = await hybridAuthService.register(data);
        
        setIsAuthenticated(true);
        setUser(authResponse.user);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    logout: async () => {
      try {
        setIsLoading(true);
        await hybridAuthService.logout();
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if API call fails
      } finally {
        setIsAuthenticated(false);
        setUser(null);
        setError(null);
        setIsLoading(false);
      }
    },

    clearError: () => {
      setError(null);
    },

    refreshSession: async () => {
      try {
        await hybridAuthService.refreshSession();
        const storedUser = hybridAuthService.getStoredUser();
        
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
        // Clear auth state on refresh failure
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      }
    },

    updateProfile: async (updates: Partial<User>) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const updatedUser = await hybridAuthService.updateProfile(updates);
        setUser(updatedUser);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Profile update failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        await hybridAuthService.changePassword(currentPassword, newPassword);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password change failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    requestPasswordReset: async (email: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        await hybridAuthService.requestPasswordReset(email);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password reset request failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  }), []);

  // Auto-refresh tokens before they expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        const tokens = hybridAuthService.getStoredTokens();
        if (!tokens) return;

        // Refresh if token expires in the next 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        if (Date.now() + fiveMinutes >= tokens.expiresAt) {
          await actions.refreshSession();
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        // Will trigger logout through refreshSession error handling
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, actions]);

  // Memoized context value - only changes when state changes
  const contextValue = useMemo((): AuthContextType => ({
    // State
    isAuthenticated,
    user,
    isLoading,
    error,
    
    // Actions
    ...actions
  }), [isAuthenticated, user, isLoading, error, actions]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// =============================================================================
// OPTIMIZED HOOKS WITH SELECTORS
// =============================================================================

export const useOptimizedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useOptimizedAuth must be used within an OptimizedAuthProvider');
  }
  return context;
};

// Selector hooks for granular subscriptions
export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an OptimizedAuthProvider');
  }
  return {
    isAuthenticated: context.isAuthenticated,
    user: context.user,
    isLoading: context.isLoading,
    error: context.error
  };
};

export const useAuthActions = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an OptimizedAuthProvider');
  }
  
  return {
    login: context.login,
    loginDemo: context.loginDemo,
    register: context.register,
    logout: context.logout,
    clearError: context.clearError,
    refreshSession: context.refreshSession,
    updateProfile: context.updateProfile,
    changePassword: context.changePassword,
    requestPasswordReset: context.requestPasswordReset
  };
};

export const useCurrentUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within an OptimizedAuthProvider');
  }
  return context.user;
};

export const useAuthError = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthError must be used within an OptimizedAuthProvider');
  }
  return {
    error: context.error,
    clearError: context.clearError
  };
};

// Backward compatibility hook
export const useAuth = () => {
  return useOptimizedAuth();
};