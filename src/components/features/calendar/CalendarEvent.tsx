import React from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { CalendarEvent } from '../../../types/index';

interface CalendarEventProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

const CalendarEventComponent: React.FC<CalendarEventProps> = ({ event, onClick }) => {
  const statusColors = {
    draft: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
    scheduled: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    published: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
    editing: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };
  
  const typeColors = {
      post_idea: 'border-yellow-500',
      scheduled_post: 'border-blue-500',
      campaign: 'border-purple-500',
      holiday: 'border-red-500',
  }

  return (
    <div
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded-md cursor-pointer hover:opacity-80 transition-opacity border-l-4 ${statusColors[event.status]} ${typeColors[event.type]}`}
    >
      <p className="font-semibold truncate">{event.title}</p>
    </div>
  );
};

export default CalendarEventComponent;