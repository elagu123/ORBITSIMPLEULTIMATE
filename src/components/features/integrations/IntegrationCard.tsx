import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
// FIX: Corrected import path for types to point to the new single source of truth.
import { Integration } from '../../../types/index';
import { useProfile } from '../../../store/profileContext';
import { aiService } from '../../../services/aiService';
import Button from '../../ui/Button';
import { Sparkles } from '../../ui/Icons';
import { motion } from 'framer-motion';

interface IntegrationCardProps {
    integration: Integration;
    isLoading: boolean;
    onConnect: (integration: Integration) => void;
    onDisconnect: (id: string) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, isLoading, onConnect, onDisconnect }) => {
    const { name, category, icon: Icon, connected, id } = integration;
    const { profile } = useProfile();
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    useEffect(() => {
        if (connected && profile && !summary) {
            const fetchSummary = async () => {
                setIsSummaryLoading(true);
                try {
                    const result = await aiService.getIntegrationSummary(name, profile);
                    setSummary(result);
                } catch (error: any) {
                    console.error(`Failed to fetch summary for ${name}`, error);
                    const errorMessage = (error.message || '').toString().toLowerCase();
                    if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('rate limit')) {
                        setSummary("API rate limit reached. Please try again in a moment.");
                    } else {
                        setSummary("Could not load summary.");
                    }
                } finally {
                    setIsSummaryLoading(false);
                }
            };
            fetchSummary();
        }
        if (!connected) {
            setSummary(null);
        }
    }, [connected, profile, name]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col items-start gap-3 border dark:border-gray-700">
            <div className="w-full flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{category}</p>
                    </div>
                </div>
                 <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {connected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            {connected && (
                <div className="w-full min-h-[50px] bg-white dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                     <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                     {isSummaryLoading ? (
                         <div className="w-full space-y-1 animate-pulse">
                             <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                             <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                         </div>
                     ) : (
                         <p>{summary}</p>
                     )}
                </div>
            )}
            
            <div className="w-full mt-auto">
                 {connected ? (
                    <Button size="sm" variant="secondary" onClick={() => onDisconnect(id)} disabled={isLoading} className="w-full">
                        {isLoading ? 'Processing...' : 'Disconnect'}
                    </Button>
                 ) : (
                    <Button size="sm" onClick={() => onConnect(integration)} disabled={isLoading} className="w-full">
                        {isLoading ? 'Processing...' : 'Connect'}
                    </Button>
                 )}
            </div>
        </motion.div>
    );
};
export default IntegrationCard;