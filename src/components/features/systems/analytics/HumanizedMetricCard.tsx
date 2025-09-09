import React from 'react';
import { Lightbulb } from '../../../ui/Icons';
import { motion } from 'framer-motion';

interface HumanizedMetricCardProps {
    emoji: string;
    simple: string;
    context: string;
    action: string;
}

const HumanizedMetricCard: React.FC<HumanizedMetricCardProps> = ({ emoji, simple, context, action }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col"
    >
        <p className="text-3xl">{emoji}</p>
        <p className="font-semibold text-gray-800 dark:text-white mt-2 flex-grow">{simple}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{context}</p>
        <div className="mt-4 pt-3 border-t dark:border-gray-600 flex items-end">
            <p className="text-xs text-primary-600 dark:text-primary-300 font-medium flex items-start gap-2">
                <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                <span>{action}</span>
            </p>
        </div>
    </motion.div>
);

export default HumanizedMetricCard;
