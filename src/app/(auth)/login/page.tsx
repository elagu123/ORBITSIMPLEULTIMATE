import React, { useState } from 'react';
import { useAuth } from '../../../store/optimized/authContext';
import { useValidatedForm } from '../../../hooks/useValidatedForm';
import { loginSchema, LoginFormData, registerSchema, RegisterFormData } from '../../../utils/validation';
import { ValidatedInput } from '../../../components/ui/ValidatedInput';
import Button from '../../../components/ui/Button';
import { ComponentErrorBoundary } from '../../../components/ui/ErrorBoundaries';
import { useTranslation } from '../../../hooks/useTranslation';

const LoginPage: React.FC = () => {
  const { login, loginDemo, register: registerUser, isLoading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { t, getFormLabel } = useTranslation();

  const loginForm = useValidatedForm<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      email: 'demo@orbit.com',
      password: 'password'
    },
    rateLimitKey: 'login_attempts',
    rateLimitMax: 5,
    onSubmit: async (data) => {
      clearError();
      await login(data);
    }
  });

  const registerForm = useValidatedForm<RegisterFormData>({
    schema: registerSchema,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    },
    rateLimitKey: 'register_attempts',
    rateLimitMax: 3,
    onSubmit: async (data) => {
      clearError();
      await registerUser(data);
    }
  });

  const handleDemoLogin = async () => {
    try {
      clearError();
      await loginDemo();
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
    loginForm.clearMessages();
    registerForm.clearMessages();
  };

  return (
    <ComponentErrorBoundary name="login-page">
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Gradient definitions */}
                <defs>
                  <radialGradient id="orbitGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </radialGradient>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>

                {/* Outer orbit ring */}
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="12"
                  opacity="0.8"
                />

                {/* Middle orbit ring */}
                <circle
                  cx="200"
                  cy="200"
                  r="120"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="8"
                  opacity="0.6"
                />

                {/* Central core */}
                <circle
                  cx="200"
                  cy="200"
                  r="60"
                  fill="url(#orbitGradient)"
                  className="animate-slow-spin"
                />

                {/* Inner core */}
                <circle
                  cx="200"
                  cy="200"
                  r="25"
                  fill="#bfdbfe"
                  opacity="0.9"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-center text-gray-800 dark:text-white">
              {mode === 'login' ? t('auth.welcomeBack', { defaultValue: 'Welcome Back' }) : t('auth.joinOrbit', { defaultValue: 'Join Orbit MKT' })}
            </h1>
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {mode === 'login' 
                ? t('auth.signInMessage', { defaultValue: 'Sign in to your marketing command center' })
                : t('auth.createAccountMessage', { defaultValue: 'Create your account to get started' })
              }
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeSwitch('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Global Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form className="space-y-6" onSubmit={loginForm.handleSubmit}>
              <div className="space-y-4">
                <ValidatedInput
                  name="email"
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  required
                  errors={loginForm.errors}
                  register={loginForm.register}
                  helperText="Use demo@orbit.com for demo access"
                  onClick={loginForm.clearMessages}
                />
                
                <ValidatedInput
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                  errors={loginForm.errors}
                  register={loginForm.register}
                  helperText="Use 'password' for demo access"
                  onClick={loginForm.clearMessages}
                />
              </div>
              
              {loginForm.submitError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {loginForm.submitError}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loginForm.isSubmitting || isLoading}
                  className="w-full"
                >
                  {loginForm.isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  🚀 Quick Demo Access
                </Button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form className="space-y-6" onSubmit={registerForm.handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput
                    name="firstName"
                    label="First Name"
                    type="text"
                    autoComplete="given-name"
                    required
                    errors={registerForm.errors}
                    register={registerForm.register}
                    onClick={registerForm.clearMessages}
                  />
                  
                  <ValidatedInput
                    name="lastName"
                    label="Last Name"
                    type="text"
                    autoComplete="family-name"
                    required
                    errors={registerForm.errors}
                    register={registerForm.register}
                    onClick={registerForm.clearMessages}
                  />
                </div>

                <ValidatedInput
                  name="email"
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  required
                  errors={registerForm.errors}
                  register={registerForm.register}
                  onClick={registerForm.clearMessages}
                />
                
                <ValidatedInput
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  errors={registerForm.errors}
                  register={registerForm.register}
                  helperText="At least 6 characters with uppercase, lowercase, and number"
                  onClick={registerForm.clearMessages}
                />

                <ValidatedInput
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  errors={registerForm.errors}
                  register={registerForm.register}
                  onClick={registerForm.clearMessages}
                />
              </div>
              
              {registerForm.submitError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {registerForm.submitError}
                    </p>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={registerForm.isSubmitting || isLoading}
                className="w-full"
              >
                {registerForm.isSubmitting || isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🛡️ Real authentication with JWT tokens & secure validation
            </p>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
};

export default LoginPage;