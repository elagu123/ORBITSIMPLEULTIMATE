import React, { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// =============================================================================
// LAZY LOADING WRAPPER
// =============================================================================

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
  preload?: boolean;
}

/**
 * Enhanced lazy loading wrapper with error handling and preloading
 */
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions = {}
) => {
  const LazyComponent = lazy(importFn);
  
  const WrappedComponent: React.FC<P> = (props) => {
    const fallback = options.fallback || <LoadingSpinner />;
    
    return (
      <Suspense fallback={fallback}>
        {options.errorBoundary ? (
          <LazyErrorBoundary>
            <LazyComponent {...props} />
          </LazyErrorBoundary>
        ) : (
          <LazyComponent {...props} />
        )}
      </Suspense>
    );
  };
  
  // Add preload method
  WrappedComponent.preload = () => {
    importFn();
  };
  
  return WrappedComponent;
};

// =============================================================================
// LOADING COMPONENTS
// =============================================================================

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

const PageLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Loading page...</h3>
        <p className="text-sm text-gray-600">Please wait while we load your content</p>
      </div>
    </div>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 bg-gray-300 rounded"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

// =============================================================================
// ERROR BOUNDARY
// =============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Failed to load component
            </h3>
            <p className="text-sm text-red-600 mb-4">
              There was an error loading this part of the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// LAZY LOADED COMPONENTS
// =============================================================================

// Page Components (Largest impact on initial load)
export const LazyDashboard = createLazyComponent(
  () => import('../../app/dashboard/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

export const LazyAIStrategy = createLazyComponent(
  () => import('../../app/aistrategy/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

export const LazyContent = createLazyComponent(
  () => import('../../app/content/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

export const LazyCalendar = createLazyComponent(
  () => import('../../app/calendar/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

export const LazyCustomers = createLazyComponent(
  () => import('../../app/customers/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

export const LazySystems = createLazyComponent(
  () => import('../../app/systems/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

export const LazySettings = createLazyComponent(
  () => import('../../app/settings/page'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

// Heavy Feature Components (Only include existing components)
export const LazyMarketingCalendar = createLazyComponent(
  () => import('../features/calendar/MarketingCalendar'),
  { fallback: <SkeletonCard />, errorBoundary: true }
);

export const LazyAdvancedContentGenerator = createLazyComponent(
  () => import('../features/content/AdvancedContentGenerator'),
  { fallback: <SkeletonCard />, errorBoundary: true }
);

// Fallback for onboarding - use existing component
export const LazyEnhancedOnboardingWizard = createLazyComponent(
  () => import('../features/onboarding/OnboardingWizard'),
  { fallback: <PageLoadingSpinner />, errorBoundary: true }
);

// =============================================================================
// PRELOADING UTILITIES
// =============================================================================

/**
 * Preload components based on user interaction patterns
 */
export const preloadComponents = {
  // Preload dashboard when user logs in
  dashboard: () => {
    LazyDashboard.preload();
  },
  
  // Preload content tools when user navigates to content
  content: () => {
    LazyContent.preload();
    LazyAdvancedContentGenerator.preload();
  },
  
  // Preload calendar when user shows interest in scheduling
  calendar: () => {
    LazyCalendar.preload();
    LazyMarketingCalendar.preload();
  },
  
  // Preload all critical components (for fast networks)
  all: () => {
    LazyDashboard.preload();
    LazyContent.preload();
    LazyCalendar.preload();
    LazyCustomers.preload();
  }
};

/**
 * Intelligent preloading based on connection speed
 */
export const intelligentPreload = () => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // Only preload on fast connections
    if (connection && connection.effectiveType === '4g') {
      // Preload critical components after 2 seconds
      setTimeout(() => {
        preloadComponents.all();
      }, 2000);
    } else if (connection && connection.effectiveType === '3g') {
      // Preload only dashboard on medium connections
      setTimeout(() => {
        preloadComponents.dashboard();
      }, 3000);
    }
    // Don't preload on slow connections
  } else {
    // Default preloading for unknown connections
    setTimeout(() => {
      preloadComponents.dashboard();
    }, 2000);
  }
};

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Monitor lazy loading performance
 */
export const monitorLazyLoading = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    onLoad: () => {
      const loadTime = performance.now() - startTime;
      console.log(`📊 Lazy component "${componentName}" loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'lazy_component_load', {
          component_name: componentName,
          load_time: Math.round(loadTime)
        });
      }
    }
  };
};