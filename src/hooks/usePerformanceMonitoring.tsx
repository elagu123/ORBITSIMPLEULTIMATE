import React, { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '../services/performanceMonitor';

// =============================================================================
// PERFORMANCE MONITORING REACT HOOKS
// =============================================================================

/**
 * Hook to monitor component render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMonitor.trackComponentRender(componentName, renderTime);
  });
};

/**
 * Hook to track user interactions with performance timing
 */
export const useInteractionTracking = () => {
  const trackInteraction = useCallback((
    interactionType: string,
    targetElement: string,
    callback?: () => void
  ) => {
    const startTime = performance.now();
    
    const wrappedCallback = () => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackUserInteraction(interactionType, targetElement, duration);
      callback?.();
    };

    return wrappedCallback;
  }, []);

  const trackClick = useCallback((targetElement: string, callback?: () => void) => {
    return trackInteraction('click', targetElement, callback);
  }, [trackInteraction]);

  const trackFormSubmit = useCallback((formName: string, callback?: () => void) => {
    return trackInteraction('form_submit', formName, callback);
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackClick,
    trackFormSubmit
  };
};

/**
 * Hook to track API call performance
 */
export const useAPIPerformance = () => {
  const trackAPI = useCallback(async (
    url: string,
    method: string,
    apiCall: () => Promise<any>
  ): Promise<any> => {
    const startTime = performance.now();
    let status = 200;
    
    try {
      const result = await apiCall();
      return result;
    } catch (error: any) {
      status = error.status || error.response?.status || 500;
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      performanceMonitor.trackAPICall(url, method, duration, status);
    }
  }, []);

  return { trackAPI };
};

/**
 * Hook to create performance milestones
 */
export const usePerformanceMilestones = () => {
  const markMilestone = useCallback((name: string) => {
    performanceMonitor.markMilestone(name);
  }, []);

  const measureMilestone = useCallback((name: string, startMark: string, endMark: string) => {
    performanceMonitor.measureMilestone(name, startMark, endMark);
  }, []);

  const measureOperation = useCallback((
    operationName: string,
    operation: () => any
  ): any => {
    const startMark = `${operationName}-start`;
    const endMark = `${operationName}-end`;
    
    markMilestone(startMark);
    const result = operation();
    markMilestone(endMark);
    measureMilestone(operationName, startMark, endMark);
    
    return result;
  }, [markMilestone, measureMilestone]);

  const measureAsyncOperation = useCallback(async (
    operationName: string,
    operation: () => Promise<any>
  ): Promise<any> => {
    const startMark = `${operationName}-start`;
    const endMark = `${operationName}-end`;
    
    markMilestone(startMark);
    const result = await operation();
    markMilestone(endMark);
    measureMilestone(operationName, startMark, endMark);
    
    return result;
  }, [markMilestone, measureMilestone]);

  return {
    markMilestone,
    measureMilestone,
    measureOperation,
    measureAsyncOperation
  };
};

/**
 * Hook to monitor memory usage
 */
export const useMemoryMonitoring = () => {
  const getCurrentMemoryUsage = useCallback(() => {
    return performanceMonitor.getCurrentMemoryUsage();
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return performanceMonitor.getMetrics();
  }, []);

  return {
    getCurrentMemoryUsage,
    getPerformanceMetrics
  };
};

/**
 * HOC to wrap components with performance monitoring
 */
export const withPerformanceMonitoring = (
  WrappedComponent: React.ComponentType<any>,
  componentName?: string
) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const PerformanceMonitoredComponent = (props: any) => {
    useRenderPerformance(displayName);
    
    return <WrappedComponent {...props} />;
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return PerformanceMonitoredComponent;
};

/**
 * Hook for lazy loading performance
 */
export const useLazyLoadPerformance = (componentName: string) => {
  const measureLazyLoad = useCallback((loadingPromise: Promise<any>) => {
    const startTime = performance.now();
    
    return loadingPromise.then((component) => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(`${componentName}_lazy_load`, loadTime);
      return component;
    });
  }, [componentName]);

  return { measureLazyLoad };
};