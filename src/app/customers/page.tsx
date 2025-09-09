import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { EnhancedCustomer, CustomerFormData, TimelineEvent, Page, PostContent, AIRecommendedAction } from '../../types/index';
import { useOptimizedAppData } from '../../store/optimized/appDataContext';
import { useOptimizedAI } from '../../store/optimized/aiContext';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import CustomerForm from '../../components/features/customers/CustomerForm';
import ContextualAITrigger from '../../components/features/ai/ContextualAITrigger';
import Badge from '../../components/ui/Badge';
import { useGamification } from '../../store/gamificationContext';
import { Crown, Heart, AlertTriangle, XCircle, Sparkles as NewIcon, Cake, Lightbulb, ChevronLeft, Users, BarChart3 } from '../../components/ui/Icons';
import CustomerTimeline from '../../components/features/customers/CustomerTimeline';
import CustomerDetailSidebar from '../../components/features/customers/CustomerDetailSidebar';
import CustomerDetailActions from '../../components/features/customers/CustomerDetailActions';
// Lazy load heavy analytics component
const AdvancedCustomerAnalytics = React.lazy(() => import('../../components/features/customers/AdvancedCustomerAnalytics'));
import { aiService } from '../../services/aiService';
import { useProfile } from '../../store/profileContext';


// Utility to get date strings
const getDateString = (offsetDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};

const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
};

interface CustomersPageProps {
  onNavigateWithContent: (content: PostContent, page: Page) => void;
}

const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigateWithContent }) => {
  const { customers, updateCustomer, addTimelineEvent, addCustomer } = useOptimizedAppData();
  const { setAppContext } = useOptimizedAI();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addXp, unlockAchievement } = useGamification();

  const [view, setView] = useState<'segments' | 'list' | 'detail' | 'analytics'>('segments');
  const [activeSegment, setActiveSegment] = useState<SegmentCardProps | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<EnhancedCustomer | null>(null);
  
  // Sync active customer details if the main customer list is updated
  useEffect(() => {
    if (activeCustomer) {
      const updatedCustomer = customers.find(c => c.id === activeCustomer.id);
      if (updatedCustomer) {
        setActiveCustomer(updatedCustomer);
      }
    }
  }, [customers, activeCustomer]);

  const handleSelectSegment = useCallback((segment: SegmentCardProps) => {
    setActiveSegment(segment);
    setView('list');
  }, []);

  const handleSelectCustomer = useCallback((customer: EnhancedCustomer) => {
    setActiveCustomer(customer);
    setView('detail');
    setAppContext({
        page: 'Customers',
        entityName: `${customer.personal.firstName} ${customer.personal.lastName}`,
        entityId: customer.id,
    });
  }, [setAppContext]);

  const handleBack = useCallback(() => {
    if (view === 'detail') {
      setView('list');
      setActiveCustomer(null);
      setAppContext({ page: 'Customers' });
    } else if (view === 'list') {
      setView('segments');
      setActiveSegment(null);
    } else if (view === 'analytics') {
      setView('segments');
    }
  }, [view, setAppContext]);

  const handleViewAnalytics = useCallback(() => {
    setView('analytics');
  }, []);

  const handleAddCustomer = useCallback((newCustomerData: CustomerFormData) => {
    const newCustomerToAdd = {
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
      ...newCustomerData,
      aiAnalysis: {
        churnRisk: { score: 0.2, level: 'low', mainFactor: 'Recent positive interaction.' },
        nextVisitPrediction: { predictedDate: getDateString(14), confidence: 'medium' },
        upsellOpportunity: null
      },
      timeline: [{
        id: `t-new-${Date.now()}`,
        type: 'note',
        date: getDateString(),
        description: 'Customer added to the system.',
        details: { user: 'Admin' }
      }]
    };
    addCustomer(newCustomerToAdd);
    addXp(25);
    unlockAchievement('firstCustomer');
    if (customers.length + 1 >= 10) {
      unlockAchievement('customerChampion');
    }
  }, [customers.length, addCustomer, addXp, unlockAchievement]);

  const handleAddNoteToTimeline = useCallback((customerId: string, noteText: string) => {
    addTimelineEvent(customerId, {
      type: 'note',
      date: getDateString(),
      description: noteText,
      details: { user: 'Admin' }
    });
  }, [addTimelineEvent]);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
        <AnimatePresence mode="wait">
            <motion.div
                key={view}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ type: 'tween', ease: 'anticipate', duration: 0.3 }}
            >
                {view === 'segments' && <SegmentsView customers={customers} onSelectSegment={handleSelectSegment} onAddCustomerClick={handleOpenModal} onViewAnalytics={handleViewAnalytics} />}
                {view === 'list' && activeSegment && <CustomerListView segment={activeSegment} allCustomers={customers} onSelectCustomer={handleSelectCustomer} onBack={handleBack} onAddCustomerClick={handleOpenModal} />}
                {view === 'detail' && activeCustomer && <CustomerDetailView customer={activeCustomer} onBack={handleBack} onAddNote={handleAddNoteToTimeline} onNavigateWithContent={onNavigateWithContent} />}
                {view === 'analytics' && <AnalyticsView customers={customers} onBack={handleBack} />}
            </motion.div>
        </AnimatePresence>
        
        <Modal title="Add New Customer" isOpen={isModalOpen} onClose={handleCloseModal}>
            <CustomerForm onSubmit={handleAddCustomer} onCancel={handleCloseModal} />
        </Modal>
    </>
  );
};

