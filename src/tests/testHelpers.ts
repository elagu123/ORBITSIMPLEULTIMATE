// Test utilities and helpers for the testing suite

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { CombinedProvider } from '../store/optimized/CombinedProvider';

// Custom render function that includes providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(CombinedProvider, null, children);
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock implementations for common services
export const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  loginDemo: jest.fn(),
  isAuthenticated: jest.fn(() => false),
  getStoredUser: jest.fn(() => null),
  getAccessToken: jest.fn(() => null),
};

export const mockAiService = {
  generateContent: jest.fn(),
  analyzeContent: jest.fn(),
  generateVariations: jest.fn(),
  generateCampaignIdeas: jest.fn(),
};

// Common test data
export const testUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin' as const,
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: '2024-01-15T10:00:00.000Z',
  isEmailVerified: true,
  preferences: {
    theme: 'system' as const,
    notifications: true,
    language: 'en'
  }
};

export const testBusinessProfile = {
  businessName: 'Test Business',
  industry: 'technology' as const,
  email: 'business@test.com',
  phone: '+1234567890',
  website: 'https://test.com'
};

export const testContentData = {
  title: 'Test Post',
  content: 'This is a test post content',
  platform: 'facebook' as const,
  scheduledDate: '2024-01-20T14:00:00.000Z',
  tags: ['test', 'marketing']
};

// Helper functions for testing
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react');
  return waitFor(
    () => {
      const loadingElements = document.querySelectorAll('[data-testid="loading"], .spinner');
      expect(loadingElements).toHaveLength(0);
    },
    { timeout: 3000 }
  );
};

export const mockFetch = (mockResponse: any, ok = true, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => mockResponse,
    text: async () => JSON.stringify(mockResponse),
  } as Response);
};

export const mockFetchError = (error: Error) => {
  global.fetch = jest.fn().mockRejectedValue(error);
};

// Mock intersection observer for components that use it
export const mockIntersectionObserver = () => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      trigger: (entries: any[]) => callback(entries),
    })),
  });
};

// Mock ResizeObserver for components that use it
export const mockResizeObserver = () => {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
};

// Setup common mocks
export const setupCommonMocks = () => {
  mockIntersectionObserver();
  mockResizeObserver();
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock scrollTo
  window.scrollTo = jest.fn();
  
  // Mock console.warn for testing
  const originalWarn = console.warn;
  console.warn = jest.fn();
  
  return () => {
    console.warn = originalWarn;
  };
};

// Clean up function
export const cleanupAfterTest = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};