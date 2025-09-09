import React, { useState, useEffect, useCallback } from 'react';
import { Activity, BarChart3, Clock, Database, Zap, Eye, EyeOff, RefreshCw } from '../ui/Icons';
import Button from '../ui/Button';
import { performanceMonitor, PerformanceMetrics } from '../../services/performanceMonitor';

// =============================================================================
// PERFORMANCE DEBUGGER COMPONENT
// =============================================================================

interface PerformanceDebuggerProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const PerformanceDebugger: React.FC<PerformanceDebuggerProps> = ({
  isVisible: initialVisible = false,
  position = 'bottom-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  // ==========================================================================
  // METRICS UPDATING
  // ==========================================================================

  const updateMetrics = useCallback(() => {
    const currentMetrics = performanceMonitor.getMetrics();
    const currentMemory = performanceMonitor.getCurrentMemoryUsage();
    
    setMetrics(currentMetrics);
    setMemoryUsage(currentMemory);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Initial update
    updateMetrics();

    // Update every second
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [isVisible, updateMetrics]);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getMetricColor = (value: number, thresholds: [number, number]): string => {
    const [good, poor] = thresholds;
    if (value <= good) return 'text-green-500';
    if (value <= poor) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWebVitalColor = (metric: string, value: number | undefined): string => {
    if (value === undefined) return 'text-gray-400';
    
    const thresholds: { [key: string]: [number, number] } = {
      'FCP': [1800, 3000],
      'LCP': [2500, 4000],
      'FID': [100, 300],
      'CLS': [0.1, 0.25],
      'TTFB': [800, 1800]
    };

    return getMetricColor(value, thresholds[metric] || [0, 0]);
  };

  // ==========================================================================
  // POSITION STYLES
  // ==========================================================================

  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed ${positionStyles[position]} z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors`}
        title="Show Performance Debugger"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className={`fixed ${positionStyles[position]} z-50 ${className}`}>
      <div className="bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-800 rounded"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button
              onClick={updateMetrics}
              className="p-1 hover:bg-gray-800 rounded"
              title="Refresh Metrics"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-800 rounded text-red-400"
              title="Hide Debugger"
            >
              ×
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-3 space-y-2">
          {/* Memory Usage */}
          {memoryUsage && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-purple-400" />
                <span>Memory</span>
              </div>
              <span className={memoryUsage > 50 * 1024 * 1024 ? 'text-red-400' : 'text-green-400'}>
                {formatBytes(memoryUsage)}
              </span>
            </div>
          )}

          {/* Page Load Time */}
          {metrics.pageLoadTime && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>Load Time</span>
              </div>
              <span className={getWebVitalColor('pageLoadTime', metrics.pageLoadTime)}>
                {formatTime(metrics.pageLoadTime)}
              </span>
            </div>
          )}

          {/* Bundle Size */}
          {metrics.bundleSize && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-3 h-3 text-orange-400" />
                <span>Bundle</span>
              </div>
              <span className={getMetricColor(metrics.bundleSize, [500 * 1024, 1024 * 1024])}>
                {formatBytes(metrics.bundleSize)}
              </span>
            </div>
          )}
        </div>

        {/* Expanded Metrics */}
        {isExpanded && (
          <div className="border-t border-gray-700 p-3 space-y-3">
            {/* Core Web Vitals */}
            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Core Web Vitals
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>FCP:</span>
                    <span className={getWebVitalColor('FCP', metrics.FCP)}>
                      {metrics.FCP ? formatTime(metrics.FCP) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span className={getWebVitalColor('LCP', metrics.LCP)}>
                      {metrics.LCP ? formatTime(metrics.LCP) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>FID:</span>
                    <span className={getWebVitalColor('FID', metrics.FID)}>
                      {metrics.FID ? formatTime(metrics.FID) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>CLS:</span>
                    <span className={getWebVitalColor('CLS', metrics.CLS)}>
                      {metrics.CLS ? metrics.CLS.toFixed(3) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TTFB:</span>
                    <span className={getWebVitalColor('TTFB', metrics.TTFB)}>
                      {metrics.TTFB ? formatTime(metrics.TTFB) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Timing */}
            {(metrics.domContentLoaded || metrics.loadComplete) && (
              <div>
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Navigation</h4>
                <div className="space-y-1 text-xs">
                  {metrics.domContentLoaded && (
                    <div className="flex justify-between">
                      <span>DOM Loaded:</span>
                      <span>{formatTime(metrics.domContentLoaded)}</span>
                    </div>
                  )}
                  {metrics.loadComplete && (
                    <div className="flex justify-between">
                      <span>Load Complete:</span>
                      <span>{formatTime(metrics.loadComplete)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Grade */}
            <div className="pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Performance Grade:</span>
                <span className={`text-xs font-bold ${getPerformanceGrade(metrics).color}`}>
                  {getPerformanceGrade(metrics).grade}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// HELPER FUNCTION FOR PERFORMANCE GRADING
// =============================================================================

const getPerformanceGrade = (metrics: PerformanceMetrics): { grade: string; color: string } => {
  let score = 100;
  
  // Deduct points for poor metrics
  if (metrics.LCP && metrics.LCP > 4000) score -= 20;
  else if (metrics.LCP && metrics.LCP > 2500) score -= 10;
  
  if (metrics.FID && metrics.FID > 300) score -= 20;
  else if (metrics.FID && metrics.FID > 100) score -= 10;
  
  if (metrics.CLS && metrics.CLS > 0.25) score -= 20;
  else if (metrics.CLS && metrics.CLS > 0.1) score -= 10;
  
  if (metrics.pageLoadTime && metrics.pageLoadTime > 5000) score -= 15;
  else if (metrics.pageLoadTime && metrics.pageLoadTime > 3000) score -= 8;
  
  if (score >= 90) return { grade: 'A', color: 'text-green-400' };
  if (score >= 80) return { grade: 'B', color: 'text-yellow-400' };
  if (score >= 70) return { grade: 'C', color: 'text-orange-400' };
  if (score >= 60) return { grade: 'D', color: 'text-red-400' };
  return { grade: 'F', color: 'text-red-500' };
};

export default PerformanceDebugger;