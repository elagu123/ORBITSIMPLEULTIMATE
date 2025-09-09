import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedCustomer } from '../../../types/index';
import { useToastNotifications } from '../../../store/toastContext';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  Award,
  Target,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Zap
} from '../../ui/Icons';
import Button from '../../ui/Button';

interface AdvancedCustomerAnalyticsProps {
  customers: EnhancedCustomer[];
  onExport?: (data: any) => void;
  onRefresh?: () => void;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface CustomerSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

const AdvancedCustomerAnalytics: React.FC<AdvancedCustomerAnalyticsProps> = ({
  customers,
  onExport,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'segments' | 'trends' | 'predictions'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const { success, info } = useToastNotifications();

  // Calculate metrics
  const metrics = useMemo((): MetricCard[] => {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.transactions.totalSpent, 0);
    const avgOrderValue = totalRevenue / totalCustomers || 0;
    const highValueCustomers = customers.filter(c => c.transactions.totalSpent > 500).length;
    const churnRisk = customers.filter(c => c.aiAnalysis.churnRisk.level === 'high').length;
    
    return [
      {
        title: 'Total Customers',
        value: totalCustomers,
        change: 12.5,
        changeType: 'increase',
        icon: Users,
        color: 'blue'
      },
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 8.3,
        changeType: 'increase',
        icon: DollarSign,
        color: 'green'
      },
      {
        title: 'Avg Order Value',
        value: `$${avgOrderValue.toFixed(2)}`,
        change: -2.1,
        changeType: 'decrease',
        icon: BarChart3,
        color: 'orange'
      },
      {
        title: 'High Value Customers',
        value: highValueCustomers,
        change: 15.7,
        changeType: 'increase',
        icon: Award,
        color: 'purple'
      },
      {
        title: 'At-Risk Customers',
        value: churnRisk,
        change: -5.2,
        changeType: 'decrease',
        icon: AlertTriangle,
        color: 'red'
      }
    ];
  }, [customers]);

  // Calculate customer segments
  const segments = useMemo((): CustomerSegment[] => {
    const total = customers.length;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const vips = customers.filter(c => c.business.lifecycle === 'vip' || c.transactions.totalSpent > 1000).length;
    const newCustomers = customers.filter(c => new Date(c.business.dateAdded) > thirtyDaysAgo).length;
    const regulars = customers.filter(c => c.timeline.filter(t => t.type === 'purchase').length >= 3).length;
    const atRisk = customers.filter(c => c.aiAnalysis.churnRisk.level === 'high').length;

    return [
      {
        name: 'VIP Customers',
        count: vips,
        percentage: (vips / total) * 100,
        color: 'gold',
        trend: 'up'
      },
      {
        name: 'Regular Customers',
        count: regulars,
        percentage: (regulars / total) * 100,
        color: 'green',
        trend: 'stable'
      },
      {
        name: 'New Customers',
        count: newCustomers,
        percentage: (newCustomers / total) * 100,
        color: 'blue',
        trend: 'up'
      },
      {
        name: 'At-Risk',
        count: atRisk,
        percentage: (atRisk / total) * 100,
        color: 'red',
        trend: 'down'
      }
    ];
  }, [customers]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onRefresh?.();
    setIsLoading(false);
    success('Data Refreshed', 'Customer analytics have been updated');
  };

  const handleExport = () => {
    const exportData = {
      metrics,
      segments,
      customers: customers.map(c => ({
        name: `${c.personal.firstName} ${c.personal.lastName}`,
        email: c.personal.email,
        totalSpent: c.transactions.totalSpent,
        lifecycle: c.business.lifecycle,
        churnRisk: c.aiAnalysis.churnRisk.level
      }))
    };
    onExport?.(exportData);
    info('Export Started', 'Customer analytics are being prepared for download');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return BarChart3;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
      green: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
      red: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
      gold: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Analytics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advanced insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            leftIcon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'segments', label: 'Segments' },
          { key: 'trends', label: 'Trends' },
          { key: 'predictions', label: 'AI Predictions' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`
              flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all
              ${activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  const colorClasses = getColorClasses(metric.color);
                  
                  return (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${colorClasses}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-8 h-8 opacity-80" />
                        <div className={`flex items-center text-xs ${
                          metric.changeType === 'increase' ? 'text-green-600 dark:text-green-400' :
                          metric.changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : metric.changeType === 'decrease' ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : null}
                          {Math.abs(metric.change)}%
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1">{metric.value}</div>
                      <div className="text-sm opacity-80">{metric.title}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'segments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {segments.map((segment, index) => {
                const TrendIcon = getTrendIcon(segment.trend);
                const colorClasses = getColorClasses(segment.color);
                
                return (
                  <motion.div
                    key={segment.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg border-2 ${colorClasses}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{segment.name}</h3>
                      <TrendIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold">{segment.count}</div>
                        <div className="text-sm opacity-80">customers</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold">{segment.percentage.toFixed(1)}%</div>
                        <div className="text-sm opacity-80">of total</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Trends Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced trend charts and analysis will be available here
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm">Predicted Churn Risk</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {customers.filter(c => c.aiAnalysis.churnRisk.level === 'high').length} customers
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm">Upsell Opportunities</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {customers.filter(c => c.aiAnalysis.upsellOpportunity).length} customers
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommendations</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-sm font-medium mb-1">Focus on VIP Retention</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Your VIP customers generate 60% of revenue
                    </div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-sm font-medium mb-1">Re-engage At-Risk Customers</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Send personalized offers to reduce churn
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedCustomerAnalytics;