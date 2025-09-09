import React from 'react';
import { CalendarEvent } from '../../../types/index';
import Button from '../../ui/Button';
import { Lightbulb, Pencil } from '../../ui/Icons';

interface CalendarDetailPanelProps {
    selectedDate: Date | null;
    selectedEvent: CalendarEvent | null;
    onEditEvent: (event: CalendarEvent) => void;
}

const CalendarDetailPanel: React.FC<CalendarDetailPanelProps> = ({ selectedDate, selectedEvent, onEditEvent }) => {
    
    const renderContent = () => {
        if (selectedEvent) {
            return <EventDetailView event={selectedEvent} onEdit={onEditEvent} />;
        }
        if (selectedDate) {
            return <DateDetailView date={selectedDate} />;
        }
        return <PlaceholderView />;
    };
    
    return (
        <div className="p-4 h-full">
            {renderContent()}
        </div>
    );
};

const PlaceholderView: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <p>Select a day or an event to see details.</p>
    </div>
);

const DateDetailView: React.FC<{ date: Date }> = ({ date }) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    const MOCK_AI_SUGGESTION = `For ${dayOfWeek}, consider a post about a customer's success story. It's great for building community and trust! #CustomerLove`;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{dayOfWeek}</h3>
                <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
                <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-300 mt-0.5 flex-shrink-0" />
                    <div>
                        <h5 className="font-semibold text-blue-800 dark:text-blue-200">AI Suggestion</h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300/80">
                            {MOCK_AI_SUGGESTION}
                        </p>
                         <Button size="sm" className="mt-3">Generate this post</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventDetailView: React.FC<{ event: CalendarEvent, onEdit: (event: CalendarEvent) => void }> = ({ event, onEdit }) => {
    
    const statusColors: Record<CalendarEvent['status'], string> = {
        draft: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
        scheduled: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        published: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
        editing: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onEdit(event)}><Pencil className="w-3 h-3 mr-1.5" /> Edit</Button>
            </div>
           
            <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[event.status]}`}>{event.status}</span>
            </div>

            {event.content && (
                <div className="pt-4 border-t dark:border-gray-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Content</h4>
                    <p className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg whitespace-pre-wrap">
                        {event.content}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CalendarDetailPanel;