// -- Sub-Components for Views --
const SegmentsView: React.FC<{customers: EnhancedCustomer[], onSelectSegment: (segment: SegmentCardProps) => void, onAddCustomerClick: () => void, onViewAnalytics: () => void}> = React.memo(({ customers, onSelectSegment, onAddCustomerClick, onViewAnalytics }) => {
    const segments = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(now.getDate() - 60);

        return [
          { name: 'VIP', icon: Crown, color: 'yellow', criteria: 'Top 10% de gasto', count: customers.filter(c => c.business.lifecycle === 'vip' || c.transactions.totalSpent > 1000).length, suggestions: ['Programa de beneficios exclusivos', 'Early access a promos'] },
          { name: 'En Riesgo', icon: AlertTriangle, color: 'orange', criteria: 'No vienen hace 30-60 días', count: customers.filter(c => new Date(c.transactions.lastPurchaseDate) < thirtyDaysAgo && new Date(c.transactions.lastPurchaseDate) > sixtyDaysAgo).length, suggestions: ['Mensaje de "te extrañamos"', 'Descuento de reactivación'] },
          { name: 'Nuevos', icon: NewIcon, color: 'green', criteria: 'Primera visita < 30 días', count: customers.filter(c => new Date(c.business.dateAdded) > thirtyDaysAgo).length, suggestions: ['Descuento segunda visita', 'Programa bienvenida'] },
          { name: 'Perdidos', icon: XCircle, color: 'gray', criteria: 'Más de 60 días sin venir', count: customers.filter(c => new Date(c.transactions.lastPurchaseDate) < sixtyDaysAgo).length, suggestions: ['Campaña win-back', 'Encuesta de satisfacción'] },
          { name: 'Cumpleañeros', icon: Cake, color: 'pink', criteria: 'Cumplen este mes', count: customers.filter(c => c.personal.birthDate && new Date(c.personal.birthDate).getMonth() === now.getMonth()).length, suggestions: ['Descuento cumpleaños', 'Regalo especial'] },
          { name: 'Frecuentes', icon: Heart, color: 'red', criteria: '3 o más compras', count: customers.filter(c => c.timeline.filter(t => t.type === 'purchase').length >= 3).length, suggestions: ['Programa de puntos', 'Descuento por referidos'] },
        ]
    }, [customers]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Customer Segments</h2>
                <div className="flex items-center space-x-3">
                    <Button onClick={onViewAnalytics} variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                    </Button>
                    <Button onClick={onAddCustomerClick}>
                        <PlusIcon />Add Customer
                    </Button>
                </div>
            </div>
            {customers.length === 0 && <ContextualAITrigger onAddCustomerClick={onAddCustomerClick} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {segments.sort((a,b) => b.count - a.count).map(segment => (
                    <SegmentCard key={segment.name} {...segment} onSelect={onSelectSegment} />
                ))}
            </div>
        </div>
    )
});

