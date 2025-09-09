import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { EnhancedCustomer, SpecialDate, TimelineEvent, CalendarEvent, Asset, HistoricalPerformance } from '../../types/index';

// ===================================================================
// STATIC DATA - Moved outside component to prevent recreation
// ===================================================================

const getDateString = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

// Static data - created once and never changes
const STATIC_ASSETS: Asset[] = [
  { id: 'asset-1', name: 'Summer Coffee Special', url: 'https://picsum.photos/seed/asset1/512', type: 'image', tags: ['coffee', 'summer', 'promo', 'drink'], createdAt: getDateString(-2) },
  { id: 'asset-2', name: 'Cozy Cafe Interior', url: 'https://picsum.photos/seed/asset2/512', type: 'image', tags: ['cafe', 'interior', 'cozy', 'ambiance'], createdAt: getDateString(-5) },
  { id: 'asset-3', name: 'Pastry Assortment', url: 'https://picsum.photos/seed/asset3/512', type: 'image', tags: ['food', 'pastry', 'bakery', 'sweet'], createdAt: getDateString(-10) },
  { id: 'asset-4', name: 'Happy Customer', url: 'https://picsum.photos/seed/asset4/512', type: 'image', tags: ['customer', 'happy', 'lifestyle', 'smile'], createdAt: getDateString(-15) },
  { id: 'asset-5', name: 'Barista at work', url: 'https://picsum.photos/seed/asset5/512', type: 'image', tags: ['barista', 'coffee', 'making', 'professional'], createdAt: getDateString(-3) },
  { id: 'asset-6', name: 'Latte Art', url: 'https://picsum.photos/seed/asset6/512', type: 'image', tags: ['latte', 'art', 'coffee', 'closeup'], createdAt: getDateString(-8) },
  { id: 'asset-7', name: 'Store Front', url: 'https://picsum.photos/seed/asset7/512', type: 'image', tags: ['store', 'exterior', 'shop', 'local'], createdAt: getDateString(-20) },
  { id: 'asset-8', name: 'Morning Sunrise Coffee', url: 'https://picsum.photos/seed/asset8/512', type: 'image', tags: ['morning', 'sunrise', 'coffee', 'relax'], createdAt: getDateString(-1) }
];

const STATIC_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'New Product Launch Post', date: '2024-07-15', time: '10:00', type: 'scheduled_post', status: 'scheduled', content: 'Our new summer collection is here! ☀️' },
  { id: '2', title: 'Weekend Flash Sale', date: '2024-07-20', time: '12:00', type: 'campaign', status: 'scheduled', content: 'Get 20% off all weekend! Use code SUMMER20.'},
  { id: '3', title: 'Blog Post: 5 Summer Tips', date: '2024-07-22', time: '09:00', type: 'scheduled_post', status: 'published', content: 'Check out our new blog post on how to make the most of summer.' },
  { id: '4', title: 'Customer Story Idea', date: '2024-07-10', time: '14:00', type: 'post_idea', status: 'draft', content: 'Feature a testimonial from a happy customer.' },
  { id: '5', title: 'National Ice Cream Day', date: '2024-07-21', time: '13:00', type: 'holiday', status: 'published', content: 'Happy National Ice Cream Day! 🍦' }
];

const STATIC_HISTORICAL_PERFORMANCE: HistoricalPerformance[] = [
  { date: getDateString(-3), hour: 19, platform: 'instagram', engagement: 95 },
  { date: getDateString(-4), hour: 20, platform: 'facebook', engagement: 88 },
  { date: getDateString(-5), hour: 9, platform: 'instagram', engagement: 30 },
  { date: getDateString(-2), hour: 14, platform: 'instagram', engagement: 92 },
  { date: getDateString(-9), hour: 15, platform: 'facebook', engagement: 85 }
];

const STATIC_SPECIAL_DATES: SpecialDate[] = [
  { id: 'sd1', name: 'Black Friday', date: '2024-11-29', type: 'sale', relevance: 'sales' },
  { id: 'sd2', name: 'Christmas', date: '2024-12-25', type: 'holiday', relevance: 'general' },
  { id: 'sd3', name: 'New Year', date: '2025-01-01', type: 'holiday', relevance: 'general' },
  { id: 'sd4', name: 'Valentine\'s Day', date: '2025-02-14', type: 'holiday', relevance: 'general' },
  { id: 'sd5', name: 'Mother\'s Day', date: '2025-05-11', type: 'holiday', relevance: 'general' },
  { id: 'sd6', name: 'Father\'s Day', date: '2025-06-15', type: 'holiday', relevance: 'general' },
  { id: 'sd7', name: 'Summer Solstice', date: '2024-06-21', type: 'seasonal', relevance: 'seasonal' },
  { id: 'sd8', name: 'Back to School', date: '2024-09-03', type: 'seasonal', relevance: 'seasonal' }
];

