import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantPanel from './AIAssistantPanel';
import { Sparkles } from '../../ui/Icons';
// FIX: Corrected import path for types to point to the new single source of truth.
import { AppContextState } from '../../../types/index';

interface FloatingAIButtonProps {
  appContext: AppContextState;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ appContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    const handleOpenRequest = () => setIsOpen(true);
    window.addEventListener('open-ai-panel', handleOpenRequest);
    return () => window.removeEventListener('open-ai-panel', handleOpenRequest);
  }, []);

  const handleClick = () => {
    setIsOpen(true);
    setHasUnread(false);
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40">
        <motion.button
          onClick={handleClick}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-300 ${hasUnread ? 'animate-pulse-glow' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open AI Assistant"
        >
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
          )}
          <Sparkles className="w-8 h-8" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && <AIAssistantPanel onClose={() => setIsOpen(false)} appContext={appContext} />}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIButton;