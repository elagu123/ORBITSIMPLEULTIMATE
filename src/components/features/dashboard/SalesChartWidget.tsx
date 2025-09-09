import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// FIX: Corrected import path for types to point to the new single source of truth.
import { ChartData } from '../../../types/index';

const mockSalesData: ChartData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
  { name: 'Jul', revenue: 7000 },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SalesChartWidget: React.FC = () => {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-[400px] flex flex-col"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex-shrink-0">Revenue Overview</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockSalesData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs text-gray-500 dark:text-gray-400" />
            <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  backdropFilter: 'blur(5px)',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  color: '#333'
              }} 
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default React.memo(SalesChartWidget);