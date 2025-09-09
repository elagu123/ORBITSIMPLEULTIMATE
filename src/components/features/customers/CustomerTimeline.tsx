import React from 'react';
import { EnhancedCustomer, TimelineEvent as TimelineEventType, TimelineEventType as EventType } from '../../../types/index';
import { Sparkles, ShoppingBag, Pencil, Mail, Phone, Star, Users, CalendarDays, ThumbsUp, Lightbulb } from '../../ui/Icons';

interface CustomerTimelineProps {
  customer: EnhancedCustomer;
}

const eventVisuals: Record<EventType, { icon: React.ElementType, color: string }> = {
  purchase: { icon: ShoppingBag, color: 'bg-green-500' },
  note: { icon: Pencil, color: 'bg-gray-500' },
  communication: { icon: Mail, color: 'bg-blue-500' },
  appointment: { icon: CalendarDays, color: 'bg-cyan-500' },
  feedback: { icon: ThumbsUp, color: 'bg-orange-500' },
  milestone: { icon: Star, color: 'bg-yellow-500' },
  prediction: { icon: Lightbulb, color: 'bg-indigo-500' },
  ai_insight: { icon: Sparkles, color: 'bg-purple-500' },
  meeting: { icon: Users, color: 'bg-teal-500' },
};

const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ customer }) => {
  return (
    <div className="p-6 h-full">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Activity Timeline</h3>
        <div className="overflow-y-auto pr-2 h-[calc(100%-2.5rem)]">
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4">
            {customer.timeline.length > 0 ? customer.timeline.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(event => (
                <TimelineEvent key={event.id} event={event} />
            )) : (
                <p className="pl-8 text-gray-500 italic">No timeline events yet.</p>
            )}
            </div>
        </div>
    </div>
  );
};

const TimelineEvent: React.FC<{ event: TimelineEventType }> = ({ event }) => {
  const { icon: Icon, color } = eventVisuals[event.type] || eventVisuals.note;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const renderDetails = () => {
    if (!event.details) return null;
    return (
        <>
            {event.details.amount && (
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">${event.details.amount.toFixed(2)}</p>
            )}
            {event.details.status && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">Status: {event.details.status}</p>
            )}
            {event.details.suggestedAction && (
                 <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">Suggested Action: {event.details.suggestedAction}</p>
            )}
        </>
    )
  }

  return (
    <div className="mb-8 ml-8">
      <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 ${color} rounded-full ring-4 ring-white dark:ring-gray-800`}>
        <Icon className="w-4 h-4 text-white" />
      </span>
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
            <time className="text-xs font-normal text-gray-500 dark:text-gray-400">{formattedDate}</time>
            {event.details?.user && <span className="text-xs font-medium text-gray-600 dark:text-gray-300">by {event.details.user}</span>}
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200">{event.description}</p>
        {renderDetails()}
      </div>
    </div>
  );
};

export default CustomerTimeline;