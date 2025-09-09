import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from './Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps extends Toast {
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ 
  id, type, title, message, duration = 5000, action, onDismiss 
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            onDismiss(id);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, id, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden max-w-md w-full ${getColorClasses()} border rounded-xl shadow-lg backdrop-blur-sm`}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full">
          <motion.div
            className={`h-full ${getProgressColor()}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      )}

      <div className="p-4 pt-5">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            )}
            
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onDismiss(id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook para manejar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'success', title, message });
  };

  const error = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'error', title, message });
  };

  const warning = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'warning', title, message });
  };

  const info = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onDismiss={dismissToast} />
  };
};

export default ToastItem;