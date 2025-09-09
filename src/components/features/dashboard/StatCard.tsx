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
  const changeColor = isIncrease ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const changeBackground = isIncrease ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <motion.div 
      variants={itemVariants}
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 group-hover:scale-110 transition-transform duration-300">
              <div className="text-blue-600 dark:text-blue-400">
                {icon}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
              {value}
            </p>
            
            <div className="flex items-center justify-between">
              <div className={`
                inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
                ${changeColor} ${changeBackground}
              `}>
                {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(change).toFixed(1)}%
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs last month
              </span>
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <div className={`
            w-2 h-16 rounded-full transition-all duration-300
            ${isIncrease 
              ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' 
              : 'bg-gradient-to-t from-red-500 to-red-300'
            }
            group-hover:scale-y-110 group-hover:shadow-lg
          `} />
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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