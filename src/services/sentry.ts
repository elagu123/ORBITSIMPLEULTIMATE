import * as Sentry from '@sentry/react';

// Sentry configuration for Orbit Marketing Platform
export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '', // Set in environment variables
    environment: import.meta.env.MODE || 'development',
    
    // Performance monitoring
    integrations: [
      // Remove BrowserTracing as it's automatically included in v8
    ],

    // Performance monitoring sample rate (10% in production)
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session replay sample rate (5% in production)
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.05 : 0.1,
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Enhanced error tracking
    beforeSend: (event, hint) => {
      // Filter out development errors in production
      if (import.meta.env.MODE === 'development') {
        return event;
      }

      // Don't send events for cancelled network requests
      if (hint.originalException?.name === 'AbortError') {
        return null;
      }

      // Add custom context
      event.tags = {
        ...event.tags,
        component: 'orbit-marketing',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      };

      return event;
    },

    // Privacy settings - defaultIntegrations removed in v8
    
    // Debug in development only
    debug: import.meta.env.MODE === 'development',
    
    // Error filtering
    ignoreErrors: [
      // Ignore common browser errors
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'ChunkLoadError',
      // Network errors
      'NetworkError',
      'Failed to fetch',
    ],
    
    // URL sanitization for privacy
    beforeBreadcrumb: (breadcrumb) => {
      // Remove sensitive data from URLs
      if (breadcrumb.category === 'navigation' || breadcrumb.category === 'fetch') {
        // Remove API keys, tokens, etc. from URLs
        if (breadcrumb.data?.url) {
          breadcrumb.data.url = breadcrumb.data.url.replace(/[?&](api_key|token|password)=[^&]*/gi, '');
        }
      }
      return breadcrumb;
    },
  });
};

// Custom error boundary for React components
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Manual error reporting utilities
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

// User context management
export const setUserContext = (user: {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
}) => {
  Sentry.setUser(user);
};

// Custom tags and context
export const addBreadcrumb = (message: string, category?: string, level?: 'info' | 'warning' | 'error') => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now(),
  });
};

// Performance tracking - Updated for Sentry v8
export const startTransaction = (name: string, operation: string = 'navigation') => {
  return Sentry.startSpan({
    name,
    op: operation,
  }, () => {});
};

// API error tracking helper
export const trackAPIError = (endpoint: string, error: Error, statusCode?: number) => {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', endpoint);
    scope.setTag('status_code', statusCode?.toString() || 'unknown');
    scope.setContext('api_error', {
      endpoint,
      statusCode,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    });
    Sentry.captureException(error);
  });
};

// Component performance tracking
export const trackComponentError = (componentName: string, error: Error, props?: any) => {
  Sentry.withScope((scope) => {
    scope.setTag('component', componentName);
    scope.setContext('component_error', {
      componentName,
      props: props ? JSON.stringify(props, null, 2).substring(0, 500) : undefined,
      timestamp: new Date().toISOString(),
    });
    Sentry.captureException(error);
  });
};

// Feature usage tracking
export const trackFeatureUsage = (featureName: string, metadata?: Record<string, any>) => {
  addBreadcrumb(`Feature used: ${featureName}`, 'user_action', 'info');
  
  Sentry.withScope((scope) => {
    scope.setTag('feature', featureName);
    if (metadata) {
      scope.setContext('feature_metadata', metadata);
    }
    Sentry.captureMessage(`Feature used: ${featureName}`, 'info');
  });
};

export default {
  initSentry,
  SentryErrorBoundary,
  captureError,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  startTransaction,
  trackAPIError,
  trackComponentError,
  trackFeatureUsage,
};