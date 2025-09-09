import React from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../../../store/profileContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const AdaptiveGreeting: React.FC = () => {
  const { profile } = useProfile();
  const greeting = getGreeting();

  return (
    <motion.div variants={itemVariants}>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        {greeting}, {profile?.businessName || 'User'}!
      </h2>
      <p className="mt-1 text-gray-600 dark:text-gray-400">Here's your adaptive command center for today.</p>
    </motion.div>
  );
};

export default AdaptiveGreeting;
