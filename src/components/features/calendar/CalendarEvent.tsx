import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../../types/index';
import { Edit3, Copy, Trash2, Eye, MoreVertical, Calendar, Clock, Image, Video } from '../../ui/Icons';

interface CalendarEventProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const CalendarEventComponent: React.FC<CalendarEventProps> = ({ 
  event, 
  onClick, 
  showActions = true,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-500',
    published: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-500',
    editing: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-500',
  };
  
  const typeIcons = {
    post_idea: Calendar,
    scheduled_post: Clock,
    campaign: Calendar,
    holiday: Calendar,
  };

  const statusIndicators = {
    draft: '●',
    scheduled: '⏰',
    published: '✓',
    editing: '✏️',
  };

  const TypeIcon = typeIcons[event.type];

  const handleMenuAction = (action: () => void | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    action?.();
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div
        onClick={onClick}
        className={`
          relative p-2 text-xs rounded-lg cursor-pointer transition-all duration-200
          border ${statusColors[event.status]}
          hover:shadow-md hover:-translate-y-0.5
          ${event.imageUrl || event.videoUrl ? 'border-l-4 border-l-purple-500' : ''}
        `}
      >
        {/* Header with icon and status */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <TypeIcon className="w-3 h-3 opacity-60" />
            <span className="text-xs opacity-80">
              {statusIndicators[event.status]}
            </span>
          </div>
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center justify-between">
          <p className="font-semibold truncate pr-1">{event.title}</p>
          
          {/* Media indicators */}
          <div className="flex items-center space-x-1">
            {event.imageUrl && <Image className="w-3 h-3 text-purple-500" />}
            {event.videoUrl && <Video className="w-3 h-3 text-red-500" />}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-60">{event.time}</span>
          <span className="text-xs opacity-60 capitalize">{event.type.replace('_', ' ')}</span>
        </div>

        {/* Quick Actions Menu */}
        {showMenu && showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-[120px]"
            onMouseLeave={() => setShowMenu(false)}
          >
            <button
              onClick={(e) => handleMenuAction(onEdit, e)}
              className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit3 className="w-3 h-3 mr-2" />
              Edit
            </button>
            <button
              onClick={(e) => handleMenuAction(onDuplicate, e)}
              className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-3 h-3 mr-2" />
              Duplicate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(e);
                setShowMenu(false);
              }}
              className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-3 h-3 mr-2" />
              View Details
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-600" />
            <button
              onClick={(e) => handleMenuAction(onDelete, e)}
              className="flex items-center w-full px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CalendarEventComponent;