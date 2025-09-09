// =============================================================================
// TEST UTILITIES (NON-JSX)
// =============================================================================

// =============================================================================
// MOCK DATA FACTORIES
// =============================================================================

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  avatar: 'https://example.com/avatar.jpg',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  preferences: {
    theme: 'light' as const,
    notifications: true,
    language: 'en'
  },
  ...overrides
});

export const createMockCustomer = (overrides = {}) => ({
  id: 'test-customer-123',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  personal: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-1234',
    birthDate: '1985-01-15'
  },
  business: {
    lifecycle: 'regular' as const,
    source: 'organic' as const,
    tags: ['test'],
    dateAdded: '2023-01-15'
  },
  transactions: {
    totalSpent: 1000,
    lastPurchaseDate: '2024-01-01'
  },
  aiAnalysis: {
    churnRisk: {
      score: 0.2,
      level: 'low' as const,
      mainFactor: 'Recent activity',
      explanation: 'Customer is active'
    },
    nextVisitPrediction: {
      predictedDate: '2024-02-01',
      confidence: 'high' as const
    },
    upsellOpportunity: {
      productOrService: 'Premium Service',
      reason: 'High value customer',
      explanation: 'Based on purchase history'
    }
  },
  timeline: [],
  ...overrides
});

export const createMockCalendarEvent = (overrides = {}) => ({
  id: 'test-event-123',
  title: 'Test Event',
  date: '2024-07-15',
  time: '10:00',
  type: 'scheduled_post' as const,
  status: 'scheduled' as const,
  content: 'Test event content',
  ...overrides
});

// =============================================================================
// MOCK IMPLEMENTATIONS
// =============================================================================

export const mockAuthService = {
  login: jest.fn(),
  loginDemo: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshTokens: jest.fn(),
  isAuthenticated: jest.fn(() => false),
  getStoredUser: jest.fn(() => null),
  getAccessToken: jest.fn(() => null),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn()
};

export const mockAiService = {
  generateProactiveTasks: jest.fn(),
  generateContent: jest.fn(),
  enhancePrompt: jest.fn(),
  generateVariations: jest.fn(),
  generateMagicOnboarding: jest.fn()
};

// =============================================================================
// TEST HELPERS
// =============================================================================

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create a mock implementation that resolves after a delay
 */
export const createAsyncMock = <T>(returnValue: T, delay = 100) => 
  jest.fn().mockImplementation(() => 
    new Promise(resolve => setTimeout(() => resolve(returnValue), delay))
  );

/**
 * Create a mock implementation that rejects after a delay
 */
export const createAsyncErrorMock = (error: Error, delay = 100) =>
  jest.fn().mockImplementation(() => 
    new Promise((_, reject) => setTimeout(() => reject(error), delay))
  );

/**
 * Mock localStorage with custom implementation
 */
export const mockLocalStorage = (initialData: Record<string, string> = {}) => {
  const store = { ...initialData };
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() { return { ...store }; }
  };
};

/**
 * Mock fetch with custom responses
 */
export const mockFetch = (responses: Record<string, any>) => {
  return jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    const method = options?.method || 'GET';
    const key = `${method} ${url}`;
    
    if (responses[key]) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responses[key]),
        text: () => Promise.resolve(JSON.stringify(responses[key]))
      });
    }
    
    return Promise.reject(new Error(`No mock response for ${key}`));
  });
};

// =============================================================================
// CUSTOM MATCHERS
// =============================================================================

expect.extend({
  toHaveValidationError(received, fieldName, errorMessage) {
    const hasError = received.some((error: any) => 
      error.path?.includes(fieldName) && 
      error.message === errorMessage
    );
    
    if (hasError) {
      return {
        message: () => `Expected validation errors not to include ${fieldName}: ${errorMessage}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected validation errors to include ${fieldName}: ${errorMessage}`,
        pass: false,
      };
    }
  },
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidationError(fieldName: string, errorMessage: string): R;
    }
  }
}