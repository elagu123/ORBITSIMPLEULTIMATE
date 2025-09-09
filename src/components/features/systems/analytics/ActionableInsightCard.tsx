import React from 'react';
import Button from '../../../ui/Button';
import { motion } from 'framer-motion';

interface ActionableInsightCardProps {
    icon: string;
    title: string;
    impact: string;
    actionText: string;
}

const ActionableInsightCard: React.FC<ActionableInsightCardProps> = ({ icon, title, impact, actionText }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
    >
        <div className="text-2xl mt-1">{icon}</div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{impact}</p>
        </div>
        <Button size="sm">{actionText}</Button>
    </motion.div>
);

export default ActionableInsightCard;
