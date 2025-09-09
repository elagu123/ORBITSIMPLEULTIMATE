import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartData } from '../../../types/index';
import { TrendingUp, BarChart3, Activity } from '../../ui/Icons';

const mockSalesData: ChartData = [
  { name: 'Jan', revenue: 4000, target: 3500 },
  { name: 'Feb', revenue: 3000, target: 3200 },
  { name: 'Mar', revenue: 5000, target: 4000 },
  { name: 'Apr', revenue: 4500, target: 4200 },
  { name: 'May', revenue: 6000, target: 5000 },
  { name: 'Jun', revenue: 5500, target: 5200 },
  { name: 'Jul', revenue: 7000, target: 6000 },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SalesChartWidget: React.FC = () => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const currentRevenue = mockSalesData[mockSalesData.length - 1]?.revenue || 0;
  const previousRevenue = mockSalesData[mockSalesData.length - 2]?.revenue || 0;
  const growth = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.dataKey === 'revenue' ? 'Revenue' : 'Target'}: 
                <span className="font-semibold ml-1">${entry.value.toLocaleString()}</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-[450px] flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {growth.startsWith('-') ? '↓' : '↑'} {Math.abs(parseFloat(growth))}% from last period
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="text-xs bg-gray-100/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="7d">7D</option>
            <option value="30d">30D</option>
            <option value="90d">90D</option>
          </select>
          
          <div className="flex bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded transition-colors ${
                chartType === 'area' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded transition-colors ${
                chartType === 'bar' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={mockSalesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50 dark:stroke-gray-700/50" />
              <XAxis 
                dataKey="name" 
                className="text-xs text-gray-500 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs text-gray-500 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorTarget)" 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          ) : (
            <BarChart
              data={mockSalesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50 dark:stroke-gray-700/50" />
              <XAxis 
                dataKey="name" 
                className="text-xs text-gray-500 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs text-gray-500 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="target" fill="#10b981" opacity={0.6} radius={[2, 2, 0, 0]} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default React.memo(SalesChartWidget);