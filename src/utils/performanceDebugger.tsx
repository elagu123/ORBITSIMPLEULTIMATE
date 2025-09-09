import React, { useRef, useEffect } from 'react';

interface RenderCounterProps {
  name: string;
  enabled?: boolean;
}

/**
 * Debug component to track re-renders
 * Only runs in development mode
 */
export const RenderCounter: React.FC<RenderCounterProps> = ({ 
  name, 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    if (enabled) {
      renderCount.current++;
      console.log(`🔄 ${name} rendered ${renderCount.current} times`);
    }
  });

  return null;
};

/**
 * Hook to track component re-renders and identify causes
 */
export const useRenderTracker = (componentName: string, deps: Record<string, any>) => {
  const prevDeps = useRef<Record<string, any>>();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (prevDeps.current) {
        const changedDeps = Object.keys(deps).filter(
          key => deps[key] !== prevDeps.current![key]
        );
        
        if (changedDeps.length > 0) {
          console.log(`🔄 ${componentName} re-rendered due to:`, changedDeps);
          changedDeps.forEach(key => {
            console.log(`   ${key}:`, prevDeps.current![key], '->', deps[key]);
          });
        }
      }
      prevDeps.current = deps;
    }
  });
};

/**
 * Performance profiler component
 */
export const PerformanceProfiler: React.FC<{ 
  id: string; 
  children: React.ReactNode;
  onRender?: (id: string, phase: string, actualDuration: number) => void;
}> = ({ id, children, onRender }) => {
  const handleRender = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<any>
  ) => {
    if (process.env.NODE_ENV === 'development') {
      const isSlowRender = actualDuration > 16; // More than one frame (16ms)
      
      if (isSlowRender) {
        console.warn(
          `⚠️ Slow render detected in ${id}:`,
          `${actualDuration.toFixed(2)}ms (${phase})`
        );
      }

      if (onRender) {
        onRender(id, phase, actualDuration);
      }
    }
  };

  return (
    <React.Profiler id={id} onRender={handleRender}>
      {children}
    </React.Profiler>
  );
};

/**
 * Memory usage tracker
 */
export const useMemoryTracker = (componentName: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`💾 ${componentName} - Memory usage:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }
  });
};

/**
 * Component that displays performance metrics in development
 */
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = React.useState<{
    renders: Record<string, number>;
    slowRenders: string[];
  }>({
    renders: {},
    slowRenders: []
  });

  const handleRender = (id: string, phase: string, duration: number) => {
    setMetrics(prev => ({
      renders: {
        ...prev.renders,
        [id]: (prev.renders[id] || 0) + 1
      },
      slowRenders: duration > 16 
        ? [...prev.slowRenders.slice(-10), `${id} (${duration.toFixed(2)}ms)`]
        : prev.slowRenders
    }));
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 10000,
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <h4>🔍 Performance Monitor</h4>
      <div>
        <strong>Render Counts:</strong>
        {Object.entries(metrics.renders).map(([id, count]) => (
          <div key={id}>{id}: {count}</div>
        ))}
      </div>
      {metrics.slowRenders.length > 0 && (
        <div>
          <strong>⚠️ Slow Renders:</strong>
          {metrics.slowRenders.slice(-3).map((render, i) => (
            <div key={i} style={{ color: '#ff6b6b' }}>{render}</div>
          ))}
        </div>
      )}
    </div>
  );
};