const EmptySegmentState: React.FC<{ onAddCustomerClick: () => void }> = ({ onAddCustomerClick }) => {
    return (
        <div className="text-center p-12">
            <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">This segment is empty</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Once you add customers that match this segment's criteria, they will appear here.
            </p>
            <div className="mt-6">
                <Button onClick={onAddCustomerClick}><PlusIcon /> Add New Customer</Button>
            </div>
             <div className="mt-8 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-left text-blue-700 dark:text-blue-300/80 flex items-start gap-3 max-w-md mx-auto">
                <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-300 mt-0.5 flex-shrink-0" />
                <p>
                    <strong>AI Tip:</strong> Add your most loyal customers first. The AI can analyze their behavior to find patterns and suggest ways to attract similar clients.
                </p>
            </div>
        </div>
    );
};


const CustomerListView: React.FC<{segment: SegmentCardProps, allCustomers: EnhancedCustomer[], onSelectCustomer: (customer: EnhancedCustomer) => void, onBack: () => void, onAddCustomerClick: () => void}> = React.memo(({ segment, allCustomers, onSelectCustomer, onBack, onAddCustomerClick }) => {
    const customers = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(now.getDate() - 60);

        switch(segment.name) {
            case 'VIP': return allCustomers.filter(c => c.business.lifecycle === 'vip' || c.transactions.totalSpent > 1000);
            case 'En Riesgo': return allCustomers.filter(c => new Date(c.transactions.lastPurchaseDate) < thirtyDaysAgo && new Date(c.transactions.lastPurchaseDate) > sixtyDaysAgo);
            case 'Nuevos': return allCustomers.filter(c => new Date(c.business.dateAdded) > thirtyDaysAgo);
            case 'Perdidos': return allCustomers.filter(c => new Date(c.transactions.lastPurchaseDate) < sixtyDaysAgo);
            case 'Cumpleañeros': return allCustomers.filter(c => c.personal.birthDate && new Date(c.personal.birthDate).getMonth() === now.getMonth());
            case 'Frecuentes': return allCustomers.filter(c => c.timeline.filter(t => t.type === 'purchase').length >= 3);
            default: return [];
        }
    }, [segment.name, allCustomers]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="secondary" size="sm" className="!p-2 h-9 w-9"><ChevronLeft className="h-5 w-5"/></Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{segment.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{customers.length} customer(s) in this segment</p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {customers.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {customers.map(customer => (
                            <li 
                                key={customer.id} 
                                onClick={() => onSelectCustomer(customer)}
                                onKeyDown={(e) => e.key === 'Enter' && onSelectCustomer(customer)}
                                role="button"
                                tabIndex={0}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                            >
                                <img className="w-10 h-10 rounded-full" src={customer.avatar} alt="avatar" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-white">{customer.personal.firstName} {customer.personal.lastName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.personal.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">${customer.transactions.totalSpent.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">Total Spent</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptySegmentState onAddCustomerClick={onAddCustomerClick} />
                )}
            </div>
        </div>
    )
});

const CustomerDetailView: React.FC<{
  customer: EnhancedCustomer;
  onBack: () => void;
  onAddNote: (customerId: string, noteText: string) => void;
  onNavigateWithContent: (content: PostContent, page: Page) => void;
}> = React.memo(({ customer, onBack, onAddNote, onNavigateWithContent }) => {
    const { profile } = useProfile();
    const [analysis, setAnalysis] = useState<EnhancedCustomer['aiAnalysis'] | null>(null);
    const [recommendedActions, setRecommendedActions] = useState<AIRecommendedAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const runAnalysis = async () => {
            if (!profile) return;
            setIsLoading(true);
            try {
                // Fetch all data in parallel for a unified loading experience
                const [deepAnalysis, actions] = await Promise.all([
                    aiService.runCustomerDeepAnalysis(customer, profile),
                    aiService.generateAIRecommendedActions(customer, customer.aiAnalysis, profile)
                ]);

                setAnalysis(deepAnalysis);
                setRecommendedActions(actions);

            } catch (error) {
                console.error("Failed to run full customer analysis:", error);
                setAnalysis(customer.aiAnalysis); // fallback to mock on error
                setRecommendedActions([]); // Clear actions on error
            } finally {
                setIsLoading(false);
            }
        };
        runAnalysis();
    }, [customer, profile]);


    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="secondary" size="sm" className="!p-2 h-9 w-9"><ChevronLeft className="h-5 w-5"/></Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Profile</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400">{customer.personal.firstName} {customer.personal.lastName}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-[calc(100vh-12rem)]">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-y-auto">
                    <CustomerDetailSidebar customer={customer} analysis={analysis} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-y-auto">
                    <CustomerTimeline customer={customer} />
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-y-auto">
                    <CustomerDetailActions customer={customer} onAddNote={onAddNote} onNavigateWithContent={onNavigateWithContent} recommendedActions={recommendedActions} isLoading={isLoading} />
                </div>
            </div>
        </div>
    )
});


