import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { CalendarEvent, CalendarViewMode, OptimalTimeSlot } from '../../../types/index';
import CalendarEventComponent from './CalendarEvent';
import { Sparkles } from '../../ui/Icons';

interface MarketingCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
  viewMode: CalendarViewMode;
  optimalTimes: OptimalTimeSlot[];
}

const MarketingCalendar: React.FC<MarketingCalendarProps> = ({ events, onEventClick, onDayClick, selectedDate, viewMode, optimalTimes }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 15)); // Default to July 15 2024 for mock data

  const changeDate = (offset: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + offset);
        } else {
            newDate.setDate(newDate.getDate() + (offset * 7));
        }
        return newDate;
    });
  };

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
    } else { // week view
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
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&lt;</button>
        <h2 className="text-xl font-semibold">{headerTitle}</h2>
        <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&gt;</button>
      </div>
      <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-1 md:grid-cols-7'} gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700`}>
        {daysOfWeek.map(d => <div key={d} className="text-center font-medium py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800">{viewMode === 'month' ? d : d.slice(0,1)}</div>)}
        {days.map((d, index) => {
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();
          const dateString = d.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateString);
          
          const isToday = d.toDateString() === new Date().toDateString();
          const isSelected = selectedDate ? d.toDateString() === selectedDate.toDateString() : false;
          
          const dayOfWeekName = d.toLocaleDateString('en-US', { weekday: 'long' });
          const isOptimal = optimalTimes.some(ot => ot.time.toLowerCase().includes(dayOfWeekName.toLowerCase()));

          return (
            <div 
                key={index} 
                className={`relative p-2 min-h-[120px] transition-colors cursor-pointer 
                    ${isCurrentMonth || viewMode === 'week' ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}
                    ${isSelected ? 'ring-2 ring-primary-500 z-10' : ''}
                    ${!isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                    ${viewMode === 'week' ? 'border-t dark:border-gray-700' : ''}
                `}
                onClick={() => onDayClick(d)}
            >
              {/* 
                FIX: React Error #31 - "Objects are not valid as a React child"
                Issue: Template literal was trying to render 'undefined' when optimalTimes.find() returned undefined
                Solution: Added fallback string to prevent undefined from being rendered as React child
                Date: 2025-09-08 
              */}
              {isOptimal && <div className="absolute top-1 right-1" title={`AI Suggestion: ${optimalTimes.find(ot => ot.time.toLowerCase().includes(dayOfWeekName.toLowerCase()))?.reason || 'No specific reason available'}`}><Sparkles className="w-3 h-3 text-yellow-400"/></div>}
              <div className="flex items-center">
                 <span className={`text-sm ${isToday ? 'bg-primary-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold' : ''} ${isCurrentMonth || viewMode === 'week' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{d.getDate()}</span>
                 {viewMode === 'week' && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{daysOfWeek[d.getDay()]}</span>}
              </div>
              <div className="space-y-1 mt-1">
                {dayEvents.map(event => <CalendarEventComponent key={event.id} event={event} onClick={(e) => { e.stopPropagation(); onEventClick(event); }} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketingCalendar;