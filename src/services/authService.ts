// =============================================================================
// AUTHENTICATION SERVICE
// =============================================================================

import { captureError, setUserContext, addBreadcrumb, trackAPIError } from './sentry';
import { analytics, identifyUser, trackEvent } from './analytics';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// =============================================================================
// AUTH SERVICE CLASS
// =============================================================================

class AuthService {
  private baseUrl: string;
  private tokenKey = 'orbit_auth_tokens';
  private userKey = 'orbit_user_data';

  constructor() {
    // Use backend server for authentication
    this.baseUrl = 'http://localhost:3001/api/auth';
  }

  // -------------------------------------------------------------------------
  // AUTHENTICATION METHODS
  // -------------------------------------------------------------------------

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens and user data securely
      this.storeTokens(authResponse.tokens);
      this.storeUser(authResponse.user);
      
      // Set user context for Sentry
      setUserContext({
        id: authResponse.user.id,
        email: authResponse.user.email,
        username: `${authResponse.user.firstName} ${authResponse.user.lastName}`,
        role: authResponse.user.role
      });
      
      // Track user identification and login event with Analytics
      identifyUser(authResponse.user.id, {
        email: authResponse.user.email,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        role: authResponse.user.role,
        signupDate: authResponse.user.createdAt,
        lastLoginDate: authResponse.user.lastLoginAt || new Date().toISOString()
      });
      
      trackEvent('user_login', {
        method: 'email_password',
        user_role: authResponse.user.role,
        is_email_verified: authResponse.user.isEmailVerified,
        remember_me: credentials.rememberMe || false
      });
      
      addBreadcrumb('User logged in successfully', 'auth', 'info');
      
      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      trackAPIError('/auth/login', error as Error);
      trackEvent('login_failed', {
        error_message: (error as Error).message,
        email: credentials.email
      });
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.status}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens and user data
      this.storeTokens(authResponse.tokens);
      this.storeUser(authResponse.user);
      
      // Track user registration with Analytics
      identifyUser(authResponse.user.id, {
        email: authResponse.user.email,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        role: authResponse.user.role,
        signupDate: authResponse.user.createdAt
      });
      
      trackEvent('user_registered', {
        registration_method: 'email_password',
        user_role: authResponse.user.role,
        is_email_verified: authResponse.user.isEmailVerified
      });
      
      return authResponse;
    } catch (error) {
      console.error('Registration error:', error);
      trackAPIError('/auth/register', error as Error);
      trackEvent('registration_failed', {
        error_message: (error as Error).message,
        email: data.email
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const tokens = this.getStoredTokens();
      
      if (tokens) {
        // Notify backend of logout
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        }).catch(() => {
          // Ignore logout API errors - clean local storage anyway
        });
      }
    } finally {
      // Always clear local data
      this.clearStoredData();
      
      // Clear user context in Sentry
      setUserContext({});
      addBreadcrumb('User logged out', 'auth', 'info');
      
      // Track logout event and reset analytics
      trackEvent('user_logout');
      analytics.reset();
    }
  }

  async refreshTokens(): Promise<AuthTokens> {
    const storedTokens = this.getStoredTokens();
    
    if (!storedTokens || !storedTokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedTokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const refreshResponse: RefreshTokenResponse = await response.json();
      this.storeTokens(refreshResponse.tokens);
      
      return refreshResponse.tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      trackAPIError('/auth/refresh', error as Error);
      // Clear invalid tokens
      this.clearStoredData();
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // PASSWORD MANAGEMENT
  // -------------------------------------------------------------------------

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request password reset');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // TOKEN AND SESSION MANAGEMENT
  // -------------------------------------------------------------------------

  getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem(this.tokenKey);
      if (!stored) return null;
      
      const tokens: AuthTokens = JSON.parse(stored);
      
      // Check if tokens are expired
      if (Date.now() >= tokens.expiresAt) {
        this.clearStoredData();
        return null;
      }
      
      return tokens;
    } catch {
      this.clearStoredData();
      return null;
    }
  }

  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    const user = this.getStoredUser();
    return !!(tokens && user);
  }

  getAccessToken(): string | null {
    const tokens = this.getStoredTokens();
    return tokens?.accessToken || null;
  }

  private storeTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.tokenKey, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  private storeUser(user: User): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  private clearStoredData(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      // Also clear old auth flag
      localStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Failed to clear stored data:', error);
    }
  }

  // -------------------------------------------------------------------------
  // PROFILE MANAGEMENT
  // -------------------------------------------------------------------------

  async updateProfile(updates: Partial<User>): Promise<User> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser: User = await response.json();
      this.storeUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // DEMO/DEVELOPMENT METHODS
  // -------------------------------------------------------------------------

  async loginDemo(): Promise<AuthResponse> {
    // For development - creates a demo session without backend
    const demoUser: User = {
      id: 'demo-user-123',
      email: 'demo@orbit.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isEmailVerified: true,
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en'
      }
    };

    const demoTokens: AuthTokens = {
      accessToken: 'demo-access-token-' + Date.now(),
      refreshToken: 'demo-refresh-token-' + Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    const authResponse: AuthResponse = {
      user: demoUser,
      tokens: demoTokens,
      message: 'Demo login successful'
    };

    this.storeTokens(demoTokens);
    this.storeUser(demoUser);

    return authResponse;
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const authService = new AuthService();