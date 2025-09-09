import React, { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bell, CheckCircle, CreditCard, Lightbulb, Link, Plug, Zap, AlertTriangle, CalendarDays, Mail, Store, TrendingUp, Tablet, CashRegister, WhatsAppIcon, Users, UserPlus } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import WhatsAppDashboard from '../../components/features/systems/whatsapp/WhatsAppDashboard';
import { HumanizedMetric, ActionableInsight, SmartNotification, SmartNotificationCategory, Integration } from '../../types/index';
import { useProfile } from '../../store/profileContext';
import { useAppData } from '../../store/appDataContext';
import { aiService } from '../../services/aiService';
import HumanizedMetricCard from '../../components/features/systems/analytics/HumanizedMetricCard';
import ActionableInsightCard from '../../components/features/systems/analytics/ActionableInsightCard';
import NotificationCard from '../../components/features/systems/notifications/NotificationCard';
import PointOfSale from '../../components/features/systems/storefront/PointOfSale';
import IntegrationCard from '../../components/features/integrations/IntegrationCard';
import ConnectionModal from '../../components/features/systems/integrations/ConnectionModal';
import KioskMode from '../../components/features/systems/storefront/KioskMode';
import AnalyticsViewSkeleton from '../../components/features/systems/analytics/AnalyticsViewSkeleton';
import NotificationsViewSkeleton from '../../components/features/systems/notifications/NotificationsViewSkeleton';


type Section = 'workflows' | 'analytics' | 'notifications' | 'integrations' | 'storefront';

const SystemsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('storefront');

    const sections: { id: Section; label: string; icon: React.ElementType }[] = [
        { id: 'storefront', label: 'Registro de Ventas', icon: Store },
        { id: 'workflows', label: 'Workflows (WhatsApp)', icon: Zap },
        { id: 'analytics', label: 'Analytics Humanizadas', icon: BarChart },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'integrations', label: 'Integraciones', icon: Plug }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'workflows': return <WhatsAppDashboard />;
            case 'analytics': return <AnalyticsView />;
            case 'notifications': return <NotificationsView />;
            case 'integrations': return <IntegrationsView />;
            case 'storefront': return <StorefrontView />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-8rem)] bg-gray-100 dark:bg-gray-900 gap-6">
            <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-shrink-0">
                <nav className="flex lg:flex-col gap-1 overflow-x-auto">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${
                                activeSection === section.id
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <section.icon className="w-5 h-5 mr-3" />
                            <span>{section.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

// --- View Components ---
// FIX: Defined the missing `IntegrationsView` component to resolve a render error.
const MOCK_INTEGRATIONS: Integration[] = [
    { id: 'mp', name: 'MercadoPago', category: 'Pagos', icon: CreditCard, connected: true },
    { id: 'gcal', name: 'Google Calendar', category: 'Calendario', icon: CalendarDays, connected: true },
    { id: 'mailchimp', name: 'Mailchimp', category: 'Email', icon: Mail, connected: false },
    { id: 'tiendanube', name: 'Tiendanube', category: 'E-commerce', icon: Store, connected: false },
];

const IntegrationsView: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleConnect = (integration: Integration) => {
        setSelectedIntegration(integration);
        setIsModalOpen(true);
    };

    const handleDisconnect = (id: string) => {
        setIsLoading(id);
        setTimeout(() => {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false } : i));
            setIsLoading(null);
        }, 1000);
    };

    const handleConnectSuccess = (id: string) => {
        setIsLoading(id);
        setTimeout(() => {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i));
            setIsLoading(null);
        }, 1000);
    };

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Integraciones</h2>
                <p className="text-gray-500">Conecta tus herramientas para automatizar tareas y centralizar tu información.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map(int => (
                    <IntegrationCard 
                        key={int.id}
                        integration={int}
                        isLoading={isLoading === int.id}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                    />
                ))}
            </div>
            <ConnectionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                integration={selectedIntegration}
                onConnectSuccess={handleConnectSuccess}
            />
        </div>
    );
};