// -- Original Components --
interface SegmentCardProps { name: string; icon: React.ElementType; color: string; criteria: string; count: number; suggestions: string[]; onSelect?: (segment: any) => void; }

const SegmentCard = React.memo(({ onSelect, ...props }: SegmentCardProps) => {
    const { name, icon: Icon, color, criteria, count, suggestions } = props;
    const colorClasses = {
        yellow: { border: 'border-yellow-200 dark:border-yellow-500/30', bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-300' },
        orange: { border: 'border-orange-200 dark:border-orange-500/30', bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-300' },
        green: { border: 'border-green-200 dark:border-green-500/30', bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-300' },
        gray: { border: 'border-gray-200 dark:border-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
        pink: { border: 'border-pink-200 dark:border-pink-500/30', bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-300' },
        red: { border: 'border-red-200 dark:border-red-500/30', bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-300' },
    };
    const currentTheme = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-t-4 ${currentTheme.border} hover:shadow-xl transition-shadow flex flex-col`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentTheme.bg}`}><Icon className={`w-5 h-5 ${currentTheme.text}`} /></div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">{name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{criteria}</p>
            </div>
          </div>
          <Badge>{count}</Badge>
        </div>
        <div className="space-y-2 my-4 flex-grow">
          {suggestions.slice(0, 2).map((sug, idx) => (
            <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" /><span>{sug}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="flex-1" onClick={() => onSelect?.(props)} disabled={count === 0}>Ver clientes</Button>
          <Button size="sm" className="flex-1" onClick={() => alert('Feature to message segment coming soon!')} disabled={count === 0}>Enviar mensaje</Button>
        </div>
    </motion.div>
  )
});

// Analytics View Component
const AnalyticsView: React.FC<{customers: EnhancedCustomer[], onBack: () => void}> = React.memo(({ customers, onBack }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="secondary" size="sm" className="!p-2 h-9 w-9">
                    <ChevronLeft className="h-5 w-5"/>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Analytics</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Advanced insights and performance metrics</p>
                </div>
            </div>
            
            <Suspense fallback={
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading Analytics...</span>
                </div>
            }>
                <AdvancedCustomerAnalytics
                    customers={customers}
                    onExport={(data) => {
                        console.log('Exporting data:', data);
                        // In a real app, this would download or send the data
                    }}
                    onRefresh={() => {
                        console.log('Refreshing analytics data');
                        // In a real app, this would refresh the data
                    }}
                />
            </Suspense>
        </div>
    );
});

const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>)

export default CustomersPage;