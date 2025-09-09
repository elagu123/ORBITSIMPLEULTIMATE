import { useEffect, useCallback, useRef } from 'react';
import { analytics, trackPageView, trackEvent, trackFeature } from '../services/analytics';

// =============================================================================
// ANALYTICS HOOKS
// =============================================================================

/**
 * Hook to track page views when component mounts
 */
export const usePageView = (pageName: string, properties: Record<string, any> = {}) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackPageView(pageName, {
        ...properties,
        timestamp: Date.now(),
        referrer: document.referrer
      });
      hasTracked.current = true;
    }
  }, [pageName, properties]);
};

/**
 * Hook to track events with convenient callback
 */
export const useEventTracking = () => {
  const trackEventWithCallback = useCallback((
    eventName: string, 
    properties: Record<string, any> = {},
    callback?: () => void
  ) => {
    trackEvent(eventName, properties);
    callback?.();
  }, []);

  return { trackEvent: trackEventWithCallback };
};

/**
 * Hook to track feature usage with timing
 */
export const useFeatureTracking = () => {
  const startTimeRef = useRef<number | null>(null);

  const startFeatureTimer = useCallback((featureName: string) => {
    startTimeRef.current = Date.now();
    trackFeature(featureName, 'started');
  }, []);

  const endFeatureTimer = useCallback((
    featureName: string, 
    properties: Record<string, any> = {}
  ) => {
    const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    trackFeature(featureName, 'completed', {
      ...properties,
      duration_ms: duration
    });
    startTimeRef.current = null;
  }, []);

  const trackFeatureClick = useCallback((
    featureName: string,
    element: string,
    properties: Record<string, any> = {}
  ) => {
    trackFeature(featureName, 'clicked', {
      ...properties,
      element,
      timestamp: Date.now()
    });
  }, []);

  return {
    startFeatureTimer,
    endFeatureTimer,
    trackFeatureClick,
    trackFeature: (name: string, action: string, props?: Record<string, any>) => 
      trackFeature(name, action, props)
  };
};

/**
 * Hook to track user interactions with forms
 */
export const useFormTracking = (formName: string) => {
  const trackFormStart = useCallback(() => {
    trackEvent('form_started', {
      form_name: formName,
      timestamp: Date.now()
    });
  }, [formName]);

  const trackFormSubmit = useCallback((success: boolean, errorMessage?: string) => {
    trackEvent(success ? 'form_submitted' : 'form_submit_failed', {
      form_name: formName,
      success,
      error_message: errorMessage,
      timestamp: Date.now()
    });
  }, [formName]);

  const trackFieldInteraction = useCallback((fieldName: string, action: 'focus' | 'blur' | 'change') => {
    trackEvent('form_field_interaction', {
      form_name: formName,
      field_name: fieldName,
      interaction_type: action,
      timestamp: Date.now()
    });
  }, [formName]);

  const trackValidationError = useCallback((fieldName: string, errorMessage: string) => {
    trackEvent('form_validation_error', {
      form_name: formName,
      field_name: fieldName,
      error_message: errorMessage,
      timestamp: Date.now()
    });
  }, [formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction,
    trackValidationError
  };
};

/**
 * Hook to track performance metrics
 */
export const usePerformanceTracking = () => {
  const trackLoadTime = useCallback((componentName: string, loadTime: number) => {
    analytics.trackPerformance('component_load_time', loadTime, {
      component_name: componentName
    });
  }, []);

  const trackAPIResponseTime = useCallback((endpoint: string, responseTime: number, status: number) => {
    analytics.trackPerformance('api_response_time', responseTime, {
      endpoint,
      status_code: status
    });
  }, []);

  const trackRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      trackLoadTime(componentName, renderTime);
    };
  }, [trackLoadTime]);

  return {
    trackLoadTime,
    trackAPIResponseTime,
    trackRenderTime
  };
};

/**
 * Hook to track business metrics and conversions
 */
export const useBusinessTracking = () => {
  const trackConversion = useCallback((
    conversionType: string,
    value?: number,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackConversion(conversionType, {
      ...properties,
      value,
      timestamp: Date.now()
    });
  }, []);

  const trackRevenue = useCallback((
    amount: number,
    currency = 'USD',
    properties: Record<string, any> = {}
  ) => {
    analytics.trackRevenue(amount, currency, {
      ...properties,
      timestamp: Date.now()
    });
  }, []);

  const trackSubscription = useCallback((
    action: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel',
    plan: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('subscription_changed', {
      action,
      plan,
      ...properties,
      category: 'subscription'
    });
  }, []);

  return {
    trackConversion,
    trackRevenue,
    trackSubscription
  };
};

/**
 * Hook to track A/B test exposure and interactions
 */
export const useExperimentTracking = () => {
  const trackExperiment = useCallback((
    experimentName: string,
    variant: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackABTest(experimentName, variant, properties);
  }, []);

  const trackExperimentConversion = useCallback((
    experimentName: string,
    variant: string,
    conversionEvent: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('experiment_conversion', {
      experiment_name: experimentName,
      variant,
      conversion_event: conversionEvent,
      ...properties
    });
  }, []);

  return {
    trackExperiment,
    trackExperimentConversion
  };
};

/**
 * Hook to track error occurrences for analytics
 */
export const useErrorTracking = () => {
  const trackError = useCallback((
    error: Error,
    context: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    properties: Record<string, any> = {}
  ) => {
    analytics.trackError(error, {
      context,
      severity,
      ...properties,
      timestamp: Date.now()
    });
  }, []);

  const trackUserError = useCallback((
    errorType: string,
    errorMessage: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('user_error', {
      error_type: errorType,
      error_message: errorMessage,
      ...properties,
      category: 'user_errors'
    });
  }, []);

  return {
    trackError,
    trackUserError
  };
};

// =============================================================================
// COMBINED ANALYTICS HOOK
// =============================================================================

/**
 * Master hook that provides access to all analytics functionality
 */
export const useAnalytics = () => {
  const eventTracking = useEventTracking();
  const featureTracking = useFeatureTracking();
  const performanceTracking = usePerformanceTracking();
  const businessTracking = useBusinessTracking();
  const experimentTracking = useExperimentTracking();
  const errorTracking = useErrorTracking();

  return {
    // Basic event tracking
    trackEvent: eventTracking.trackEvent,
    
    // Feature usage tracking
    ...featureTracking,
    
    // Performance tracking
    ...performanceTracking,
    
    // Business metrics
    ...businessTracking,
    
    // A/B testing
    ...experimentTracking,
    
    // Error tracking
    ...errorTracking,
    
    // Direct analytics instance access
    analytics
  };
};

export default useAnalytics;