const StorefrontView: React.FC = () => {
    const [isPosOpen, setIsPosOpen] = useState(false);
    const [isKioskOpen, setIsKioskOpen] = useState(false);
    const [integrations, setIntegrations] = useState<Integration[]>([
        { id: 'mp', name: 'MercadoPago Point', category: 'Pagos', icon: CreditCard, connected: false },
        { id: 'tiendanube', name: 'Tiendanube', category: 'E-commerce', icon: Store, connected: false },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

    const handleConnect = (integration: Integration) => {
        setSelectedIntegration(integration);
        setIsModalOpen(true);
    };

    const handleConnectSuccess = (id: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i));
    };

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-8">
            <AnimatePresence>
                {isPosOpen && <PointOfSale onClose={() => setIsPosOpen(false)} />}
                {isKioskOpen && <KioskMode onClose={() => setIsKioskOpen(false)} />}
            </AnimatePresence>
            
            <div>
                <h2 className="text-3xl font-bold mb-2">Orbit Storefront OS</h2>
                <p className="text-gray-500">Herramientas inteligentes para tu local físico. Registra ventas, clientes y optimiza tu operación.</p>
            </div>
            
            {/* Section 1: Tools for You */}
            <StorefrontSection title="Herramientas para Ti" description="Gestiona ventas y operaciones desde tu mostrador.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StorefrontToolCard
                        icon={WhatsAppIcon}
                        iconColor="text-green-500"
                        title="Registro por WhatsApp"
                        description="La forma más rápida (10s). Envía un mensaje desde tu celular y listo."
                    >
                        <WhatsAppChatSimulation />
                    </StorefrontToolCard>
                    <StorefrontToolCard
                        icon={Tablet}
                        iconColor="text-blue-500"
                        title="Registro Visual (POS)"
                        description="Ideal para usar en un mostrador con una tablet o computadora."
                    >
                         <Button onClick={() => setIsPosOpen(true)} className="mt-4"><CashRegister className="w-5 h-5 mr-2"/> Abrir Punto de Venta</Button>
                    </StorefrontToolCard>
                </div>
            </StorefrontSection>

            {/* Section 2: Tools for your Customers */}
             <StorefrontSection title="Herramientas para tus Clientes" description="Mejora la experiencia en tu local y captura datos sin esfuerzo.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <StorefrontToolCard
                        icon={Users}
                        iconColor="text-indigo-500"
                        title="Modo Kiosko"
                        description="Permite que tus clientes hagan check-in solos al llegar. Ideal para una tablet en la entrada."
                    >
                         <Button onClick={() => setIsKioskOpen(true)} className="mt-4"><UserPlus className="w-5 h-5 mr-2"/> Lanzar Kiosko</Button>
                    </StorefrontToolCard>
                </div>
            </StorefrontSection>

            {/* Section 3: Automatic Tools */}
            <StorefrontSection title="Herramientas Automáticas" description="Conecta tus sistemas para que las ventas se registren solas.">
                 <StorefrontToolCard
                    icon={Zap}
                    iconColor="text-yellow-500"
                    title="Registro Automático"
                    description="Conecta tus herramientas para que las ventas se registren solas."
                >
                    <div className="space-y-2 mt-4">
                        {integrations.map(integration => (
                            <div key={integration.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md">
                                <div className="flex items-center gap-2">
                                    <integration.icon className="w-5 h-5 text-gray-500" />
                                    <p className="font-semibold">{integration.name}</p>
                                </div>
                                {integration.connected ? (
                                     <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <CheckCircle className="w-4 h-4" /> Conectado
                                    </div>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={() => handleConnect(integration)}>Conectar</Button>
                                )}
                            </div>
                        ))}
                    </div>
                </StorefrontToolCard>
            </StorefrontSection>

            <ConnectionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                integration={selectedIntegration}
                onConnectSuccess={handleConnectSuccess}
            />
        </div>
    );
};