// Mock customers - only mutable data should be in state
const createMockCustomers = (): EnhancedCustomer[] => [
  { 
    id: 'CUST-001', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    personal: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-1234', birthDate: `1985-${getDateString().substring(5)}` },
    business: { lifecycle: 'vip', source: 'organic', tags: ['repeat', 'local'], dateAdded: '2023-01-15' },
    transactions: { totalSpent: 2500, lastPurchaseDate: getDateString(-5) },
    aiAnalysis: {
      churnRisk: { score: 0.1, level: 'low', mainFactor: 'Recent purchase and high LTV', explanation: 'Customer shows consistent purchasing behavior.' },
      nextVisitPrediction: { predictedDate: getDateString(7), confidence: 'high' },
      upsellOpportunity: { productOrService: 'Premium Coffee Subscription', reason: 'High frequency buyer', explanation: 'Based on purchase history, likely to upgrade.' }
    },
    timeline: [
      { id: 'tl-1', type: 'purchase', date: getDateString(-5), description: 'Bought premium coffee bundle ($45)' },
      { id: 'tl-2', type: 'communication', date: getDateString(-10), description: 'Sent thank you email' }
    ]
  },
  { 
    id: 'CUST-002', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    personal: { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', phone: '555-5678', birthDate: `1990-${getDateString().substring(5)}` },
    business: { lifecycle: 'regular', source: 'referral', tags: ['social', 'feedback'], dateAdded: '2023-03-22' },
    transactions: { totalSpent: 850, lastPurchaseDate: getDateString(-15) },
    aiAnalysis: {
      churnRisk: { score: 0.4, level: 'medium', mainFactor: 'Decreased purchase frequency', explanation: 'Recent decline in activity needs attention.' },
      nextVisitPrediction: { predictedDate: getDateString(14), confidence: 'medium' },
      upsellOpportunity: { productOrService: 'Loyalty Program', reason: 'Price-sensitive customer', explanation: 'Loyalty rewards could increase retention.' }
    },
    timeline: [
      { id: 'tl-3', type: 'purchase', date: getDateString(-15), description: 'Bought coffee and pastries ($28)' },
      { id: 'tl-4', type: 'feedback', date: getDateString(-18), description: 'Left 5-star review online' }
    ]
  }
];

// ===================================================================
// CONTEXT DEFINITION
// ===================================================================

interface AppDataState {
  customers: EnhancedCustomer[];
  isLoading: boolean;
}

interface AppDataActions {
  updateCustomer: (customerId: string, updates: Partial<EnhancedCustomer>) => void;
  addCustomer: (customer: Omit<EnhancedCustomer, 'id'>) => void;
  deleteCustomer: (customerId: string) => void;
  addTimelineEvent: (customerId: string, event: Omit<TimelineEvent, 'id'>) => void;
  refreshCustomers: () => Promise<void>;
}

interface AppDataContextType extends AppDataState, AppDataActions {
  // Static data (never changes)
  specialDates: SpecialDate[];
  assets: Asset[];
  calendarEvents: CalendarEvent[];
  historicalPerformance: HistoricalPerformance[];
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// ===================================================================
// OPTIMIZED PROVIDER
// ===================================================================

export const OptimizedAppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Only mutable state
  const [customers, setCustomers] = useState<EnhancedCustomer[]>(() => createMockCustomers());
  const [isLoading, setIsLoading] = useState(false);

  // Memoized actions - only recreated if setters change (never)
  const actions = useMemo(() => ({
    updateCustomer: (customerId: string, updates: Partial<EnhancedCustomer>) => {
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? { ...customer, ...updates } : customer
      ));
    },

    addCustomer: (customerData: Omit<EnhancedCustomer, 'id'>) => {
      const newCustomer: EnhancedCustomer = {
        ...customerData,
        id: `CUST-${Date.now()}` // Simple ID generation
      };
      setCustomers(prev => [newCustomer, ...prev]);
    },

    deleteCustomer: (customerId: string) => {
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    },

    addTimelineEvent: (customerId: string, eventData: Omit<TimelineEvent, 'id'>) => {
      const newEvent: TimelineEvent = {
        ...eventData,
        id: `tl-${Date.now()}`
      };
      
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, timeline: [newEvent, ...customer.timeline] }
          : customer
      ));
    },

    refreshCustomers: async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCustomers(createMockCustomers());
      } finally {
        setIsLoading(false);
      }
    }
  }), []);

  // Memoized context value - only changes when customers or isLoading changes
  const contextValue = useMemo((): AppDataContextType => ({
    // Dynamic state
    customers,
    isLoading,
    
    // Static data (never changes)
    specialDates: STATIC_SPECIAL_DATES,
    assets: STATIC_ASSETS,
    calendarEvents: STATIC_CALENDAR_EVENTS,
    historicalPerformance: STATIC_HISTORICAL_PERFORMANCE,
    
    // Actions
    ...actions
  }), [customers, isLoading, actions]);

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

// ===================================================================
// HOOK
// ===================================================================

export const useOptimizedAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useOptimizedAppData must be used within an OptimizedAppDataProvider');
  }
  return context;
};