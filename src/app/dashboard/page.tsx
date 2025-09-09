import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Page, PostContent, ProactiveTask } from '../../types/index';
import { useProfile } from '../../store/profileContext';
import { useOptimizedAppData } from '../../store/optimized/appDataContext';
import { aiService } from '../../services/aiService';
import StatCardGrid from '../../components/features/dashboard/StatCardGrid';
import SalesChartWidget from '../../components/features/dashboard/SalesChartWidget';
import RecentActivity from '../../components/features/dashboard/RecentActivity';
import Tasks from '../../components/features/dashboard/Tasks';
import AdaptiveGreeting from '../../components/features/dashboard/AdaptiveGreeting';
import WeatherWidget from '../../components/features/dashboard/WeatherWidget';
// FIX: Corrected import to be a named import as WhatsNext is not a default export.
import { WhatsNext } from '../../components/features/dashboard/WhatsNext';
import GamificationWidget from '../../components/features/gamification/GamificationWidget';
import LevelUpToast from '../../components/features/gamification/LevelUpToast';
import DashboardSkeleton from '../../components/features/dashboard/DashboardSkeleton';
// Lazy load UI showcase component
const UIShowcase = React.lazy(() => import('../../components/features/dashboard/UIShowcase'));

interface DashboardProps {
  setActivePage: (page: Page) => void;
  onNavigateWithContent: (content: PostContent, page: Page) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const DashboardPage: React.FC<DashboardProps> = ({ setActivePage, onNavigateWithContent }) => {
  const { customers, specialDates } = useOptimizedAppData();
  const { profile } = useProfile();
  const [proactiveTasks, setProactiveTasks] = useState<ProactiveTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (profile && customers.length > 0) {
        setIsLoading(true);
        try {
          // Add a minimum load time to prevent flashing skeletons on fast connections
          const minLoadPromise = new Promise(resolve => setTimeout(resolve, 400));
          const tasksPromise = aiService.generateProactiveTasks(customers, specialDates, profile);
          
          const [tasks] = await Promise.all([tasksPromise, minLoadPromise]);
          setProactiveTasks(tasks);

        } catch (error) {
          console.error("Failed to fetch proactive tasks:", error);
          const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
          const fallbackDescription = errorMessage.includes('429') || errorMessage.includes('quota')
            ? "AI is cooling down (rate limit hit). Here's a sample task to demonstrate functionality."
            : "AI task generation failed. Here is a sample task.";
          setProactiveTasks([
            { id: 'err-1', type: 'customer_retention', description: fallbackDescription, actionText: 'View Customer', relatedId: customers.find(c => c.aiAnalysis.churnRisk.level === 'high')?.id || customers[0]?.id || '', isCompleted: false }
          ]);
        } finally {
          setIsLoading(false);
        }
      } else if (profile) {
        // If there are no customers, we don't need to fetch tasks, just finish loading.
        setTimeout(() => setIsLoading(false), 400);
      }
    };
    fetchTasks();
  }, [customers, specialDates, profile]);

  const handleUpdateTasks = (updatedTasks: ProactiveTask[]) => {
    setProactiveTasks(updatedTasks);
  };
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <motion.div
        className="space-y-8 p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AdaptiveGreeting />

        <StatCardGrid />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <SalesChartWidget />
            <RecentActivity />
          </div>
          <div className="xl:col-span-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
              <WeatherWidget />
              <GamificationWidget />
            </div>
            <Tasks
              tasks={proactiveTasks}
              isLoading={isLoading}
              onUpdateTasks={handleUpdateTasks}
              onNavigateWithContent={onNavigateWithContent}
            />
          </div>
        </div>

        <motion.div variants={itemVariants}>
          <WhatsNext setActivePage={setActivePage} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          }>
            <UIShowcase />
          </Suspense>
        </motion.div>

      </motion.div>
      <LevelUpToast />
    </>
  );
};

export default DashboardPage;