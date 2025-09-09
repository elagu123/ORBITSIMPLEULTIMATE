import React from 'react';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Page } from '../../../types/index';
import ActionCard from './ActionCard';
import { Coffee, TrendingUp, Moon } from '../../ui/Icons';

interface WhatsNextProps {
  setActivePage: (page: Page) => void;
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// Icon Components
const CustomersIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const ContentIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const CalendarIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);


const ACTIONS = {
  morning: [
    { title: "Plan Your Day", description: "Create and schedule today's content.", icon: <CalendarIcon />, page: 'Calendar' as Page },
    { title: "Engage with Customers", description: "Review recent interactions and send a message.", icon: <CustomersIcon />, page: 'Customers' as Page },
  ],
  afternoon: [
    { title: "Create Fresh Content", description: "Use AI to generate a new post for tomorrow.", icon: <ContentIcon />, page: 'Content' as Page },
    { title: "Analyze Performance", description: "Check your recent post analytics.", icon: <TrendingUp className="w-8 h-8" />, page: 'Dashboard' as Page },
  ],
  evening: [
    { title: "Review Tomorrow's Plan", description: "Check what's scheduled for tomorrow.", icon: <CalendarIcon />, page: 'Calendar' as Page },
    { title: "Wind Down & Learn", description: "Read a quick marketing tip from the AI.", icon: <Coffee className="w-8 h-8" />, page: 'Dashboard' as Page },
  ]
};

export const WhatsNext: React.FC<WhatsNextProps> = ({ setActivePage }) => {
  const timeOfDay = getTimeOfDay();
  const suggestedActions = ACTIONS[timeOfDay];
  const greeting = {
    morning: "Ready to start your day?",
    afternoon: "Keep the momentum going!",
    evening: "Wrapping up the day?"
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">What's Next?</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{greeting[timeOfDay]} Here are some suggested next steps:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestedActions.map(action => (
          <ActionCard 
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={() => setActivePage(action.page)}
          />
        ))}
      </div>
    </div>
  );
};
