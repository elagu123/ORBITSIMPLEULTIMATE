import React from 'react';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { SmartNotificationCategory } from '../../../../types/index';
import Button from '../../../ui/Button';

interface NotificationCardProps {
    category: SmartNotificationCategory;
    Icon: React.ElementType;
    title: string;
    description: string;
    timestamp: string;
    primaryActionLabel: string;
    secondaryActionLabel?: string;
}

const categoryStyles: Record<SmartNotificationCategory, { border: string; iconBg: string; iconText: string; }> = {
    critical: {
        border: 'border-red-500 dark:border-red-500',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconText: 'text-red-600 dark:text-red-400',
    },
    opportunity: {
        border: 'border-green-500 dark:border-green-500',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconText: 'text-green-600 dark:text-green-400',
    },
    warning: {
        border: 'border-yellow-500 dark:border-yellow-500',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconText: 'text-yellow-600 dark:text-yellow-400',
    },
    informational: {
        border: 'border-blue-500 dark:border-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconText: 'text-blue-600 dark:text-blue-400',
    },
};

const NotificationCard: React.FC<NotificationCardProps> = ({
    category,
    Icon,
    title,
    description,
    timestamp,
    primaryActionLabel,
    secondaryActionLabel,
}) => {
    const styles = categoryStyles[category];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${styles.border} flex items-start gap-4`}
        >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                <Icon className={`w-5 h-5 ${styles.iconText}`} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 dark:text-white">{title}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">{timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
                <div className="flex items-center gap-2 mt-3">
                    <Button size="sm">{primaryActionLabel}</Button>
                    {secondaryActionLabel && <Button size="sm" variant="secondary">{secondaryActionLabel}</Button>}
                </div>
            </div>
        </motion.div>
    );
};

export default NotificationCard;