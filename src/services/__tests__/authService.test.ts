import { authService } from '../authService';
import { mockFetch, mockLocalStorage } from '../../tests/utils/testUtils';

// Mock global fetch
const mockFetchFn = mockFetch({
  'POST http://localhost:3001/api/auth/login': {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    },
    tokens: {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      expiresAt: Date.now() + 900000 // 15 minutes
    }
  },
  'POST http://localhost:3001/api/auth/register': {
    user: {
      id: 'user-456',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      role: 'user'
    },
    tokens: {
      accessToken: 'access-token-456',
      refreshToken: 'refresh-token-456',
      expiresAt: Date.now() + 900000
    }
  },
  'POST http://localhost:3001/api/auth/refresh': {
    tokens: {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: Date.now() + 900000
    }
  }
});

global.fetch = mockFetchFn;

describe('AuthService', () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = mockLocalStorage();
    
    // Mock localStorage methods
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.login(credentials);

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access-token-123');
      expect(mockFetchFn).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        })
      );

      // Check that tokens and user are stored
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'orbit_auth_tokens',
        expect.stringContaining('access-token-123')
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'orbit_user_data',
        expect.stringContaining('test@example.com')
      );
    });

    it('should throw error for invalid credentials', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('Network error'));

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const result = await authService.register(registerData);

      expect(result.user.email).toBe('new@example.com');
      expect(result.tokens.accessToken).toBe('access-token-456');
      expect(mockFetchFn).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(registerData)
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout and clear stored data', async () => {
      // Setup stored tokens
      mockStorage.setItem('orbit_auth_tokens', JSON.stringify({
        accessToken: 'token123',
        refreshToken: 'refresh123'
      }));

      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Logout successful' })
      });

      await authService.logout();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_auth_tokens');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_user_data');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('isAuthenticated');
    });

    it('should clear local data even if API call fails', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_auth_tokens');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_user_data');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      // Setup stored refresh token
      const storedTokens = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token-123',
        expiresAt: Date.now() + 900000
      };
      mockStorage.setItem('orbit_auth_tokens', JSON.stringify(storedTokens));
      mockStorage.getItem.mockReturnValue(JSON.stringify(storedTokens));

      const result = await authService.refreshTokens();

      expect(result.accessToken).toBe('new-access-token');
      expect(mockFetchFn).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'refresh-token-123' })
        })
      );
    });

    it('should throw error if no refresh token available', async () => {
      mockStorage.getItem.mockReturnValue(null);

      await expect(authService.refreshTokens()).rejects.toThrow('No refresh token available');
    });

    it('should clear stored data if refresh fails', async () => {
      const storedTokens = {
        accessToken: 'old-token',
        refreshToken: 'invalid-refresh-token',
        expiresAt: Date.now() + 900000
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(storedTokens));

      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(authService.refreshTokens()).rejects.toThrow('Failed to refresh token');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_auth_tokens');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_user_data');
    });
  });

  describe('token management', () => {
    it('should return stored tokens if not expired', () => {
      const validTokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 900000 // 15 minutes from now
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(validTokens));

      const result = authService.getStoredTokens();

      expect(result).toEqual(validTokens);
    });

    it('should return null for expired tokens', () => {
      const expiredTokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() - 1000 // 1 second ago
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(expiredTokens));

      const result = authService.getStoredTokens();

      expect(result).toBeNull();
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_auth_tokens');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_user_data');
    });

    it('should return null for invalid stored data', () => {
      mockStorage.getItem.mockReturnValue('invalid-json');

      const result = authService.getStoredTokens();

      expect(result).toBeNull();
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_auth_tokens');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('orbit_user_data');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid tokens and user exist', () => {
      const validTokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 900000
      };
      const user = { id: 'user123', email: 'test@example.com' };

      mockStorage.getItem
        .mockReturnValueOnce(JSON.stringify(validTokens))
        .mockReturnValueOnce(JSON.stringify(user));

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when tokens are missing', () => {
      mockStorage.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(JSON.stringify({ id: 'user123' }));

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when user is missing', () => {
      const validTokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 900000
      };
      mockStorage.getItem
        .mockReturnValueOnce(JSON.stringify(validTokens))
        .mockReturnValueOnce(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('loginDemo', () => {
    it('should create demo session successfully', async () => {
      const result = await authService.loginDemo();

      expect(result.user.email).toBe('demo@orbit.com');
      expect(result.user.firstName).toBe('Demo');
      expect(result.tokens.accessToken).toContain('demo-access-token');
      expect(result.message).toBe('Demo login successful');

      // Check that demo data is stored
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'orbit_auth_tokens',
        expect.stringContaining('demo-access-token')
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'orbit_user_data',
        expect.stringContaining('demo@orbit.com')
      );
    });
  });
});