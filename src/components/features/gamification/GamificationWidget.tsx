import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '../../../store/gamificationContext';
import { LEVELS } from '../../../config/gamification';
import { Trophy } from '../../ui/Icons';
import Button from '../../ui/Button';
import AchievementsModal from './AchievementsModal';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const GamificationWidget: React.FC = () => {
    const { state, levelInfo } = useGamification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const nextLevel = LEVELS.find(l => l.level === state.level + 1);
    const xpForCurrentLevel = levelInfo.xpThreshold;
    const xpForNextLevel = nextLevel ? nextLevel.xpThreshold : state.xp;
    const progressPercentage = nextLevel ? ((state.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100 : 100;
    
    return (
        <>
            <motion.div 
                variants={itemVariants} 
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full"
            >
                <div className="flex items-center space-x-4 mb-4">
                    <img src="https://picsum.photos/100" alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-primary-500" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{levelInfo.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Level {levelInfo.level}</p>
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-primary-500">{state.xp} / {nextLevel ? xpForNextLevel : 'Max'} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <motion.div 
                            className="bg-primary-500 h-2.5 rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
                
                <Button variant="secondary" className="w-full mt-6" onClick={() => setIsModalOpen(true)}>
                    <Trophy className="mr-2" /> View Achievements
                </Button>
            </motion.div>
            
            <AchievementsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default GamificationWidget;