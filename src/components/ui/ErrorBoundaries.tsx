import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Bug, Wifi, X } from './Icons';
import { trackComponentError, addBreadcrumb } from '../../services/sentry';

// =============================================================================
// ERROR TYPES AND INTERFACES
// =============================================================================

export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  errorInfo?: ErrorInfo;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  name?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

// =============================================================================
// ERROR REPORTING SERVICE
// =============================================================================

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errors: ErrorDetails[] = [];
  private maxErrors = 50;

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  logError(error: Error, errorInfo: ErrorInfo, context: Partial<ErrorDetails> = {}): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };

    this.errors.unshift(errorDetails);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Track error with Sentry
    trackComponentError(context.errorBoundary || 'Unknown', error, {
      errorInfo,
      errorId,
      level: context.level || 'component'
    });
    
    // Add breadcrumb for error context
    addBreadcrumb(
      `Error in ${context.errorBoundary || 'component'}: ${error.message}`,
      'error',
      'error'
    );

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${context.errorBoundary || 'Unknown'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    }

    return errorId;
  }

  getErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private sendToErrorService(errorDetails: ErrorDetails): void {
    // Implementation for sending to external error service
    // Example: Sentry, LogRocket, or custom API
  }
}

// =============================================================================
// BASE ERROR BOUNDARY
// =============================================================================

export class BaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;
  private errorReporter = ErrorReportingService.getInstance();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.errorReporter.logError(error, errorInfo, {
      errorBoundary: this.props.name || this.constructor.name,
      userId: 'current-user-id' // Get from auth context
    });

    this.setState({ errorId });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  retry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  autoRetry = (delay: number = 3000) => {
    this.retryTimeoutId = window.setTimeout(() => {
      this.retry();
    }, delay);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  protected renderDefaultFallback(): ReactNode {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Something went wrong
        </h3>
        <p className="text-red-700 dark:text-red-300 text-center mb-4">
          {this.state.error?.message || 'An unexpected error occurred'}
        </p>
        {this.state.errorId && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-4">
            Error ID: {this.state.errorId}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={this.retry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

// =============================================================================
// SPECIALIZED ERROR BOUNDARIES
// =============================================================================

export class PageErrorBoundary extends BaseErrorBoundary {
  protected renderDefaultFallback(): ReactNode {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Page Error
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This page encountered an error and couldn't load properly.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={this.retry}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export class ComponentErrorBoundary extends BaseErrorBoundary {
  protected renderDefaultFallback(): ReactNode {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Component Error
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              This component failed to render properly.
            </p>
            <button
              onClick={this.retry}
              className="text-sm text-yellow-800 dark:text-yellow-200 underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export class NetworkErrorBoundary extends BaseErrorBoundary {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    super.componentDidCatch(error, errorInfo);
    
    // Auto-retry for network errors after 5 seconds
    if (this.isNetworkError(error)) {
      this.autoRetry(5000);
    }
  }

  private isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('NetworkError');
  }

  protected renderDefaultFallback(): ReactNode {
    const isNetworkError = this.state.error && this.isNetworkError(this.state.error);
    
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Wifi className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {isNetworkError ? 'Network Error' : 'Connection Error'}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {isNetworkError ? 'Unable to connect to the server.' : 'A connection error occurred.'}
            </p>
            <button
              onClick={this.retry}
              className="text-sm text-blue-800 dark:text-blue-200 underline mt-2"
            >
              Retry connection
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// =============================================================================
// ERROR DASHBOARD (Development only)
// =============================================================================

export const ErrorDashboard: React.FC = () => {
  const [errors, setErrors] = React.useState<ErrorDetails[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const errorReporter = ErrorReportingService.getInstance();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setErrors(errorReporter.getErrors());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isOpen && errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && errors.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Bug className="w-4 h-4" />
          {errors.length} Error{errors.length !== 1 ? 's' : ''}
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-md w-full max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Error Dashboard
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No errors recorded</p>
          ) : (
            <div className="space-y-3">
              {errors.slice(0, 5).map((error, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <div className="text-sm font-medium text-red-900 dark:text-red-100">
                    {error.message}
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {error.errorBoundary} • {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => errorReporter.clearErrors()}
                  className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};