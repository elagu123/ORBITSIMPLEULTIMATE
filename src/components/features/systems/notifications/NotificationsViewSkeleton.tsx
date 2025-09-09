import React from 'react';

const NotificationsViewSkeleton: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4 animate-pulse">
            {/* Header Skeleton */}
            <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
            {/* Notification Cards Skeleton */}
            <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg h-24"></div>
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg h-24"></div>
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg h-24"></div>
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg h-24"></div>
            </div>
        </div>
    );
};

export default NotificationsViewSkeleton;