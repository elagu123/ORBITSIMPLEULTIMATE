import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from './Icons';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [isDark, setIsDark] = useState(false);

  // Check initial theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-12 h-6';
      case 'md': return 'w-14 h-7';
      case 'lg': return 'w-16 h-8';
    }
  };

  const getKnobSize = () => {
    switch (size) {
      case 'sm': return 'w-5 h-5';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-7 h-7';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-3.5 h-3.5';
      case 'lg': return 'w-4 h-4';
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/25' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/25'
        }
        ${getSizeClasses()}
        hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-300
          ${isDark ? 'bg-purple-600' : 'bg-yellow-400'}
        `} 
      />
      
      {/* Toggle knob */}
      <motion.div
        className={`
          relative z-10 rounded-full bg-white shadow-lg flex items-center justify-center
          ${getKnobSize()}
        `}
        animate={{
          x: isDark ? (size === 'sm' ? 24 : size === 'md' ? 28 : 32) : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Icon with rotation animation */}
        <motion.div
          animate={{ 
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0.9 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className={`${getIconSize()} text-indigo-600`} />
          ) : (
            <Sun className={`${getIconSize()} text-orange-500`} />
          )}
        </motion.div>
      </motion.div>

      {/* Stars effect for dark mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${20 + i * 15}%`,
                left: `${15 + i * 20}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
};

export default DarkModeToggle;