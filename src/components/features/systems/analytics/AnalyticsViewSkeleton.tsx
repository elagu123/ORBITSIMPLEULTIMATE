import React from 'react';

const AnalyticsViewSkeleton: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            {/* Metric Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg h-36"></div>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg h-36"></div>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg h-36"></div>
            </div>
            {/* Insights Skeleton */}
            <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4 mb-3"></div>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg h-12"></div>
                    <div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg h-12"></div>
                    <div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg h-12"></div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsViewSkeleton;