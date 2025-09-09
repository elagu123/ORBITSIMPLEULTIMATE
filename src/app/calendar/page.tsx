import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
// Lazy load heavy calendar component
const EnhancedMarketingCalendar = React.lazy(() => import('../../components/features/calendar/EnhancedMarketingCalendar'));
import CalendarSidebar from '../../components/features/calendar/CalendarSidebar';
import CalendarDetailPanel from '../../components/features/calendar/CalendarDetailPanel';
import Modal from '../../components/ui/Modal';
import EventForm from '../../components/features/calendar/EventForm';
// FIX: Corrected import path for types to point to the new single source of truth.
import { CalendarEvent, Page, PostContent, CalendarViewMode, OptimalTimeSlot } from '../../types/index';
import Button from '../../components/ui/Button';
import { useGamification } from '../../store/gamificationContext';
import { useOptimizedAppData } from '../../store/optimized/appDataContext';
import { useToastNotifications } from '../../store/toastContext';
import Toggle from '../../components/ui/Toggle';
import CalendarAIPanel from '../../components/features/calendar/CalendarAIPanel';
import CalendarSkeleton from '../../components/features/calendar/CalendarSkeleton';

interface CalendarPageProps {
  onNavigateWithContent: (content: PostContent, page: Page) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigateWithContent }) => {
    const { calendarEvents, setCalendarEvents } = useOptimizedAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2024, 6, 15));
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(calendarEvents[0]);
    const { addXp, unlockAchievement } = useGamification();
    const { success, error } = useToastNotifications();

    const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
    const [optimalTimes, setOptimalTimes] = useState<OptimalTimeSlot[]>([]);

    // Simple function to handle calendar event addition (for demo purposes)
    const addCalendarEvent = (event: CalendarEvent) => {
        console.log('Adding calendar event:', event);
        // In a real app, this would save to backend/state
        addXp(25); // Give XP for creating events
    };
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data to show skeleton
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = { id: String(Date.now()), ...eventData };
        setCalendarEvents(prev => [...prev, newEvent]);
        addXp(20);
        unlockAchievement('firstSchedule');
        if (calendarEvents.length + 1 >= 5) unlockAchievement('plannerPro');
    };

    const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
        setCalendarEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        if (selectedEvent?.id === updatedEvent.id) {
            setSelectedEvent(updatedEvent);
        }
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
    };
    
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedDate(new Date(event.date));
        setSelectedEvent(event);
    };

    const handleAddNew = () => {
        setEventToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleEditEventFromPanel = (event: CalendarEvent) => {
        setEventToEdit(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEventToEdit(null);
    };

    // Enhanced Calendar Functions
    const handleEventDuplicate = (event: CalendarEvent) => {
        const duplicatedEvent: CalendarEvent = {
            ...event,
            id: String(Date.now()),
            title: `${event.title} (Copy)`,
            status: 'draft'
        };
        setCalendarEvents(prev => [...prev, duplicatedEvent]);
        success('Event Duplicated', `"${event.title}" has been duplicated`);
        addXp(10);
    };

    const handleEventDelete = (eventId: string) => {
        const eventToDelete = calendarEvents.find(e => e.id === eventId);
        setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
        success('Event Deleted', `"${eventToDelete?.title}" has been deleted`);
        
        // Clear selection if deleted event was selected
        if (selectedEvent?.id === eventId) {
            setSelectedEvent(null);
        }
    };

    const handleBulkAction = (action: string, eventIds: string[]) => {
        const eventsToProcess = calendarEvents.filter(e => eventIds.includes(e.id));
        
        switch (action) {
            case 'delete':
                setCalendarEvents(prev => prev.filter(e => !eventIds.includes(e.id)));
                if (selectedEvent && eventIds.includes(selectedEvent.id)) {
                    setSelectedEvent(null);
                }
                break;
                
            case 'duplicate':
                const duplicatedEvents = eventsToProcess.map(event => ({
                    ...event,
                    id: String(Date.now() + Math.random()),
                    title: `${event.title} (Copy)`,
                    status: 'draft' as const
                }));
                setCalendarEvents(prev => [...prev, ...duplicatedEvents]);
                addXp(duplicatedEvents.length * 10);
                break;
                
            case 'archive':
                // In a real app, this would move events to an archived state
                setCalendarEvents(prev => prev.map(e => 
                    eventIds.includes(e.id) 
                        ? { ...e, status: 'draft' as const, title: `[Archived] ${e.title}` }
                        : e
                ));
                break;
        }
    };

    if (isLoading) {
        return <CalendarSkeleton />;
    }
    
    return (
        <div className="flex h-[calc(100vh-8rem)] bg-gray-100 dark:bg-gray-900 gap-4">
            {/* Left Panel */}
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 flex flex-col"
            >
                <CalendarSidebar onNavigateWithContent={onNavigateWithContent} />
                <div className="p-4 border-t dark:border-gray-700">
                    <CalendarAIPanel onSuggestions={setOptimalTimes} onAddDraft={addCalendarEvent} optimalTimes={optimalTimes}/>
                </div>
            </motion.div>

            {/* Center Panel */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md min-w-0"
            >
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <Toggle 
                        options={[{label: 'Month', value: 'month'}, {label: 'Week', value: 'week'}]}
                        value={viewMode}
                        onChange={(value) => setViewMode(value as CalendarViewMode)}
                    />
                    <Button onClick={handleAddNew}><PlusIcon /> Schedule Post</Button>
                </div>
                 <div className="flex-1 overflow-y-auto p-4">
                    <Suspense fallback={<CalendarSkeleton />}>
                        <EnhancedMarketingCalendar 
                            events={calendarEvents} 
                            onEventClick={handleEventClick} 
                            onDayClick={handleDayClick}
                            selectedDate={selectedDate}
                            viewMode={viewMode}
                            optimalTimes={optimalTimes}
                            onEventUpdate={handleUpdateEvent}
                            onEventDelete={handleEventDelete}
                            onEventDuplicate={handleEventDuplicate}
                            onBulkAction={handleBulkAction}
                        />
                    </Suspense>
                </div>
            </motion.div>

            {/* Right Panel */}
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 flex flex-col overflow-y-auto"
            >
                <CalendarDetailPanel 
                    selectedDate={selectedDate} 
                    selectedEvent={selectedEvent} 
                    onEditEvent={handleEditEventFromPanel}
                />
            </motion.div>

            <Modal title={eventToEdit ? "Edit Post" : "Schedule New Post"} isOpen={isModalOpen} onClose={closeModal}>
                <EventForm 
                    event={eventToEdit} 
                    onSubmit={eventToEdit ? handleUpdateEvent : handleAddEvent} 
                    onCancel={closeModal} 
                />
            </Modal>
        </div>
    );
};

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

export default CalendarPage;