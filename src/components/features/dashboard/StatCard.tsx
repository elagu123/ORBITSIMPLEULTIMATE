import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: ReactNode;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between"
    >
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <div className="flex items-center text-sm mt-1">
          <span className={`${changeColor} font-semibold flex items-center`}>
            {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {change.toFixed(1)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
        </div>
      </div>
      <div className="text-primary-500 bg-primary-100 dark:bg-gray-700 p-3 rounded-full">
        {icon}
      </div>
    </motion.div>
  );
};

const ArrowUpIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
);
const ArrowDownIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
);

export default StatCard;