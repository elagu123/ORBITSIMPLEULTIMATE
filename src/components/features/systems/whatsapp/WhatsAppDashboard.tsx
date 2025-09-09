import React, { useState } from 'react';
import WhatsAppConnect from './WhatsAppConnect';
import UnifiedInbox from './UnifiedInbox';
import CheckinManager from './CheckinManager';
import PromoCodeManager from './PromoCodeManager';
import WhatsAppReports from './WhatsAppReports';
import { MessageCircle, QrCode, Ticket, BarChart, Zap, Target, FileText, Box } from '../../../ui/Icons';
import ChatbotFlowBuilder from './ChatbotFlowBuilder';
import CampaignCreator from './CampaignCreator';
import TemplateBuilder from './TemplateBuilder';
import ProductCatalog from './ProductCatalog';

type WhatsAppTool = 'checkin' | 'promos' | 'reports' | 'inbox' | 'flows' | 'campaigns' | 'templates' | 'catalog';

const WhatsAppDashboard: React.FC = () => {
    const [isConnected, setIsConnected] = useState(true); // Default to connected for Phase 2
    const [activeTool, setActiveTool] = useState<WhatsAppTool>('flows');

    const tools: { id: WhatsAppTool; label: string; icon: React.ElementType; section: string }[] = [
        { id: 'inbox', label: 'Bandeja de Entrada', icon: MessageCircle, section: 'Comunicación' },
        { id: 'checkin', label: 'Check-in QR', icon: QrCode, section: 'Comunicación' },
        
        { id: 'flows', label: 'Flow Builder', icon: Zap, section: 'Automatización' },
        { id: 'campaigns', label: 'Campañas', icon: Target, section: 'Automatización' },
        { id: 'promos', label: 'Códigos Promo', icon: Ticket, section: 'Automatización' },
        
        { id: 'templates', label: 'Plantillas', icon: FileText, section: 'Gestión' },
        { id: 'catalog', label: 'Catálogo', icon: Box, section: 'Gestión' },
        { id: 'reports', label: 'Reportes', icon: BarChart, section: 'Gestión' },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'checkin': return <CheckinManager />;
            case 'promos': return <PromoCodeManager />;
            case 'reports': return <WhatsAppReports />;
            case 'inbox': return <UnifiedInbox />;
            case 'flows': return <ChatbotFlowBuilder />;
            case 'campaigns': return <CampaignCreator />;
            case 'templates': return <TemplateBuilder />;
            case 'catalog': return <ProductCatalog />;
            default: return null;
        }
    };

    if (!isConnected) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <WhatsAppConnect onConnect={() => setIsConnected(true)} />
            </div>
        );
    }

    const groupedTools = tools.reduce((acc, tool) => {
        if (!acc[tool.section]) acc[tool.section] = [];
        acc[tool.section].push(tool);
        return acc;
    }, {} as Record<string, typeof tools>);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[calc(100vh-12rem)] flex">
            {/* Sidebar Navigation */}
            <nav className="w-64 border-r dark:border-gray-700 p-4 space-y-4">
                 <div>
                    <h3 className="px-2 font-semibold text-lg">Suite de WhatsApp</h3>
                    <p className="px-2 text-xs text-gray-500 pb-2">Tu centro de automatización y crecimiento.</p>
                </div>
                {Object.entries(groupedTools).map(([section, toolItems]) => (
                    <div key={section}>
                        <h4 className="px-2 text-xs font-bold uppercase text-gray-400 mb-1">{section}</h4>
                        {toolItems.map(tool => (
                             <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
                                    activeTool === tool.id
                                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                            >
                                <tool.icon className="w-5 h-5 mr-3" />
                                <span>{tool.label}</span>
                            </button>
                        ))}
                    </div>
                ))}
            </nav>
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {renderTool()}
            </main>
        </div>
    );
};

export default WhatsAppDashboard;