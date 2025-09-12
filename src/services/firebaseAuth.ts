import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { User, LoginCredentials, RegisterData, AuthResponse } from './authService';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is provided
let app: any = null;
let auth: any = null;

const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && 
            firebaseConfig.authDomain && 
            firebaseConfig.projectId);
};

if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log('🔥 Firebase Auth initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error);
  }
}

// =============================================================================
// FIREBASE AUTH SERVICE
// =============================================================================

class FirebaseAuthService {
  private googleProvider: GoogleAuthProvider;
  private githubProvider: GithubAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.githubProvider = new GithubAuthProvider();
    
    // Add additional scopes
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
  }

  /**
   * Check if Firebase is configured and available
   */
  isAvailable(): boolean {
    return !!(auth && isFirebaseConfigured());
  }

  /**
   * Convert Firebase user to our User interface
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    const [firstName = '', lastName = ''] = (firebaseUser.displayName || '').split(' ');
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      firstName,
      lastName,
      role: 'user', // Default role, can be enhanced with custom claims
      avatar: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime || undefined,
      isEmailVerified: firebaseUser.emailVerified,
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en'
      }
    };
  }

  /**
   * Email/password login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = this.mapFirebaseUser(userCredential.user);
      const accessToken = await userCredential.user.getIdToken();
      
      return {
        user,
        tokens: {
          accessToken,
          refreshToken: userCredential.user.refreshToken || '',
          expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
        },
        message: 'Login successful'
      };
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Email/password registration
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      const user = this.mapFirebaseUser(userCredential.user);
      const accessToken = await userCredential.user.getIdToken();

      return {
        user,
        tokens: {
          accessToken,
          refreshToken: userCredential.user.refreshToken || '',
          expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
        },
        message: 'Registration successful'
      };
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Google OAuth login
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = this.mapFirebaseUser(result.user);
      const accessToken = await result.user.getIdToken();

      return {
        user,
        tokens: {
          accessToken,
          refreshToken: result.user.refreshToken || '',
          expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
        },
        message: 'Google login successful'
      };
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * GitHub OAuth login
   */
  async signInWithGitHub(): Promise<AuthResponse> {
    if (!this.isAvailable()) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const result = await signInWithPopup(auth, this.githubProvider);
      const user = this.mapFirebaseUser(result.user);
      const accessToken = await result.user.getIdToken();

      return {
        user,
        tokens: {
          accessToken,
          refreshToken: result.user.refreshToken || '',
          expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
        },
        message: 'GitHub login successful'
      };
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    await signOut(auth);
  }

  /**
   * Send password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Firebase Auth is not configured');
    }

    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Change password
   */
  async changePassword(newPassword: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Firebase Auth is not configured');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updatePassword(user, newPassword);
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!this.isAvailable()) {
      return () => {};
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this.mapFirebaseUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null> {
    if (!this.isAvailable()) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          resolve(this.mapFirebaseUser(firebaseUser));
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Get fresh ID token
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (!this.isAvailable() || !auth.currentUser) {
      return null;
    }

    return await auth.currentUser.getIdToken(forceRefresh);
  }

  /**
   * Convert Firebase auth error codes to user-friendly messages
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'This email address is already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/popup-closed-by-user':
        return 'Login popup was closed before completing authentication';
      case 'auth/cancelled-popup-request':
        return 'Login popup request was cancelled';
      case 'auth/popup-blocked':
        return 'Login popup was blocked by your browser';
      default:
        return `Authentication error: ${errorCode}`;
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export { type User, type AuthResponse, type LoginCredentials, type RegisterData };