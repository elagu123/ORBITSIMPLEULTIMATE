import React from 'react';
import StatCard from './StatCard';
// FIX: Corrected import path for types to point to the new single source of truth.
import { DashboardData } from '../../../types/index';

// Mock data for demonstration
const mockDashboardData: DashboardData['metrics'] = {
    totalCustomers: { value: '1,204', change: 12.5, changeType: 'increase' },
    contentGenerated: { value: 86, change: 5.2, changeType: 'decrease' },
    scheduledPosts: { value: 22, change: 30.0, changeType: 'increase' },
    revenue: { value: '$5,430', change: 8.1, changeType: 'increase' },
};

const StatCardGrid: React.FC = () => {
  const data = mockDashboardData;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard 
        title="Total Customers"
        value={data.totalCustomers.value}
        change={data.totalCustomers.change}
        changeType={data.totalCustomers.changeType}
        icon={<UsersIcon />}
      />
      <StatCard 
        title="Content Generated"
        value={data.contentGenerated.value}
        change={data.contentGenerated.change}
        changeType={data.contentGenerated.changeType}
        icon={<ClipboardIcon />}
      />
      <StatCard 
        title="Scheduled Posts"
        value={data.scheduledPosts.value}
        change={data.scheduledPosts.change}
        changeType={data.scheduledPosts.changeType}
        icon={<CalendarIcon />}
      />
       <StatCard 
        title="Revenue (Month)"
        value={data.revenue.value}
        change={data.revenue.change}
        changeType={data.revenue.changeType}
        icon={<DollarIcon />}
      />
    </div>
  );
};

// Icons
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ClipboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const CalendarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const DollarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 16v-2m-4-4h8" /></svg>;

export default StatCardGrid;