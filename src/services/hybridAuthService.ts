import { authService } from './authService';
import { firebaseAuthService } from './firebaseAuth';
import { User, LoginCredentials, RegisterData, AuthResponse } from './authService';

/**
 * HYBRID AUTHENTICATION SERVICE
 * 
 * This service provides enterprise-grade authentication with fallback support:
 * - Primary: Firebase Auth (OAuth, MFA, enterprise features)
 * - Fallback: JWT-based auth (self-hosted, development)
 * 
 * SECURITY FEATURES:
 * ✅ OAuth providers (Google, GitHub)
 * ✅ Multi-factor authentication (Firebase)
 * ✅ Session management
 * ✅ Password policies
 * ✅ Account recovery
 * ✅ Graceful fallback
 */
class HybridAuthService {
  private useFirebase: boolean;
  private authProvider: typeof authService | typeof firebaseAuthService;

  constructor() {
    // Check if Firebase is configured and available
    this.useFirebase = firebaseAuthService.isAvailable();
    this.authProvider = this.useFirebase ? firebaseAuthService : authService;
    
    console.log(`🔐 Authentication Mode: ${this.useFirebase ? 'Firebase (Enterprise)' : 'JWT (Self-hosted)'}`);
  }

  /**
   * Get the current authentication provider name
   */
  getProviderName(): string {
    return this.useFirebase ? 'Firebase' : 'JWT';
  }

  /**
   * Check if enterprise features are available
   */
  hasEnterpriseFeatures(): boolean {
    return this.useFirebase;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      return await this.authProvider.login(credentials);
    } catch (error) {
      // If Firebase fails and we have JWT fallback, try JWT
      if (this.useFirebase && error instanceof Error && error.message.includes('Firebase')) {
        console.warn('🔄 Firebase login failed, falling back to JWT');
        return await authService.login(credentials);
      }
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      return await this.authProvider.register(data);
    } catch (error) {
      // If Firebase fails and we have JWT fallback, try JWT
      if (this.useFirebase && error instanceof Error && error.message.includes('Firebase')) {
        console.warn('🔄 Firebase registration failed, falling back to JWT');
        return await authService.register(data);
      }
      throw error;
    }
  }

  /**
   * OAuth login with Google (Firebase only)
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    if (!this.useFirebase) {
      throw new Error('OAuth login requires Firebase configuration');
    }
    return await firebaseAuthService.signInWithGoogle();
  }

  /**
   * OAuth login with GitHub (Firebase only)
   */
  async signInWithGitHub(): Promise<AuthResponse> {
    if (!this.useFirebase) {
      throw new Error('OAuth login requires Firebase configuration');
    }
    return await firebaseAuthService.signInWithGitHub();
  }

  /**
   * Demo login (JWT only - for development)
   */
  async loginDemo(): Promise<AuthResponse> {
    if (this.useFirebase) {
      // Firebase doesn't have demo login, use JWT
      return await authService.loginDemo();
    }
    return await (this.authProvider as typeof authService).loginDemo();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.authProvider.logout();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.authProvider.requestPasswordReset(email);
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (this.useFirebase) {
      // Firebase doesn't need current password for authenticated users
      await firebaseAuthService.changePassword(newPassword);
    } else {
      await (this.authProvider as typeof authService).changePassword(currentPassword, newPassword);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<void> {
    await (this.authProvider as typeof authService).updateProfile(updates);
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<void> {
    if (this.useFirebase) {
      // Firebase handles token refresh automatically
      const token = await firebaseAuthService.getIdToken(true);
      if (!token) {
        throw new Error('Failed to refresh Firebase token');
      }
    } else {
      await (this.authProvider as typeof authService).refreshSession();
    }
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    return (this.authProvider as typeof authService).getStoredUser();
  }

  /**
   * Get stored tokens
   */
  getStoredTokens(): any {
    return (this.authProvider as typeof authService).getStoredTokens();
  }

  /**
   * Clear stored auth data
   */
  clearStoredAuth(): void {
    (this.authProvider as typeof authService).clearStoredAuth();
  }

  /**
   * Listen to authentication state changes (Firebase only)
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (this.useFirebase) {
      return firebaseAuthService.onAuthStateChanged(callback);
    }
    // JWT doesn't have real-time auth state changes
    return () => {};
  }

  /**
   * Get current user (Firebase) or stored user (JWT)
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.useFirebase) {
      return await firebaseAuthService.getCurrentUser();
    }
    return this.getStoredUser();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Get fresh authentication token
   */
  async getAuthToken(): Promise<string | null> {
    if (this.useFirebase) {
      return await firebaseAuthService.getIdToken();
    }
    
    const tokens = this.getStoredTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Get authentication headers for API calls
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export const hybridAuthService = new HybridAuthService();

// Re-export types
export { type User, type AuthResponse, type LoginCredentials, type RegisterData };