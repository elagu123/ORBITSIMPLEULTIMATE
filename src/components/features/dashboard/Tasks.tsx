import React, { useState } from 'react';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { ProactiveTask, EnhancedCustomer, PostContent, Page } from '../../../types/index';
import { useGamification } from '../../../store/gamificationContext';
import { useProfile } from '../../../store/profileContext';
import { aiService } from '../../../services/aiService';
import { TEMPLATES } from '../content/TemplateSelector';
import Button from '../../ui/Button';
import { AlertTriangle, Cake, Sparkles, CheckCircle } from '../../ui/Icons';
import { useAppData } from '../../../store/appDataContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface TasksProps {
  tasks: ProactiveTask[];
  isLoading: boolean;
  onNavigateWithContent: (content: PostContent, page: Page) => void;
  onUpdateTasks: (tasks: ProactiveTask[]) => void;
}

const taskIcons: Record<ProactiveTask['type'], React.ElementType> = {
  customer_retention: AlertTriangle,
  celebratory_message: Cake,
  content_opportunity: Sparkles,
};

const Tasks: React.FC<TasksProps> = ({ tasks, isLoading, onNavigateWithContent, onUpdateTasks }) => {
  const { addXp, unlockAchievement } = useGamification();
  const { profile } = useProfile();
  const { customers } = useAppData();
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const handleDismiss = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, isCompleted: true } : task
    );
    onUpdateTasks(updatedTasks);
    addXp(10);
    unlockAchievement('firstTask');
  };

  const handleActionClick = async (task: ProactiveTask) => {
    setIsActionLoading(task.id);
    try {
      let generatedContent;
      if (task.type === 'customer_retention' || task.type === 'celebratory_message') {
        const customer = customers.find(c => c.id === task.relatedId);
        if (customer) {
          generatedContent = await aiService.generatePersonalizedCommunication(customer, profile);
        }
      } else if (task.type === 'content_opportunity') {
        generatedContent = await aiService.generateContentForSpecialDate(task.relatedId, profile);
      }

      if (generatedContent) {
        const promoTemplate = TEMPLATES.find(t => t.id === 'seasonal_promo');
        const postContent: PostContent = {
          structure: generatedContent.structure,
          variables: promoTemplate ? promoTemplate.variables.reduce((acc, key) => ({ ...acc, [key]: '' }), {}) : {},
        };
        onNavigateWithContent(postContent, 'Content');
        handleDismiss(task.id); // Auto-dismiss on action
      } else {
        throw new Error('Could not find related data for the task.');
      }

    } catch (error) {
      console.error("Failed to execute task action:", error);
      alert("Sorry, there was an error performing this action.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const uncompletedTasks = tasks.filter(t => !t.isCompleted);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <Sparkles className="w-5 h-5 text-primary-500 mr-2" /> AI Suggested Tasks
      </h3>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {uncompletedTasks.length > 0 ? uncompletedTasks.map((task) => {
            const Icon = taskIcons[task.type];
            return (
              <li key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" onClick={() => handleActionClick(task)} disabled={isActionLoading === task.id}>
                        {isActionLoading === task.id ? 'Working...' : task.actionText}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDismiss(task.id)}>Dismiss</Button>
                    </div>
                  </div>
                </div>
              </li>
            )
          }) : (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">All caught up!</p>
            </div>
          )}
        </ul>
      )}
    </motion.div>
  );
};

export default Tasks;