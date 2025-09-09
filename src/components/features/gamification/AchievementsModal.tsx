import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../ui/Modal';
import { useGamification } from '../../../store/gamificationContext';
import { ACHIEVEMENTS, Achievement } from '../../../config/gamification';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { state } = useGamification();
  const achievementsList = Object.values(ACHIEVEMENTS);

  return (
    <Modal title="Your Achievements" isOpen={isOpen} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
        {achievementsList.map(achievement => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
            isUnlocked={state.unlockedAchievements.has(achievement.id)} 
          />
        ))}
      </div>
    </Modal>
  );
};

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked }) => {
    return (
        <div className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${isUnlocked ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30' : 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? 'bg-green-100 dark:bg-green-500/20' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <achievement.icon className={`w-8 h-8 ${isUnlocked ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
            <h4 className={`font-semibold ${isUnlocked ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
                {achievement.name}
            </h4>
            <p className={`text-xs mt-1 ${isUnlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>
                {achievement.description}
            </p>
        </div>
    );
};

export default AchievementsModal;