const StorefrontSection: React.FC<{title: string; description: string; children: ReactNode;}> = ({ title, description, children }) => (
    <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        {children}
    </div>
);

const StorefrontToolCard: React.FC<{icon: React.ElementType; iconColor: string; title: string; description: string; children: ReactNode;}> = ({ icon: Icon, iconColor, title, description, children }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border dark:border-gray-700 h-full flex flex-col">
        <div className="flex-grow">
            <h3 className={`text-xl font-bold flex items-center gap-2`}><Icon className={`w-6 h-6 ${iconColor}`}/> {title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">{description}</p>
        </div>
        <div>{children}</div>
    </div>
);


const WhatsAppChatSimulation: React.FC = () => {
    return (
        <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Ejemplo de uso:</p>
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border-l-4 border-green-500 space-y-3">
                 <div className="flex justify-end">
                    <div className="bg-green-200 dark:bg-green-700 p-2 rounded-lg max-w-xs">
                        <p className="text-sm">Venta Laura 8500</p>
                    </div>
                </div>
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg max-w-xs">
                        <p className="text-sm">✅ Registrado:<br/>Cliente: Laura García<br/>Monto: $8,500<br/>Medio: Efectivo<br/>¿Correcto?</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AnalyticsView: React.FC = () => {
    const { profile } = useProfile();
    const { customers } = useAppData();
    const [metrics, setMetrics] = useState<HumanizedMetric[]>([]);
    const [insights, setInsights] = useState<ActionableInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!profile) return;
            setIsLoading(true);
            try {
                // Stagger API calls slightly
                await new Promise(resolve => setTimeout(resolve, 300));
                const [metricsData, insightsData] = await Promise.all([
                    aiService.getHumanizedMetrics(profile),
                    aiService.getActionableInsights(profile, customers),
                ]);
                setMetrics(metricsData);
                setInsights(insightsData);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [profile, customers]);

    if (isLoading) {
        return <AnalyticsViewSkeleton />;
    }

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Analytics Humanizadas</h2>
                <p className="text-gray-500">Tus métricas clave, traducidas por la IA para que entiendas todo fácil y rápido.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((metric, i) => <HumanizedMetricCard key={i} {...metric} />)}
            </div>
            <div>
                <h3 className="text-xl font-semibold mt-4">Insights Accionables</h3>
                 <div className="space-y-3 mt-3">
                    {insights.map((insight, i) => <ActionableInsightCard key={i} {...insight} />)}
                </div>
            </div>
        </div>
    );
};

const iconMap: { [key: string]: React.ElementType } = {
    'alert': AlertTriangle,
    'trending_up': TrendingUp,
    'warning': AlertTriangle,
    'info': Lightbulb,
    'mail': Mail,
    'calendar': CalendarDays
};

const NotificationsView: React.FC = () => {
    const { profile } = useProfile();
    const [notifications, setNotifications] = useState<SmartNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!profile) return;
            setIsLoading(true);
            try {
                 // Stagger API calls slightly
                await new Promise(resolve => setTimeout(resolve, 300));
                const data = await aiService.getSmartNotifications(profile);
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, [profile]);

    if (isLoading) {
        return <NotificationsViewSkeleton />;
    }

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <div>
                <h2 className="text-3xl font-bold mb-2">Centro de Notificaciones Inteligentes</h2>
                <p className="text-gray-500">La IA te avisa sobre lo más importante para que no se te escape nada.</p>
            </div>
            <div className="space-y-4">
                {notifications.map(notif => (
                    <NotificationCard 
                        key={notif.id}
                        category={notif.category}
                        Icon={iconMap[notif.icon] || Lightbulb}
                        title={notif.title}
                        description={notif.description}
// FIX: Correctly passed `timestamp` and action labels as props to `NotificationCard` to match its expected properties.
                        timestamp={notif.timestamp}
                        primaryActionLabel={notif.actions.primary.label}
                        secondaryActionLabel={notif.actions.secondary?.label}
                    />
                ))}
            </div>
        </div>
    );
};

export default SystemsPage;