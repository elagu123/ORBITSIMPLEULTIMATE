// =============================================================================
// PERFORMANCE MONITORING SERVICE
// =============================================================================

import { trackEvent } from './analytics';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number;      // First Contentful Paint
  LCP?: number;      // Largest Contentful Paint
  FID?: number;      // First Input Delay
  CLS?: number;      // Cumulative Layout Shift
  TTFB?: number;     // Time to First Byte
  
  // Custom Application Metrics
  pageLoadTime?: number;
  renderTime?: number;
  apiResponseTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
  
  // Navigation Metrics
  navigationStart?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  transferSize?: number;
  encodedBodySize?: number;
  decodedBodySize?: number;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  [key: string]: any;
}

// =============================================================================
// PERFORMANCE MONITOR CLASS
// =============================================================================

class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics = {};
  private isMonitoring = false;
  private reportingInterval: NodeJS.Timeout | null = null;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  initialize(): void {
    if (typeof window === 'undefined' || this.isMonitoring) return;

    try {
      this.setupPerformanceObserver();
      this.measureCoreWebVitals();
      this.measureNavigationTiming();
      this.measureResourceTiming();
      this.setupMemoryMonitoring();
      this.startPeriodicReporting();
      
      this.isMonitoring = true;
      console.log('📊 Performance monitoring initialized');
    } catch (error) {
      console.error('❌ Performance monitoring initialization failed:', error);
    }
  }

  // ==========================================================================
  // CORE WEB VITALS
  // ==========================================================================

  private setupPerformanceObserver(): void {
    if (!window.PerformanceObserver) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry as any);
        }
      });

      // Observe different types of performance entries
      const observeTypes = ['largest-contentful-paint', 'first-input', 'layout-shift'];
      
      observeTypes.forEach(type => {
        try {
          this.observer?.observe({ type, buffered: true });
        } catch (e) {
          console.warn(`Performance observer type ${type} not supported`);
        }
      });
    } catch (error) {
      console.warn('Performance observer not fully supported:', error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.metrics.LCP = entry.startTime;
        break;
      case 'first-input':
        this.metrics.FID = entry.duration;
        break;
      case 'layout-shift':
        if (!this.metrics.CLS) this.metrics.CLS = 0;
        this.metrics.CLS += (entry as any).value;
        break;
    }
  }

  private measureCoreWebVitals(): void {
    // First Contentful Paint
    const fcpEntries = performance.getEntriesByName('first-contentful-paint');
    if (fcpEntries.length > 0) {
      this.metrics.FCP = fcpEntries[0].startTime;
    }

    // Use Web Vitals library if available
    if ((window as any).webVitals) {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = (window as any).webVitals;
      
      getCLS((metric: any) => {
        this.metrics.CLS = metric.value;
        this.reportMetric('CLS', metric.value, this.getWebVitalRating('CLS', metric.value));
      });
      
      getFID((metric: any) => {
        this.metrics.FID = metric.value;
        this.reportMetric('FID', metric.value, this.getWebVitalRating('FID', metric.value));
      });
      
      getFCP((metric: any) => {
        this.metrics.FCP = metric.value;
        this.reportMetric('FCP', metric.value, this.getWebVitalRating('FCP', metric.value));
      });
      
      getLCP((metric: any) => {
        this.metrics.LCP = metric.value;
        this.reportMetric('LCP', metric.value, this.getWebVitalRating('LCP', metric.value));
      });
      
      getTTFB((metric: any) => {
        this.metrics.TTFB = metric.value;
        this.reportMetric('TTFB', metric.value, this.getWebVitalRating('TTFB', metric.value));
      });
    }
  }

  private getWebVitalRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: { [key: string]: [number, number] } = {
      'CLS': [0.1, 0.25],
      'FID': [100, 300],
      'FCP': [1800, 3000],
      'LCP': [2500, 4000],
      'TTFB': [800, 1800]
    };

    const [goodThreshold, poorThreshold] = thresholds[metric] || [0, 0];
    
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  }

  // ==========================================================================
  // NAVIGATION AND RESOURCE TIMING
  // ==========================================================================

  private measureNavigationTiming(): void {
    if (!performance.timing) return;

    const timing = performance.timing;
    
    this.metrics.navigationStart = timing.navigationStart;
    this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
    this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    this.metrics.TTFB = timing.responseStart - timing.navigationStart;

    // Report navigation metrics
    this.reportMetric('pageLoadTime', this.metrics.pageLoadTime);
    this.reportMetric('domContentLoaded', this.metrics.domContentLoaded);
  }

  private measureResourceTiming(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceMetrics: ResourceTiming[] = [];

    resources.forEach(resource => {
      const resourceMetric: ResourceTiming = {
        name: this.getResourceName(resource.name),
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: this.getResourceType(resource.name),
        transferSize: resource.transferSize,
        encodedBodySize: resource.encodedBodySize,
        decodedBodySize: resource.decodedBodySize
      };
      
      resourceMetrics.push(resourceMetric);
    });

    // Analyze bundle sizes
    this.analyzeBundleSizes(resourceMetrics);
    
    // Track slow resources
    this.trackSlowResources(resourceMetrics);
  }

  private getResourceName(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return path.split('/').pop() || path;
    } catch {
      return url;
    }
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['js', 'mjs', 'jsx'].includes(extension || '')) return 'script';
    if (['css'].includes(extension || '')) return 'stylesheet';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
    if (url.includes('api/')) return 'api';
    
    return 'other';
  }

  private analyzeBundleSizes(resources: ResourceTiming[]): void {
    const jsResources = resources.filter(r => r.type === 'script');
    const cssResources = resources.filter(r => r.type === 'stylesheet');
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    
    this.metrics.bundleSize = totalJSSize + totalCSSSize;
    
    // Report bundle analysis
    trackEvent('performance_bundle_analysis', {
      totalJSSize: Math.round(totalJSSize / 1024), // KB
      totalCSSSize: Math.round(totalCSSSize / 1024), // KB
      jsFileCount: jsResources.length,
      cssFileCount: cssResources.length,
      totalSize: Math.round((totalJSSize + totalCSSSize) / 1024) // KB
    });
  }

  private trackSlowResources(resources: ResourceTiming[]): void {
    const slowResources = resources.filter(r => r.duration > 1000); // > 1s
    
    slowResources.forEach(resource => {
      trackEvent('performance_slow_resource', {
        resourceName: resource.name,
        resourceType: resource.type,
        duration: Math.round(resource.duration),
        size: Math.round(resource.size / 1024) // KB
      });
    });
  }

  // ==========================================================================
  // MEMORY MONITORING
  // ==========================================================================

  private setupMemoryMonitoring(): void {
    if (!(performance as any).memory) return;

    const measureMemory = () => {
      const memory = (performance as any).memory;
      
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      
      const memoryMetrics = {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
        usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
      };
      
      // Alert if memory usage is high
      if (memoryMetrics.usage > 80) {
        trackEvent('performance_high_memory_usage', memoryMetrics);
      }
      
      return memoryMetrics;
    };

    // Initial measurement
    measureMemory();
    
    // Periodic measurement
    setInterval(measureMemory, 30000); // Every 30 seconds
  }

  // ==========================================================================
  // API PERFORMANCE TRACKING
  // ==========================================================================

  trackAPICall(url: string, method: string, duration: number, status: number): void {
    const apiMetric = {
      url: this.sanitizeURL(url),
      method,
      duration: Math.round(duration),
      status,
      timestamp: Date.now()
    };

    trackEvent('performance_api_call', apiMetric);

    // Track slow API calls
    if (duration > 2000) {
      trackEvent('performance_slow_api', {
        ...apiMetric,
        severity: duration > 5000 ? 'critical' : 'warning'
      });
    }
  }

  private sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove query parameters and sensitive data
      return `${urlObj.origin}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  // ==========================================================================
  // COMPONENT PERFORMANCE TRACKING
  // ==========================================================================

  trackComponentRender(componentName: string, renderTime: number): void {
    trackEvent('performance_component_render', {
      component: componentName,
      renderTime: Math.round(renderTime),
      timestamp: Date.now()
    });

    // Track slow component renders
    if (renderTime > 16) { // > 1 frame at 60fps
      trackEvent('performance_slow_component', {
        component: componentName,
        renderTime: Math.round(renderTime),
        severity: renderTime > 100 ? 'critical' : 'warning'
      });
    }
  }

  measureComponentPerformance<T>(componentName: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.trackComponentRender(componentName, endTime - startTime);
    
    return result;
  }

  // ==========================================================================
  // USER INTERACTION TRACKING
  // ==========================================================================

  trackUserInteraction(interactionType: string, targetElement: string, duration?: number): void {
    trackEvent('performance_user_interaction', {
      interactionType,
      targetElement,
      duration: duration ? Math.round(duration) : undefined,
      timestamp: Date.now()
    });
  }

  // ==========================================================================
  // REPORTING AND ANALYTICS
  // ==========================================================================

  private reportMetric(metricName: string, value: number, rating?: string): void {
    trackEvent('performance_metric', {
      metric: metricName,
      value: Math.round(value),
      rating,
      timestamp: Date.now()
    });
  }

  private startPeriodicReporting(): void {
    // Report performance summary every 2 minutes
    this.reportingInterval = setInterval(() => {
      this.reportPerformanceSummary();
    }, 120000);
  }

  private reportPerformanceSummary(): void {
    const summary = {
      ...this.metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100), // Truncated
      connection: this.getConnectionInfo(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    trackEvent('performance_summary', summary);
  }

  private getConnectionInfo(): any {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getCurrentMemoryUsage(): number | null {
    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize : null;
  }

  markMilestone(name: string): void {
    performance.mark(name);
    trackEvent('performance_milestone', {
      milestone: name,
      timestamp: Date.now()
    });
  }

  measureMilestone(name: string, startMark: string, endMark: string): void {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        trackEvent('performance_measure', {
          measure: name,
          duration: Math.round(measure.duration),
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('🧹 Performance monitoring cleanup completed');
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize performance monitoring
if (typeof window !== 'undefined') {
  // Wait for page load to start monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.initialize();
    });
  } else {
    performanceMonitor.initialize();
  }
}

export default performanceMonitor;