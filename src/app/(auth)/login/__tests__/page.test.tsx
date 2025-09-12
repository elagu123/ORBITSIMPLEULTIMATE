import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CombinedProvider } from '../../../../store/optimized/CombinedProvider';
import LoginPage from '../page';

// Mock the auth service
jest.mock('../../../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    loginDemo: jest.fn(),
    register: jest.fn(),
  }
}));

// Mock the auth context
jest.mock('../../../../store/optimized/authContext', () => ({
  useOptimizedAuth: () => ({
    login: jest.fn(),
    loginDemo: jest.fn(),
    register: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  })
}));

// Mock translation hook
jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    getFormLabel: (key: string) => key
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <CombinedProvider>
      {component}
    </CombinedProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form by default', () => {
      renderWithProviders(<LoginPage />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('has a demo access button', () => {
      renderWithProviders(<LoginPage />);
      
      expect(screen.getByRole('button', { name: /quick demo access/i })).toBeInTheDocument();
    });

    it('can switch to register mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const registerTab = screen.getByRole('button', { name: /sign up/i });
      await user.click(registerTab);
      
      expect(screen.getByText('Join Orbit MKT')).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for invalid email', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email válido/i)).toBeInTheDocument();
      });
    });

    it('shows error for short password', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      // Switch to register mode to test password validation
      const registerTab = screen.getByRole('button', { name: /sign up/i });
      await user.click(registerTab);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, '123');
      
      await waitFor(() => {
        expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('shows error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid');
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/email válido/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Tab navigation should work
      await user.tab();
      expect(emailInput).toHaveFocus();
      
      await user.tab();
      expect(passwordInput).toHaveFocus();
      
      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('User Interactions', () => {
    it('provides helpful placeholder text', () => {
      renderWithProviders(<LoginPage />);
      
      expect(screen.getByText(/use demo@orbit.com for demo access/i)).toBeInTheDocument();
      expect(screen.getByText(/use 'password' for demo access/i)).toBeInTheDocument();
    });

    it('clears errors when switching modes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      // Create an error in login mode
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid');
      
      await waitFor(() => {
        expect(screen.getByText(/email válido/i)).toBeInTheDocument();
      });
      
      // Switch to register mode
      const registerTab = screen.getByRole('button', { name: /sign up/i });
      await user.click(registerTab);
      
      // Error should be cleared
      expect(screen.queryByText(/email válido/i)).not.toBeInTheDocument();
    });
  });
});