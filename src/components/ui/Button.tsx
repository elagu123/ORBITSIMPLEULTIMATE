import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '', 
    disabled,
    as = 'button',
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    const baseClasses = [
      'relative inline-flex items-center justify-center gap-2',
      'font-semibold rounded-xl transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
      'active:scale-[0.98] transform',
      'disabled:cursor-not-allowed disabled:transform-none',
      fullWidth ? 'w-full' : 'w-auto'
    ].join(' ');

    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs min-h-[28px]',
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[48px]',
      xl: 'px-8 py-4 text-lg min-h-[56px]',
    };

    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25',
        'hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30',
        'focus:ring-blue-500',
        'disabled:from-blue-400 disabled:to-blue-400 disabled:shadow-none disabled:opacity-60'
      ].join(' '),
      
      secondary: [
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-sm',
        'dark:from-gray-700 dark:to-gray-800 dark:text-gray-100',
        'hover:from-gray-200 hover:to-gray-300 hover:shadow-md',
        'dark:hover:from-gray-600 dark:hover:to-gray-700',
        'focus:ring-gray-500',
        'disabled:opacity-60 disabled:shadow-none'
      ].join(' '),
      
      danger: [
        'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25',
        'hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:shadow-red-500/30',
        'focus:ring-red-500',
        'disabled:from-red-400 disabled:to-red-400 disabled:shadow-none disabled:opacity-60'
      ].join(' '),
      
      success: [
        'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25',
        'hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-500/30',
        'focus:ring-green-500',
        'disabled:from-green-400 disabled:to-green-400 disabled:shadow-none disabled:opacity-60'
      ].join(' '),
      
      ghost: [
        'bg-transparent text-gray-700 dark:text-gray-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:ring-gray-500',
        'disabled:opacity-60'
      ].join(' '),
      
      outline: [
        'bg-transparent border-2 border-gray-300 text-gray-700',
        'dark:border-gray-600 dark:text-gray-300',
        'hover:border-gray-400 hover:bg-gray-50',
        'dark:hover:border-gray-500 dark:hover:bg-gray-800',
        'focus:ring-gray-500',
        'disabled:opacity-60'
      ].join(' ')
    };

    const LoadingSpinner = () => (
      <svg 
        className="w-4 h-4 animate-spin" 
        fill="none" 
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const buttonContent = (
      <>
        {loading ? (
          <>
            <LoadingSpinner />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </>
    );

    const allClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    if (as === 'a') {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={allClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={allClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;