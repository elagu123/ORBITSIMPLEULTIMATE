import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';
import { Gift, TrendingUp, AlertTriangle, CheckCircle, ThumbsUp, Clock } from '../../ui/Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Insight {
    id: number;
    icon: ReactNode;
    title: string;
    description: string;
    type: 'risk' | 'opportunity' | 'optimization';
}

const insights: Insight[] = [
    { 
        id: 1, 
        icon: <AlertTriangle className="w-6 h-6"/>, 
        title: 'Churn Risk Detected', 
        description: 'We\'ve detected that 3 VIP customers haven\'t purchased in the last 45 days. They may be at risk of churning.', 
        type: 'risk' 
    },
    { 
        id: 2, 
        icon: <Gift className="w-6 h-6"/>, 
        title: 'Content Opportunity: Business Anniversary', 
        description: 'Your business turns 3 years old next week. This is a great opportunity for a celebration campaign.', 
        type: 'opportunity' 
    },
    { 
        id: 3, 
        icon: <TrendingUp className="w-6 h-6"/>, 
        title: 'Performance Optimization: Best Posting Times', 
        description: 'Your posts on Wednesdays at 7 PM get 30% more engagement. We should prioritize this time slot.', 
        type: 'optimization' 
    }
];

const mockPerformanceMetrics = [
    { title: "Command Accuracy", value: "92.7%", icon: <CheckCircle className="w-5 h-5"/>, color: "green" },
    { title: "Suggestions Accepted", value: "78.1%", icon: <ThumbsUp className="w-5 h-5"/>, color: "blue" },
    { title: "Time Saved (Est.)", value: "12.5 hrs", icon: <Clock className="w-5 h-5"/>, color: "purple" }
];

const mockLearningData = [
    { month: "Jan", learned: 15 }, { month: "Feb", learned: 28 },
    { month: "Mar", learned: 45 }, { month: "Apr", learned: 72 },
    { month: "May", learned: 110 }, { month: "Jun", learned: 145 }
];

const mockCommandData = [
    { name: 'Content', value: 45 },
    { name: 'Customers', value: 25 },
    { name: 'Analytics', value: 18 },
    { name: 'Scheduling', value: 12 }
];
const COLORS = ['#3b82f6', '#818cf8', '#a78bfa', '#c084fc'];


const AnalysisMode: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Predictive Insights</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Proactive analysis to help you grow.</p>
        </div>
        <div className="space-y-4">
            {insights.map((insight, index) => (
                <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Performance Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tracking the AI's impact and learning.</p>
        </div>
      
        <div className="grid grid-cols-3 gap-3">
            {mockPerformanceMetrics.map((metric, index) => (
                <PerformanceMetricCard key={index} {...metric} index={index} />
            ))}
        </div>

        <AnalyticsChartCard title="AI Learning Evolution (Learned Facts)">
            <ResponsiveContainer width="100%" height={150}>
                <LineChart data={mockLearningData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                    <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                    <Tooltip contentStyle={{ fontSize: '12px', padding: '5px 8px', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(5px)' }} />
                    <Line type="monotone" dataKey="learned" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Command Usage Distribution">
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie data={mockCommandData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {mockCommandData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', padding: '5px 8px', borderRadius: '0.5rem' }} />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px', lineHeight: '1.5'}}/>
                </PieChart>
            </ResponsiveContainer>
        </AnalyticsChartCard>
    </div>
  );
};

const InsightCard: React.FC<{insight: Insight; index: number}> = ({ insight, index }) => {
    const typeClasses = {
        risk: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-500/30', iconBg: 'bg-red-100 dark:bg-red-500/20', iconText: 'text-red-600 dark:text-red-300' },
        opportunity: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-500/30', iconBg: 'bg-green-100 dark:bg-green-500/20', iconText: 'text-green-600 dark:text-green-300' },
        optimization: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-500/30', iconBg: 'bg-blue-100 dark:bg-blue-500/20', iconText: 'text-blue-600 dark:text-blue-300' }
    };
    const colors = typeClasses[insight.type];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors.iconBg} ${colors.iconText}`}>{insight.icon}</div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">{insight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                <div className="mt-3 flex space-x-2">
                    <Button size="sm">View Details</Button>
                    <Button size="sm" variant="secondary">Dismiss</Button>
                </div>
            </div>
          </div>
        </motion.div>
    );
};

const PerformanceMetricCard: React.FC<{title: string, value: string, icon: ReactNode, color: string, index: number}> = ({ title, value, icon, color, index }) => {
    const colors: {[key: string]: string} = {
        green: 'text-green-500',
        blue: 'text-blue-500',
        purple: 'text-purple-500',
    };
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center"
        >
            <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 ${colors[color]}`}>{icon}</div>
            <p className="text-xl font-bold mt-2 text-gray-800 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{title}</p>
        </motion.div>
    );
};

const AnalyticsChartCard: React.FC<{title: string, children: ReactNode}> = ({ title, children }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
        >
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h4>
            {children}
        </motion.div>
    );
};

export default AnalysisMode;