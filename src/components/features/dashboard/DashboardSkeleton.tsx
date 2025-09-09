import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 dark:bg-gray-700/50 rounded-lg ${className}`}></div>
);

const DashboardSkeleton: React.FC = () => {
  return (
    <motion.div
      className="space-y-8 animate-pulse"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting Skeleton */}
      <motion.div variants={itemVariants}>
        <SkeletonCard className="h-9 w-1/2 mb-2" />
        <SkeletonCard className="h-5 w-3/4" />
      </motion.div>

      {/* Stat Cards Skeleton */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton (Charts & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants}>
            <SkeletonCard className="h-[400px]" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SkeletonCard className="h-64" />
          </motion.div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-8">
          <motion.div variants={itemVariants}>
            <SkeletonCard className="h-36" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SkeletonCard className="h-48" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SkeletonCard className="h-56" />
          </motion.div>
        </div>
      </div>
       {/* WhatsNext Skeleton */}
        <motion.div variants={itemVariants}>
            <SkeletonCard className="h-6 w-1/3 mb-4" />
            <div className="space-y-4">
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
            </div>
        </motion.div>
    </motion.div>
  );
};

export default DashboardSkeleton;