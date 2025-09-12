import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome, Github, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { hybridAuthService } from '../../../services/hybridAuthService';
import { useAuth } from '../../../store/optimized/authContext';
import { useValidatedForm } from '../../../hooks/useValidatedForm';
import { loginSchema, LoginFormData } from '../../../utils/validationSchemas';

interface EnhancedLoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({
  onSuccess,
  onError
}) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Use validated form with security features
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    isValid
  } = useValidatedForm<LoginFormData>({
    schema: loginSchema,
    onSubmit: async (data) => {
      try {
        await login(data);
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        onError?.(errorMessage);
        throw err; // Re-throw to let the hook handle it
      }
    },
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    rateLimitKey: 'login_attempts',
    rateLimitMax: 5,
    sanitize: true
  });

  const hasEnterpriseFeatures = hybridAuthService.hasEnterpriseFeatures();
  const providerName = hybridAuthService.getProviderName();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (!hasEnterpriseFeatures) {
      onError?.('OAuth login requires Firebase configuration');
      return;
    }

    try {
      if (provider === 'google') {
        await hybridAuthService.signInWithGoogle();
      } else {
        await hybridAuthService.signInWithGitHub();
      }
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} login failed`;
      onError?.(errorMessage);
    }
  };

  const handleDemoLogin = async () => {
    try {
      await hybridAuthService.loginDemo();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Demo login failed';
      onError?.(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your account using {providerName} authentication
        </p>
        <div className="flex items-center gap-2 mt-2">
          {hasEnterpriseFeatures && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              Enterprise Features Enabled
            </div>
          )}
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            Secure Form Validation
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 text-sm">Login successful!</p>
        </div>
      )}

      {/* OAuth Buttons (Only if Firebase is configured) */}
      {hasEnterpriseFeatures && (
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-700">Continue with GitHub</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.password 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500"
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo Login (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Demo Login (Development)
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Uses demo@orbit.com / password or admin@orbit.com / admin123
          </p>
        </div>
      )}

      {/* Auth Provider Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Protected by {providerName} authentication</p>
        {!hasEnterpriseFeatures && (
          <p className="text-orange-600 mt-1">
            Configure Firebase for enterprise features (OAuth, MFA)
          </p>
        )}
      </div>
    </div>
  );
};