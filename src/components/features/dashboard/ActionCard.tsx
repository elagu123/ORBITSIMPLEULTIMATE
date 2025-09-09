import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}

const cardVariants: Variants = {
  hover: {
    scale: 1.03,
    transition: { type: 'spring', stiffness: 300 },
  },
  tap: {
    scale: 0.98,
  },
};

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer flex items-center space-x-4 transition-shadow hover:shadow-lg"
    >
      <div className="flex-shrink-0 text-primary-500 bg-primary-100 dark:bg-gray-700 p-3 rounded-full">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>
      </div>
    </motion.div>
  );
};

export default ActionCard;