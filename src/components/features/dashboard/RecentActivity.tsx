import React from 'react';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { RecentActivity as RecentActivityType } from '../../../types/index';

const UserPlusIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>;
const SparklesIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.669-.219-.669a2.25 2.25 0 00-1.423-1.423l-.669-.219.669-.219a2.25 2.25 0 001.423-1.423l.219-.669.219.669a2.25 2.25 0 001.423 1.423l.669.219-.669.219a2.25 2.25 0 00-1.423 1.423z" /></svg>;
const PaperAirplaneIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const CreditCardIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 21z" /></svg>;

const mockActivity: RecentActivityType[] = [
    { id: '1', type: 'customer_added', description: 'Jane Smith became a new customer.', timestamp: '2 hours ago', icon: UserPlusIcon },
    { id: '2', type: 'content_created', description: 'AI generated a post for the "Summer Sale".', timestamp: '5 hours ago', icon: SparklesIcon },
    { id: '3', type: 'post_published', description: '"Weekend Vibes" post was published to Instagram.', timestamp: '1 day ago', icon: PaperAirplaneIcon },
    { id: '4', type: 'sale_made', description: 'New sale recorded for John Doe ($120.00).', timestamp: '2 days ago', icon: CreditCardIcon },
    { id: '5', type: 'customer_added', description: 'Mark Johnson became a new customer.', timestamp: '3 days ago', icon: UserPlusIcon }
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const RecentActivity: React.FC = () => {
  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Activity</h3>
      <ul className="space-y-4">
        {mockActivity.map((item) => (
          <li key={item.id} className="flex items-start space-x-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{item.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default RecentActivity;