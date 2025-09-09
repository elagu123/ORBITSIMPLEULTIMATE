// =============================================================================
// ANALYTICS TYPE DEFINITIONS
// =============================================================================

// Google Analytics gtag types
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    [key: `ga-disable-${string}`]: boolean;
  }
}

// Google Analytics gtag function interface
export interface GtagFunction {
  (command: 'config', targetId: string, config?: any): void;
  (command: 'event', eventName: string, eventParameters?: any): void;
  (command: 'js', date: Date): void;
  (command: 'set', config: any): void;
  (...args: any[]): void;
}

export {};