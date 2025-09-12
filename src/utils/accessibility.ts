// Accessibility utilities for WCAG 2.1 AA compliance

/**
 * Generate unique IDs for ARIA relationships
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get ARIA properties for form fields with validation
 */
export const getFormFieldProps = (
  fieldName: string,
  error?: string,
  required?: boolean,
  describedBy?: string
) => {
  const errorId = error ? `${fieldName}-error` : undefined;
  const helpId = describedBy ? `${fieldName}-help` : undefined;
  
  const ariaDescribedBy = [errorId, helpId].filter(Boolean).join(' ');
  
  return {
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-describedby': ariaDescribedBy || undefined,
    id: fieldName,
  };
};

/**
 * Get ARIA properties for error messages
 */
export const getErrorMessageProps = (fieldName: string) => ({
  id: `${fieldName}-error`,
  role: 'alert',
  'aria-live': 'polite' as const,
});

/**
 * Get ARIA properties for help text
 */
export const getHelpTextProps = (fieldName: string) => ({
  id: `${fieldName}-help`,
});

/**
 * Check if an element has sufficient color contrast
 * @param foreground - foreground color in hex
 * @param background - background color in hex
 * @param level - WCAG level ('AA' or 'AAA')
 */
export const checkColorContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const minRatio = level === 'AAA' ? 7 : 4.5;
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= minRatio;
};

/**
 * Calculate color contrast ratio between two colors
 */
const calculateContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Get relative luminance of a color
 */
const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Handle keyboard navigation for interactive elements
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  callbacks: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
) => {
  const { key } = event;
  
  switch (key) {
    case KeyboardKeys.ENTER:
      event.preventDefault();
      callbacks.onEnter?.();
      break;
    case KeyboardKeys.SPACE:
      event.preventDefault();
      callbacks.onSpace?.();
      break;
    case KeyboardKeys.ESCAPE:
      callbacks.onEscape?.();
      break;
    case KeyboardKeys.ARROW_UP:
      event.preventDefault();
      callbacks.onArrowUp?.();
      break;
    case KeyboardKeys.ARROW_DOWN:
      event.preventDefault();
      callbacks.onArrowDown?.();
      break;
    case KeyboardKeys.ARROW_LEFT:
      callbacks.onArrowLeft?.();
      break;
    case KeyboardKeys.ARROW_RIGHT:
      callbacks.onArrowRight?.();
      break;
  }
};

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Trap focus within an element
   */
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Return focus to a previously focused element
   */
  returnFocus: (element: HTMLElement) => {
    element.focus();
  },

  /**
   * Set focus to the first error in a form
   */
  focusFirstError: (formElement: HTMLElement) => {
    const firstError = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (firstError) {
      firstError.focus();
    }
  },
};

/**
 * Screen reader utilities
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Get WCAG-compliant button properties
 */
export const getButtonProps = (
  options: {
    disabled?: boolean;
    pressed?: boolean;
    expanded?: boolean;
    controls?: string;
    describedBy?: string;
    label?: string;
  } = {}
) => ({
  type: 'button' as const,
  'aria-disabled': options.disabled,
  'aria-pressed': options.pressed,
  'aria-expanded': options.expanded,
  'aria-controls': options.controls,
  'aria-describedby': options.describedBy,
  'aria-label': options.label,
  tabIndex: options.disabled ? -1 : 0,
});

/**
 * Get WCAG-compliant modal/dialog properties
 */
export const getModalProps = (titleId: string, descriptionId?: string) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': titleId,
  'aria-describedby': descriptionId,
  tabIndex: -1,
});

/**
 * Get properties for skip links
 */
export const getSkipLinkProps = (targetId: string) => ({
  href: `#${targetId}`,
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded',
});

/**
 * Color blindness-safe color palette
 */
export const accessibleColors = {
  // Safe colors for color-blind users
  primary: '#0066CC',     // Blue
  secondary: '#CC6600',   // Orange
  success: '#228B22',     // Forest Green
  warning: '#FFD700',     // Gold
  danger: '#CC0000',      // Red
  info: '#17A2B8',        // Teal
  
  // High contrast variants
  highContrast: {
    primary: '#000080',   // Navy
    secondary: '#FF6600', // Bright Orange
    success: '#006400',   // Dark Green
    warning: '#FF8C00',   // Dark Orange
    danger: '#8B0000',    // Dark Red
  }
};

/**
 * Check if reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation properties that respect user preferences
 */
export const getAnimationProps = (
  animation: object,
  reducedMotionFallback?: object
) => {
  return prefersReducedMotion() 
    ? (reducedMotionFallback || { transition: 'none' })
    : animation;
};