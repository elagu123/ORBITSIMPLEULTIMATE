import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, CalendarViewMode, OptimalTimeSlot } from '../../../types/index';
import CalendarEventComponent from './CalendarEvent';
import { useToastNotifications } from '../../../store/toastContext';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  Edit3, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckSquare,
  Square,
  Archive
} from '../../ui/Icons';
import Button from '../../ui/Button';

interface EnhancedMarketingCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
  viewMode: CalendarViewMode;
  optimalTimes: OptimalTimeSlot[];
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
  onBulkAction?: (action: string, eventIds: string[]) => void;
}

const EnhancedMarketingCalendar: React.FC<EnhancedMarketingCalendarProps> = ({ 
  events, 
  onEventClick, 
  onDayClick, 
  selectedDate, 
  viewMode, 
  optimalTimes,
  onEventUpdate,
  onEventDelete,
  onEventDuplicate,
  onBulkAction
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 15));
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const { success, error } = useToastNotifications();

  const changeDate = useCallback((offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + offset);
      } else {
        newDate.setDate(newDate.getDate() + (offset * 7));
      }
      return newDate;
    });
  }, [viewMode]);

  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString('default', {month: 'short', day: 'numeric'})} - ${endOfWeek.toLocaleDateString('default', {month: 'short', day: 'numeric', year: 'numeric'})}`;
  }, [currentDate, viewMode]);

  const days = useMemo(() => {
    const d = [];
    if (viewMode === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      const endDate = new Date(endOfMonth);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      let day = new Date(startDate);
      while (day <= endDate) {
        d.push(new Date(day));
        day.setDate(day.getDate() + 1);
      }
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        d.push(day);
      }
    }
    return d;
  }, [currentDate, viewMode]);

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const selectAllEvents = useCallback(() => {
    setSelectedEvents(new Set(events.map(e => e.id)));
  }, [events]);

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set());
    setSelectionMode(false);
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    if (selectedEvents.size === 0) return;
    
    const eventIds = Array.from(selectedEvents);
    onBulkAction?.(action, eventIds);
    
    switch (action) {
      case 'delete':
        success('Bulk Delete', `${eventIds.length} events deleted successfully`);
        break;
      case 'duplicate':
        success('Bulk Duplicate', `${eventIds.length} events duplicated successfully`);
        break;
      case 'archive':
        success('Bulk Archive', `${eventIds.length} events archived successfully`);
        break;
    }
    
    clearSelection();
  }, [selectedEvents, onBulkAction, success, clearSelection]);

  const handleDragStart = useCallback((event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateString);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    if (draggedEvent && draggedEvent.date !== dateString) {
      const updatedEvent = { ...draggedEvent, date: dateString };
      onEventUpdate?.(updatedEvent);
      success('Event Moved', `"${draggedEvent.title}" moved to ${new Date(dateString).toLocaleDateString()}`);
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  }, [draggedEvent, onEventUpdate, success]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeDate(-1)}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">{headerTitle}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeDate(1)}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!selectionMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectionMode(true)}
              leftIcon={<CheckSquare className="w-4 h-4" />}
            >
              Select
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEvents.size} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllEvents}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectionMode && selectedEvents.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('duplicate')}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('archive')}
                leftIcon={<Archive className="w-4 h-4" />}
              >
                Archive
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Grid */}
      <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-1 md:grid-cols-7'} gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden`}>
        {/* Day Headers */}
        {daysOfWeek.map(day => (
          <div 
            key={day} 
            className="text-center font-medium py-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50"
          >
            {viewMode === 'month' ? day : day.slice(0, 1)}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dateString = day.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateString);
          
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate ? day.toDateString() === selectedDate.toDateString() : false;
          const isDragOver = dragOverDate === dateString;
          
          const dayOfWeekName = day.toLocaleDateString('en-US', { weekday: 'long' });
          const isOptimal = optimalTimes.some(ot => 
            ot.time.toLowerCase().includes(dayOfWeekName.toLowerCase())
          );

          return (
            <div 
              key={index} 
              className={`
                relative p-2 min-h-[120px] transition-all duration-200 cursor-pointer
                ${isCurrentMonth || viewMode === 'week' ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}
                ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
                ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600' : ''}
                ${!isSelected && !isDragOver ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                ${viewMode === 'week' ? 'border-t dark:border-gray-700' : ''}
              `}
              onClick={() => onDayClick(day)}
              onDragOver={(e) => handleDragOver(e, dateString)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateString)}
            >
              {/* AI Optimal Time Indicator */}
              {isOptimal && (
                <div 
                  className="absolute top-2 right-2 z-20" 
                  title={`AI Suggestion: ${optimalTimes.find(ot => 
                    ot.time.toLowerCase().includes(dayOfWeekName.toLowerCase())
                  )?.reason || 'Optimal posting time'}`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <div className="absolute inset-0 animate-ping">
                      <Sparkles className="w-4 h-4 text-yellow-500 opacity-75" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span 
                  className={`
                    text-sm font-medium
                    ${isToday ? 'bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold' : ''} 
                    ${isCurrentMonth || viewMode === 'week' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
                  `}
                >
                  {day.getDate()}
                </span>
                {viewMode === 'week' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {daysOfWeek[day.getDay()]}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                <AnimatePresence>
                  {dayEvents.map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: eventIndex * 0.05 }}
                      className="relative group"
                    >
                      {selectionMode && (
                        <div 
                          className="absolute -left-1 top-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventSelection(event.id);
                          }}
                        >
                          {selectedEvents.has(event.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                          )}
                        </div>
                      )}
                      
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        className={`
                          ${selectionMode ? 'ml-5' : ''}
                          ${selectedEvents.has(event.id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                        `}
                      >
                        <CalendarEventComponent 
                          event={event} 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectionMode) {
                              toggleEventSelection(event.id);
                            } else {
                              onEventClick(event);
                            }
                          }}
                          showActions={!selectionMode}
                          onEdit={() => onEventClick(event)}
                          onDuplicate={() => onEventDuplicate?.(event)}
                          onDelete={() => onEventDelete?.(event.id)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Drop Zone Indicator */}
              {isDragOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 border-2 border-dashed border-blue-400 rounded bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center"
                >
                  <Calendar className="w-6 h-6 text-blue-500" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Count Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          Total events: {events.length}
        </div>
        <div className="flex items-center space-x-4">
          <span>Draft: {events.filter(e => e.status === 'draft').length}</span>
          <span>Scheduled: {events.filter(e => e.status === 'scheduled').length}</span>
          <span>Published: {events.filter(e => e.status === 'published').length}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMarketingCalendar;