import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { OptimizedAuthProvider, useAuth, useAuthState, useAuthActions } from '../authContext';
import { mockLocalStorage, createMockUser, createAsyncMock, createAsyncErrorMock } from '../../../tests/utils/testUtils';
import * as authServiceModule from '../../../services/authService';

// Mock the auth service
jest.mock('../../../services/authService');
const mockAuthService = authServiceModule.authService as jest.Mocked<typeof authServiceModule.authService>;

describe('OptimizedAuthContext', () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <OptimizedAuthProvider>{children}</OptimizedAuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = mockLocalStorage();
    
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    // Reset auth service mocks
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getStoredUser.mockReturnValue(null);
    mockAuthService.getStoredTokens.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with unauthenticated state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should initialize with authenticated state when tokens exist', async () => {
      const mockUser = createMockUser();
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresAt: Date.now() + 900000
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should clear auth state when token refresh fails on init', async () => {
      const mockUser = createMockUser();
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.refreshTokens.mockRejectedValue(new Error('Token expired'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'token123',
          refreshToken: 'refresh123',
          expiresAt: Date.now() + 900000
        }
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBe(null);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle login errors', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'wrong@example.com',
            password: 'wrongpassword'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should set loading state during login', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'token123',
          refreshToken: 'refresh123',
          expiresAt: Date.now() + 900000
        }
      };

      // Create a delayed mock
      mockAuthService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start login
      act(() => {
        result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Demo Login', () => {
    it('should demo login successfully', async () => {
      const mockDemoResponse = {
        user: createMockUser({ email: 'demo@orbit.com', firstName: 'Demo' }),
        tokens: {
          accessToken: 'demo-token',
          refreshToken: 'demo-refresh',
          expiresAt: Date.now() + 900000
        },
        message: 'Demo login successful'
      };

      mockAuthService.loginDemo.mockResolvedValue(mockDemoResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loginDemo();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('demo@orbit.com');
      expect(mockAuthService.loginDemo).toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Setup authenticated state
      const mockUser = createMockUser();
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should logout even when API call fails', async () => {
      // Setup authenticated state
      const mockUser = createMockUser();
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.logout.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      // Should still logout locally
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('Registration', () => {
    it('should register successfully', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'token123',
          refreshToken: 'refresh123',
          expiresAt: Date.now() + 900000
        }
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'Password123',
          firstName: 'New',
          lastName: 'User'
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User'
      });
    });

    it('should handle registration errors', async () => {
      const registrationError = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(registrationError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'Password123',
            firstName: 'Test',
            lastName: 'User'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Error Management', () => {
    it('should clear errors', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set an error by triggering a failed login
      mockAuthService.login.mockRejectedValue(new Error('Test error'));

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrong'
          });
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Test error');

      await act(async () => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Selector Hooks', () => {
    it('useAuthState should return only state', async () => {
      const { result } = renderHook(() => useAuthState(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toEqual({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });

      // Should not have action methods
      expect(result.current).not.toHaveProperty('login');
      expect(result.current).not.toHaveProperty('logout');
    });

    it('useAuthActions should return only actions', async () => {
      const { result } = renderHook(() => useAuthActions(), { wrapper });

      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('clearError');

      // Should not have state
      expect(result.current).not.toHaveProperty('isAuthenticated');
      expect(result.current).not.toHaveProperty('user');
    });
  });

  describe('Auto-refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should refresh tokens automatically before expiration', async () => {
      // Setup authenticated state with tokens expiring soon
      const mockUser = createMockUser();
      const expiringTokens = {
        accessToken: 'expiring-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + (4 * 60 * 1000) // 4 minutes from now
      };

      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.getStoredTokens.mockReturnValue(expiringTokens);
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresAt: Date.now() + 900000
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Fast-forward 60 seconds (one minute)
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(mockAuthService.refreshTokens).toHaveBeenCalled();
      });
    });
  });
});