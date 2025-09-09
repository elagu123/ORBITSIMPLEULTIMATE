import React from 'react';

const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-gray-200 dark:bg-gray-700/80 rounded ${className}`} />
);

const CalendarSkeleton: React.FC = () => {
    const calendarCells = Array.from({ length: 42 }); // 6 weeks * 7 days

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-gray-100 dark:bg-gray-900 gap-4 animate-pulse">
            {/* Left Panel Skeleton */}
            <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-6">
                <div>
                    <SkeletonBox className="h-6 w-1/2 mx-auto mb-4" />
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => <SkeletonBox key={i} className="h-6 rounded-full" />)}
                    </div>
                </div>
                <SkeletonBox className="h-px w-full" />
                <div>
                    <SkeletonBox className="h-5 w-3/4 mb-3" />
                    <SkeletonBox className="h-10 w-full" />
                    <SkeletonBox className="h-10 w-full mt-2" />
                </div>
                 <SkeletonBox className="h-px w-full" />
                 <div>
                    <SkeletonBox className="h-5 w-1/2 mb-3" />
                    <SkeletonBox className="h-24 w-full" />
                </div>
            </div>

            {/* Center Panel Skeleton */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <SkeletonBox className="h-8 w-24 rounded-lg" />
                    <SkeletonBox className="h-9 w-40 rounded-lg" />
                </div>
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <SkeletonBox className="h-8 w-8 rounded-full" />
                        <SkeletonBox className="h-6 w-1/3" />
                        <SkeletonBox className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="py-2 h-10 bg-white dark:bg-gray-800 flex items-center justify-center"><SkeletonBox className="h-4 w-6"/></div>
                        ))}
                        {calendarCells.map((_, index) => (
                            <div key={index} className="min-h-[100px] bg-white dark:bg-gray-800 p-2 space-y-2">
                                <SkeletonBox className="h-4 w-6" />
                                <SkeletonBox className="h-3 w-full" />
                                <SkeletonBox className="h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Right Panel Skeleton */}
            <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
                 <SkeletonBox className="h-6 w-1/2" />
                 <SkeletonBox className="h-4 w-1/3" />
                 <div className="pt-4 border-t dark:border-gray-600 space-y-3">
                    <SkeletonBox className="h-4 w-1/4" />
                    <SkeletonBox className="h-16 w-full" />
                 </div>
                 <div className="pt-4 border-t dark:border-gray-600 space-y-3">
                    <SkeletonBox className="h-4 w-1/3" />
                    <SkeletonBox className="h-24 w-full" />
                 </div>
            </div>
        </div>
    );
};

export default CalendarSkeleton;