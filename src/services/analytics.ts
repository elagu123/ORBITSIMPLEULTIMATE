import mixpanel from 'mixpanel-browser';

// =============================================================================
// ANALYTICS CONFIGURATION
// =============================================================================

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  plan?: string;
  industry?: string;
  companySize?: string;
  signupDate?: string;
  lastLoginDate?: string;
}

export interface BusinessMetrics {
  revenue?: number;
  mrr?: number; // Monthly Recurring Revenue
  churnRate?: number;
  ltv?: number; // Lifetime Value
  acquisitionChannel?: string;
  conversionRate?: number;
}

// =============================================================================
// ANALYTICS SERVICE
// =============================================================================

class AnalyticsService {
  private isInitialized = false;
  private enabledProviders: Set<string> = new Set();
  private debugMode = false;
  private userId: string | null = null;
  private userProperties: UserProperties = {};

  // Google Analytics Configuration
  private gaTrackingId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  // Mixpanel Configuration  
  private mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.debugMode = import.meta.env.MODE === 'development';

    if (this.debugMode) {
      console.log('🔍 Analytics Service: Initializing in development mode');
    }

    // Set initialized early to prevent race conditions
    this.isInitialized = true;

    // Initialize Google Analytics
    await this.initializeGoogleAnalytics();

    // Initialize Mixpanel
    await this.initializeMixpanel();

    // Track initialization (call after setting isInitialized)
    this.track('analytics_initialized', {
      providers: Array.from(this.enabledProviders),
      environment: import.meta.env.MODE
    });
  }

  private async initializeGoogleAnalytics(): Promise<void> {
    if (!this.gaTrackingId) {
      if (this.debugMode) {
        console.log('⚠️ Google Analytics: No tracking ID provided');
      }
      return;
    }

    try {
      // Load Google Analytics gtag
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaTrackingId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.gaTrackingId, {
        // Privacy-focused configuration
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        
        // Enhanced measurement
        enhanced_measurements: {
          scrolls: true,
          outbound_clicks: true,
          site_search: true,
          video_engagement: true,
          file_downloads: true
        }
      });

      this.enabledProviders.add('google_analytics');
      
      if (this.debugMode) {
        console.log('✅ Google Analytics initialized:', this.gaTrackingId);
      }
    } catch (error) {
      console.error('❌ Google Analytics initialization failed:', error);
    }
  }

  private async initializeMixpanel(): Promise<void> {
    if (!this.mixpanelToken) {
      if (this.debugMode) {
        console.log('⚠️ Mixpanel: No token provided');
      }
      return;
    }

    try {
      mixpanel.init(this.mixpanelToken, {
        // Privacy and GDPR compliance
        opt_out_tracking_by_default: false,
        respect_dnt: true,
        
        // Data configuration
        persistence: 'localStorage',
        cross_subdomain_cookie: false,
        secure_cookie: true,
        
        // Debug mode
        debug: this.debugMode,
        
        // Batch requests for better performance
        batch_requests: true,
        batch_size: 50,
        
        // IP geolocation
        ip: false // Don't track IP for privacy
      });

      this.enabledProviders.add('mixpanel');
      
      if (this.debugMode) {
        console.log('✅ Mixpanel initialized:', this.mixpanelToken);
      }
    } catch (error) {
      console.error('❌ Mixpanel initialization failed:', error);
    }
  }

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  identify(userId: string, properties: UserProperties = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call initialize() first.');
      return;
    }

    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties, userId };

    // Google Analytics - Set user ID
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('config', this.gaTrackingId!, {
        user_id: userId,
        custom_map: {
          custom_dimension_1: 'user_role',
          custom_dimension_2: 'user_plan',
          custom_dimension_3: 'user_industry'
        }
      });
    }

    // Mixpanel - Identify user
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.identify(userId);
      mixpanel.people.set(properties);
    }

    if (this.debugMode) {
      console.log('👤 User identified:', userId, properties);
    }
  }

  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };

    // Google Analytics - Set user properties
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('event', 'user_properties', properties);
    }

    // Mixpanel - Set user properties
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.people.set(properties);
    }

    if (this.debugMode) {
      console.log('📝 User properties updated:', properties);
    }
  }

  // ==========================================================================
  // EVENT TRACKING
  // ==========================================================================

  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call initialize() first.');
      return;
    }

    const eventData: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        user_id: this.userId,
        environment: import.meta.env.MODE,
        page_url: window.location.href,
        page_title: document.title
      },
      userId: this.userId || undefined,
      timestamp: Date.now()
    };

    // Google Analytics - Track event
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('event', eventName, {
        event_category: properties.category || 'general',
        event_label: properties.label,
        value: properties.value,
        custom_parameter_1: properties.custom1,
        custom_parameter_2: properties.custom2,
        ...properties
      });
    }

    // Mixpanel - Track event
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.track(eventName, eventData.properties);
    }

    if (this.debugMode) {
      console.log('📊 Event tracked:', eventName, eventData.properties);
    }
  }

  // ==========================================================================
  // BUSINESS METRICS
  // ==========================================================================

  trackRevenue(amount: number, currency = 'USD', properties: Record<string, any> = {}): void {
    this.track('revenue_recorded', {
      ...properties,
      revenue_amount: amount,
      currency,
      category: 'business_metrics'
    });

    // Google Analytics - Enhanced ecommerce
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('event', 'purchase', {
        transaction_id: properties.transactionId || `txn_${Date.now()}`,
        value: amount,
        currency,
        items: properties.items || []
      });
    }

    // Mixpanel - Track revenue
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.track('$purchase', {
        $amount: amount,
        $currency: currency,
        ...properties
      });
    }
  }

  trackBusinessMetrics(metrics: BusinessMetrics): void {
    // Google Analytics - Send business metrics as custom events
    if (this.enabledProviders.has('google_analytics')) {
      Object.entries(metrics).forEach(([key, value]) => {
        window.gtag?.('event', 'business_metric', {
          metric_name: key,
          metric_value: value,
          event_category: 'business_intelligence'
        });
      });
    }

    // Mixpanel - Set business metrics as user properties
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.people.set(metrics);
    }

    this.track('business_metrics_updated', {
      ...metrics,
      category: 'business_intelligence'
    });
  }

  // ==========================================================================
  // FEATURE USAGE TRACKING
  // ==========================================================================

  trackFeatureUsage(featureName: string, action: string, properties: Record<string, any> = {}): void {
    this.track('feature_used', {
      feature_name: featureName,
      feature_action: action,
      ...properties,
      category: 'feature_usage'
    });
  }

  trackPageView(pageName: string, properties: Record<string, any> = {}): void {
    // Google Analytics - Track page view
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('config', this.gaTrackingId!, {
        page_title: pageName,
        page_location: window.location.href
      });
    }

    // Mixpanel - Track page view
    this.track('page_viewed', {
      page_name: pageName,
      ...properties,
      category: 'navigation'
    });
  }

  trackConversion(conversionType: string, properties: Record<string, any> = {}): void {
    this.track('conversion', {
      conversion_type: conversionType,
      ...properties,
      category: 'conversions'
    });

    // Google Analytics - Track conversion
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('event', 'conversion', {
        send_to: `${this.gaTrackingId}/${conversionType}`,
        ...properties
      });
    }
  }

  // ==========================================================================
  // ERROR AND PERFORMANCE TRACKING
  // ==========================================================================

  trackError(error: Error, context: Record<string, any> = {}): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      ...context,
      category: 'errors'
    });
  }

  trackPerformance(metricName: string, value: number, properties: Record<string, any> = {}): void {
    this.track('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      ...properties,
      category: 'performance'
    });

    // Google Analytics - Track timing
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('event', 'timing_complete', {
        name: metricName,
        value: Math.round(value),
        event_category: 'performance'
      });
    }
  }

  // ==========================================================================
  // CAMPAIGN AND MARKETING TRACKING
  // ==========================================================================

  trackCampaign(source: string, medium: string, campaign: string, properties: Record<string, any> = {}): void {
    this.track('campaign_interaction', {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      ...properties,
      category: 'marketing'
    });
  }

  trackABTest(testName: string, variant: string, properties: Record<string, any> = {}): void {
    this.track('ab_test_exposure', {
      test_name: testName,
      test_variant: variant,
      ...properties,
      category: 'experimentation'
    });

    // Set user property for cohort analysis
    this.setUserProperties({
      [`ab_test_${testName}`]: variant
    });
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  reset(): void {
    this.userId = null;
    this.userProperties = {};

    // Google Analytics - Clear user data
    if (this.enabledProviders.has('google_analytics')) {
      window.gtag?.('config', this.gaTrackingId!, {
        user_id: null
      });
    }

    // Mixpanel - Reset user
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.reset();
    }

    if (this.debugMode) {
      console.log('🔄 Analytics data reset');
    }
  }

  getEnabledProviders(): string[] {
    return Array.from(this.enabledProviders);
  }

  isEnabled(provider: string): boolean {
    return this.enabledProviders.has(provider);
  }

  // GDPR Compliance
  optOut(): void {
    // Google Analytics - Opt out
    if (this.enabledProviders.has('google_analytics')) {
      window[`ga-disable-${this.gaTrackingId}`] = true;
    }

    // Mixpanel - Opt out
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.opt_out_tracking();
    }

    if (this.debugMode) {
      console.log('🚫 Analytics tracking disabled');
    }
  }

  optIn(): void {
    // Google Analytics - Opt in
    if (this.enabledProviders.has('google_analytics')) {
      window[`ga-disable-${this.gaTrackingId}`] = false;
    }

    // Mixpanel - Opt in
    if (this.enabledProviders.has('mixpanel')) {
      mixpanel.opt_in_tracking();
    }

    if (this.debugMode) {
      console.log('✅ Analytics tracking enabled');
    }
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const analytics = new AnalyticsService();

// Convenience methods for common tracking patterns
export const trackEvent = (eventName: string, properties?: Record<string, any>) => 
  analytics.track(eventName, properties);

export const trackPageView = (pageName: string, properties?: Record<string, any>) => 
  analytics.trackPageView(pageName, properties);

export const trackFeature = (featureName: string, action: string, properties?: Record<string, any>) => 
  analytics.trackFeatureUsage(featureName, action, properties);

export const identifyUser = (userId: string, properties?: UserProperties) => 
  analytics.identify(userId, properties);

export const trackConversion = (conversionType: string, properties?: Record<string, any>) => 
  analytics.trackConversion(conversionType, properties);

// Initialize analytics on import (auto-initialization)
analytics.initialize().catch(console.error);

export default analytics;