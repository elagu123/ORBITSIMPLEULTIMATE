import React from 'react';
import { motion } from 'framer-motion';

// Skeleton Loaders
export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  animate?: boolean;
}> = ({ lines = 1, className = '', animate = true }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <motion.div
          key={index}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
          animate={animate ? {
            opacity: [0.5, 1, 0.5],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <motion.div
        className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <SkeletonText lines={2} />
      <div className="mt-3">
        <motion.div
          className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
      </div>
    </div>
  );
};

// Spinner Components
export const Spinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
  className?: string;
}> = ({ size = 'md', color = 'blue', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-8 h-8';
      case 'xl': return 'w-12 h-12';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'border-blue-500';
      case 'purple': return 'border-purple-500';
      case 'green': return 'border-green-500';
      case 'yellow': return 'border-yellow-500';
      case 'red': return 'border-red-500';
    }
  };

  return (
    <motion.div
      className={`
        ${getSizeClasses()} 
        border-2 border-transparent 
        border-t-current ${getColorClasses()} 
        rounded-full 
        ${className}
      `}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// Pulse Loader
export const PulseLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Wave Loader
export const WaveLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
          animate={{
            height: ['8px', '24px', '8px'],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean; 
  children: React.ReactNode;
  message?: string;
  spinner?: 'default' | 'pulse' | 'wave';
}> = ({ isLoading, children, message = 'Loading...', spinner = 'default' }) => {
  const renderSpinner = () => {
    switch (spinner) {
      case 'pulse': return <PulseLoader />;
      case 'wave': return <WaveLoader />;
      default: return <Spinner size="lg" />;
    }
  };

  return (
    <div className="relative">
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg"
        >
          {renderSpinner()}
          <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Progress Bar
export const ProgressBar: React.FC<{ 
  progress: number; 
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
  animated?: boolean;
}> = ({ 
  progress, 
  className = '', 
  showPercentage = false, 
  color = 'blue',
  animated = true 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${getColorClasses()}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          transition={animated ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
        />
      </div>
    </div>
  );
};

export default {
  SkeletonText,
  SkeletonCard,
  Spinner,
  PulseLoader,
  WaveLoader,
  LoadingOverlay,
  ProgressBar,
};