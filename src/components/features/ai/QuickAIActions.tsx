import React from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { ContextualSuggestion } from '../../../types/index';
import { FileText, Tag, Cake, Star, Users, Mail } from '../../ui/Icons';

interface QuickAIActionsProps {
    actions: ContextualSuggestion[];
    onActionClick: (prompt: string) => void;
    isLoading: boolean;
}

const iconMap: { [key: string]: React.ElementType } = {
    FileText,
    Tag,
    Cake,
    Star,
    Users,
    Mail,
};

const QuickAIActions: React.FC<QuickAIActionsProps> = ({ actions, onActionClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 animate-pulse">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (actions.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action, index) => {
        const Icon = iconMap[action.icon] || FileText;
        return (
          <button
            key={index}
            onClick={() => onActionClick(action.prompt)}
            className="flex items-center space-x-2 p-2 bg-primary-50 dark:bg-gray-700/50 hover:bg-primary-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Icon className="w-5 h-5 text-primary-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
          </button>
        )
      })}
    </div>
  );
};

export default QuickAIActions;