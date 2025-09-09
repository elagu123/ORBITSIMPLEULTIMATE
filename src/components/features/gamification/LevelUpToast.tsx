import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../../../store/gamificationContext';
import { Award } from '../../ui/Icons';

const LevelUpToast: React.FC = () => {
  const { levelUpNotification, clearLevelUpNotification } = useGamification();

  useEffect(() => {
    if (levelUpNotification) {
      const timer = setTimeout(() => {
        clearLevelUpNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [levelUpNotification, clearLevelUpNotification]);

  return (
    <AnimatePresence>
      {levelUpNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border dark:border-gray-700 flex items-center space-x-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                    <Award className="w-7 h-7" />
                </div>
            </div>
            <div className="flex-1">
                <p className="font-bold text-gray-800 dark:text-white">Level Up!</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    You've reached Level {levelUpNotification.level}: <span className="font-semibold text-primary-500">{levelUpNotification.name}</span>!
                </p>
            </div>
            <button onClick={clearLevelUpNotification} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpToast;
