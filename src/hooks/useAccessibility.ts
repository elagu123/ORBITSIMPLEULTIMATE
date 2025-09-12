import React, { useEffect, useState, useCallback } from 'react';
import { 
  prefersReducedMotion, 
  checkColorContrast, 
  announceToScreenReader 
} from '../utils/accessibility';

/**
 * Hook for accessibility features and preferences
 */
export const useAccessibility = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    setReducedMotion(prefersReducedMotion());

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(highContrastQuery.matches);

    // Check for large text preference
    const largeTextQuery = window.matchMedia('(min-resolution: 192dpi)');
    setLargeText(largeTextQuery.matches);

    // Listen for changes
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    const handleTextChange = (e: MediaQueryListEvent) => setLargeText(e.matches);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', handleMotionChange);
    highContrastQuery.addEventListener('change', handleContrastChange);
    largeTextQuery.addEventListener('change', handleTextChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      highContrastQuery.removeEventListener('change', handleContrastChange);
      largeTextQuery.removeEventListener('change', handleTextChange);
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  return {
    preferences: {
      reducedMotion,
      highContrast,
      largeText,
    },
    announce,
    checkContrast: checkColorContrast,
  };
};

/**
 * Hook for focus management in modals and overlays
 */
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  callbacks: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }
) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      const { key } = event;
      
      switch (key) {
        case 'Enter':
          callbacks.onEnter?.();
          break;
        case ' ':
          event.preventDefault();
          callbacks.onSpace?.();
          break;
        case 'Escape':
          callbacks.onEscape?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          callbacks.onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          callbacks.onArrowDown?.();
          break;
        case 'ArrowLeft':
          callbacks.onArrowLeft?.();
          break;
        case 'ArrowRight':
          callbacks.onArrowRight?.();
          break;
        case 'Home':
          event.preventDefault();
          callbacks.onHome?.();
          break;
        case 'End':
          event.preventDefault();
          callbacks.onEnd?.();
          break;
      }
    },
    [callbacks]
  );

  return { handleKeyDown };
};

/**
 * Hook for responsive text sizing based on user preferences
 */
export const useResponsiveText = () => {
  const [textScale, setTextScale] = useState(1);

  useEffect(() => {
    // Check user's text scaling preference
    const checkTextScale = () => {
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const baseFontSize = 16; // Assume 16px as base
      setTextScale(fontSize / baseFontSize);
    };

    checkTextScale();
    window.addEventListener('resize', checkTextScale);

    return () => {
      window.removeEventListener('resize', checkTextScale);
    };
  }, []);

  const getScaledSize = useCallback((baseSize: number) => {
    return baseSize * textScale;
  }, [textScale]);

  return {
    textScale,
    getScaledSize,
    isLargeText: textScale > 1.2,
  };
};

/**
 * Hook for accessibility violations detection (development only)
 */
export const useA11yViolations = (enabled: boolean = process.env.NODE_ENV === 'development') => {
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const checkViolations = () => {
      const newViolations: string[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        newViolations.push(`${images.length} images missing alt text`);
      }

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      const emptyButtons = Array.from(buttons).filter(btn => !btn.textContent?.trim());
      if (emptyButtons.length > 0) {
        newViolations.push(`${emptyButtons.length} buttons without accessible names`);
      }

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputs).filter(input => {
        const id = input.getAttribute('id');
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      if (unlabeledInputs.length > 0) {
        newViolations.push(`${unlabeledInputs.length} form inputs without labels`);
      }

      setViolations(newViolations);
    };

    // Check violations on mount and when DOM changes
    checkViolations();
    
    const observer = new MutationObserver(checkViolations);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  return violations;
};