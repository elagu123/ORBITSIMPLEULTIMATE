import React, { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { getButtonProps, getAnimationProps } from '../../utils/accessibility';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  describedBy?: string;
  as?: 'button' | 'a' | 'div';
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  pressed,
  expanded,
  controls,
  describedBy,
  className = '',
  onClick,
  as = 'button',
  ...props
}, ref) => {
  const { preferences } = useAccessibility();

  // Base classes
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2 font-medium 
    rounded-lg transition-all duration-200 ease-out focus:outline-none 
    focus:ring-2 focus:ring-offset-2 focus:ring-offset-white 
    dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed 
    disabled:opacity-60
  `;

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]',
  };

  // Variant classes with WCAG-compliant colors
  const variantClasses = {
    primary: `
      bg-blue-600 text-white shadow-lg shadow-blue-500/25 
      hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 
      focus:ring-blue-500 disabled:bg-blue-400
    `,
    secondary: `
      bg-gray-600 text-white shadow-lg shadow-gray-500/25 
      hover:bg-gray-700 hover:shadow-xl hover:shadow-gray-500/30 
      focus:ring-gray-500 disabled:bg-gray-400
    `,
    success: `
      bg-green-600 text-white shadow-lg shadow-green-500/25 
      hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/30 
      focus:ring-green-500 disabled:bg-green-400
    `,
    warning: `
      bg-yellow-600 text-white shadow-lg shadow-yellow-500/25 
      hover:bg-yellow-700 hover:shadow-xl hover:shadow-yellow-500/30 
      focus:ring-yellow-500 disabled:bg-yellow-400
    `,
    danger: `
      bg-red-600 text-white shadow-lg shadow-red-500/25 
      hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/30 
      focus:ring-red-500 disabled:bg-red-400
    `,
    ghost: `
      bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 
      dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 
      focus:ring-gray-500 disabled:border-gray-200
    `,
    link: `
      bg-transparent text-blue-600 dark:text-blue-400 underline-offset-4 
      hover:underline focus:ring-blue-500 disabled:text-blue-400
    `,
  };

  // High contrast mode adjustments
  const contrastClasses = preferences.highContrast ? {
    primary: 'border-2 border-blue-800',
    secondary: 'border-2 border-gray-800',
    success: 'border-2 border-green-800',
    warning: 'border-2 border-yellow-800',
    danger: 'border-2 border-red-800',
    ghost: 'border-2 border-current',
    link: 'border-b-2 border-current',
  } : {};

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${contrastClasses[variant] || ''}
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${className}
  `;

  // Animation props (respects reduced motion)
  const animationProps = getAnimationProps(
    {
      whileTap: disabled || loading ? {} : { scale: 0.98 },
      transition: { duration: 0.1 },
    },
    {} // No animation for reduced motion
  );

  // Accessibility props
  const accessibilityProps = getButtonProps({
    disabled: disabled || loading,
    pressed,
    expanded,
    controls,
    describedBy,
  });

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        className="opacity-75"
      />
    </svg>
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(event);
  };

  // Content to display
  const displayContent = loading && loadingText ? loadingText : children;
  const showLeftIcon = leftIcon && !loading;
  const showRightIcon = rightIcon && !loading;
  const showLoadingSpinner = loading;

  // Render as different elements based on 'as' prop
  const Element = as === 'button' ? motion.button : as === 'a' ? motion.a : motion.div;

  return (
    <Element
      ref={ref}
      className={combinedClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...accessibilityProps}
      {...animationProps}
      {...props}
    >
      {/* Loading state - announce to screen readers */}
      {loading && (
        <span className="sr-only">
          {loadingText || 'Loading...'}
        </span>
      )}
      
      {/* Left icon or loading spinner */}
      {showLoadingSpinner && <LoadingSpinner />}
      {showLeftIcon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      {/* Button content */}
      <span className={loading && !loadingText ? 'opacity-0' : ''}>
        {displayContent}
      </span>
      
      {/* Right icon */}
      {showRightIcon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Element>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;