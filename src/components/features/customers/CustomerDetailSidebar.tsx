import React from 'react';
import { EnhancedCustomer } from '../../../types/index';
import Badge from '../../ui/Badge';
import { Phone, Mail, AlertTriangle, TrendingUp, Sparkles, Clock } from '../../ui/Icons';
import { motion } from 'framer-motion';

interface CustomerDetailSidebarProps {
    customer: EnhancedCustomer;
    analysis: EnhancedCustomer['aiAnalysis'] | null;
    isLoading: boolean;
}

const CustomerDetailSidebar: React.FC<CustomerDetailSidebarProps> = ({ customer, analysis, isLoading }) => {
    const healthScore = analysis ? (1 - analysis.churnRisk.score) * 100 : 50;
    
    let healthColor = 'text-green-500';
    if (healthScore < 70) healthColor = 'text-yellow-500';
    if (healthScore < 40) healthColor = 'text-red-500';

    return (
        <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="text-center">
                <img src={customer.avatar} alt="avatar" className="w-24 h-24 rounded-full mx-auto border-4 border-primary-200 dark:border-primary-500/50" />
                <h3 className="text-xl font-bold mt-3 text-gray-800 dark:text-white">{customer.personal.firstName} {customer.personal.lastName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{customer.business.lifecycle}</p>
            </div>
            
            {/* Contact Info */}
            <InfoSection title="Contact">
                <div className="text-sm space-y-2">
                    <p className="flex items-center text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4 mr-2" /> {customer.personal.email}</p>
                    <p className="flex items-center text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4 mr-2" /> {customer.personal.phone}</p>
                </div>
            </InfoSection>

            {/* AI Predictive Analysis */}
            <InfoSection title="AI Predictive Analysis">
                 {isLoading ? <AnalysisSkeleton /> : analysis && (
                    <div className="space-y-4">
                        <AnalysisItem 
                            icon={<AlertTriangle />} 
                            label="Churn Risk" 
                            value={analysis.churnRisk.level}
                            valueColor={analysis.churnRisk.level === 'high' ? 'text-red-500' : analysis.churnRisk.level === 'medium' ? 'text-yellow-500' : 'text-green-500'}
                            detail={analysis.churnRisk.explanation || `Main factor: ${analysis.churnRisk.mainFactor}`}
                        />
                         <AnalysisItem 
                            icon={<Clock />} 
                            label="Predicted Next Visit" 
                            value={new Date(analysis.nextVisitPrediction.predictedDate).toLocaleDateString()}
                            detail={`Confidence: ${analysis.nextVisitPrediction.confidence}`}
                        />
                        {analysis.upsellOpportunity && (
                            <AnalysisItem 
                                icon={<TrendingUp />} 
                                label="Upsell Opportunity" 
                                value={analysis.upsellOpportunity.productOrService}
                                detail={analysis.upsellOpportunity.explanation || analysis.upsellOpportunity.reason}
                            />
                        )}
                    </div>
                )}
            </InfoSection>

            {/* Health Score */}
            <InfoSection title="Customer Health">
                <div className="flex items-center justify-between">
                    <span className={`text-3xl font-bold ${healthColor}`}>{healthScore.toFixed(0)}%</span>
                    <div className="w-2/3">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <motion.div 
                                className={`${healthColor.replace('text-','bg-')} h-2.5 rounded-full`} 
                                initial={{ width: 0 }}
                                animate={{ width: `${healthScore}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </InfoSection>
        </div>
    );
};


const InfoSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
        {children}
    </div>
);

const AnalysisItem: React.FC<{icon: React.ReactNode, label: string, value: string, detail: string, valueColor?: string}> = ({ icon, label, value, detail, valueColor = 'text-gray-800 dark:text-white' }) => (
    <div className="flex items-start gap-3">
        <div className="text-gray-400 mt-1">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`font-semibold ${valueColor}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
    </div>
);

const AnalysisSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
);

export default CustomerDetailSidebar;