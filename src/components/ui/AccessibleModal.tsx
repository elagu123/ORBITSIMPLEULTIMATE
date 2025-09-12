import React, { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from './Icons';
import { 
  getModalProps, 
  focusManager, 
  handleKeyboardNavigation,
  generateId,
  getAnimationProps,
  announceToScreenReader 
} from '../../utils/accessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useRef(generateId('modal-title'));
  const descriptionId = useRef(description ? generateId('modal-description') : undefined);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Announce modal opening to screen readers
      announceToScreenReader(`${title} dialog opened`, 'assertive');
      
      // Set up focus trap
      let cleanup: (() => void) | undefined;
      
      // Small delay to ensure modal is rendered
      const timeoutId = setTimeout(() => {
        if (modalRef.current) {
          cleanup = focusManager.trapFocus(modalRef.current);
        }
      }, 100);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        clearTimeout(timeoutId);
        cleanup?.();
        document.body.style.overflow = '';
        
        // Return focus to previous element
        if (previousActiveElement.current) {
          focusManager.returnFocus(previousActiveElement.current);
        }
        
        // Announce modal closing
        announceToScreenReader(`${title} dialog closed`, 'assertive');
      };
    }
  }, [isOpen, title]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!closeOnEscape) return;
    
    handleKeyboardNavigation(event, {
      onEscape: onClose,
    });
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const overlayAnimation = getAnimationProps(
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    { opacity: 1 } // Reduced motion fallback
  );

  const modalAnimation = getAnimationProps(
    {
      initial: { opacity: 0, scale: 0.9, y: -20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: -20 },
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    { opacity: 1, scale: 1, y: 0 } // Reduced motion fallback
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <motion.div
          {...overlayAnimation}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        
        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            ref={modalRef}
            {...modalAnimation}
            {...getModalProps(titleId.current, descriptionId.current)}
            onKeyDown={handleKeyDown}
            className={`
              relative w-full ${sizeClasses[size]} max-h-[90vh] 
              bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
              overflow-hidden ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 
                id={titleId.current}
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-lg text-gray-400 hover:text-gray-600 
                    hover:bg-gray-100 dark:hover:bg-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    transition-colors
                  "
                  aria-label={`Close ${title} dialog`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Description (if provided) */}
            {description && (
              <div className="px-6 pt-2">
                <p 
                  id={descriptionId.current}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {description}
                </p>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AccessibleModal;