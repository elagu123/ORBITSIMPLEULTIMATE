import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { EnhancedCustomer, SpecialDate, TimelineEvent, CalendarEvent, Asset, HistoricalPerformance, AppDataContextType } from '../types/index';

// Utility to get date strings
const getDateString = (offsetDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};

const MOCK_ASSETS: Asset[] = [
    { id: 'asset-1', name: 'Summer Coffee Special', url: 'https://picsum.photos/seed/asset1/512', type: 'image', tags: ['coffee', 'summer', 'promo', 'drink'], createdAt: getDateString(-2) },
    { id: 'asset-2', name: 'Cozy Cafe Interior', url: 'https://picsum.photos/seed/asset2/512', type: 'image', tags: ['cafe', 'interior', 'cozy', 'ambiance'], createdAt: getDateString(-5) },
    { id: 'asset-3', name: 'Pastry Assortment', url: 'https://picsum.photos/seed/asset3/512', type: 'image', tags: ['food', 'pastry', 'bakery', 'sweet'], createdAt: getDateString(-10) },
    { id: 'asset-4', name: 'Happy Customer', url: 'https://picsum.photos/seed/asset4/512', type: 'image', tags: ['customer', 'happy', 'lifestyle', 'smile'], createdAt: getDateString(-15) },
    { id: 'asset-5', name: 'Barista at work', url: 'https://picsum.photos/seed/asset5/512', type: 'image', tags: ['barista', 'coffee', 'making', 'professional'], createdAt: getDateString(-3) },
    { id: 'asset-6', name: 'Latte Art', url: 'https://picsum.photos/seed/asset6/512', type: 'image', tags: ['latte', 'art', 'coffee', 'closeup'], createdAt: getDateString(-8) },
    { id: 'asset-7', name: 'Store Front', url: 'https://picsum.photos/seed/asset7/512', type: 'image', tags: ['store', 'exterior', 'shop', 'local'], createdAt: getDateString(-20) },
    { id: 'asset-8', name: 'Morning Sunrise Coffee', url: 'https://picsum.photos/seed/asset8/512', type: 'image', tags: ['morning', 'sunrise', 'coffee', 'relax'], createdAt: getDateString(-1) }
];

const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    { id: '1', title: 'New Product Launch Post', date: '2024-07-15', time: '10:00', type: 'scheduled_post', status: 'scheduled', content: 'Our new summer collection is here! ☀️' },
    { id: '2', title: 'Weekend Flash Sale', date: '2024-07-20', time: '12:00', type: 'campaign', status: 'scheduled', content: 'Get 20% off all weekend! Use code SUMMER20.'},
    { id: '3', title: 'Blog Post: 5 Summer Tips', date: '2024-07-22', time: '09:00', type: 'scheduled_post', status: 'published', content: 'Check out our new blog post on how to make the most of summer.' },
    { id: '4', title: 'Customer Story Idea', date: '2024-07-10', time: '14:00', type: 'post_idea', status: 'draft', content: 'Feature a testimonial from a happy customer.' },
    { id: '5', title: 'National Ice Cream Day', date: '2024-07-21', time: '13:00', type: 'holiday', status: 'published', content: 'Happy National Ice Cream Day! 🍦' }
];

const MOCK_HISTORICAL_PERFORMANCE: HistoricalPerformance[] = [
    // High engagement on weekday evenings
    { date: getDateString(-3), hour: 19, platform: 'instagram', engagement: 95 },
    { date: getDateString(-4), hour: 20, platform: 'facebook', engagement: 88 },
    // Low engagement on weekday mornings
    { date: getDateString(-5), hour: 9, platform: 'instagram', engagement: 30 },
    // High engagement on weekend afternoons
    { date: getDateString(-2), hour: 14, platform: 'instagram', engagement: 92 },
    { date: getDateString(-9), hour: 15, platform: 'facebook', engagement: 85 }
];


const MOCK_CUSTOMERS: EnhancedCustomer[] = [
  { 
    id: 'CUST-001', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    personal: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-1234', birthDate: `1985-${getDateString().substring(5)}` },
    business: { lifecycle: 'vip', source: 'organic', tags: ['repeat', 'local'], dateAdded: '2023-01-15' },
    transactions: { totalSpent: 2500, lastPurchaseDate: getDateString(-5) },
    aiAnalysis: {
        churnRisk: { score: 0.1, level: 'low', mainFactor: 'Recent purchase and high LTV.' },
        nextVisitPrediction: { predictedDate: getDateString(10), confidence: 'high' },
        upsellOpportunity: { productOrService: 'VIP Membership Renewal', reason: 'Consistently high spending.' }
    },
    timeline: [
        { id: 't1-1', type: 'purchase', date: getDateString(-5), description: 'Purchased "Premium Skincare Set"', details: { amount: 150, user: 'Self' } },
        { id: 't1-2', type: 'communication', date: getDateString(-10), description: 'Opened promotional email for new products.', details: { channel: 'Email', status: 'opened' } },
        { id: 't1-3', type: 'milestone', date: `1985-${getDateString().substring(5)}`, description: 'Birthday!' },
        { id: 't1-4', type: 'ai_insight', date: getDateString(-1), description: 'High LTV customer. Suggest offering VIP-exclusive discount.'}
    ],
    notes: 'Prefers morning appointments.'
  },
  { 
    id: 'CUST-002', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    personal: { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '555-5678' },
    business: { lifecycle: 'customer', source: 'referral', tags: ['new-referral'], dateAdded: getDateString(-15) },
    transactions: { totalSpent: 250.00, lastPurchaseDate: getDateString(-15) },
    aiAnalysis: {
        churnRisk: { score: 0.3, level: 'low', mainFactor: 'Recent first purchase.' },
        nextVisitPrediction: { predictedDate: getDateString(25), confidence: 'medium' },
        upsellOpportunity: { productOrService: 'Follow-up consultation', reason: 'First-time buyer of a starter kit.'}
    },
    timeline: [
        { id: 't2-1', type: 'purchase', date: getDateString(-15), description: 'First purchase: "Basic Starter Kit"', details: { amount: 75 } },
        { id: 't2-2', type: 'communication', date: getDateString(-14), description: 'Sent welcome email sequence.', details: { channel: 'Email', status: 'sent' } },
    ],
    notes: ''
  },
  { 
    id: 'CUST-003',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    personal: { firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', phone: '555-8765' },
    business: { lifecycle: 'customer', source: 'social', tags: [], dateAdded: '2024-05-01' },
    transactions: { totalSpent: 45.50, lastPurchaseDate: getDateString(-40) },
    aiAnalysis: {
        churnRisk: { score: 0.7, level: 'high', mainFactor: 'Long time since last purchase.' },
        nextVisitPrediction: { predictedDate: getDateString(5), confidence: 'low' },
        upsellOpportunity: null
    },
    timeline: [
        { id: 't3-0', type: 'prediction', date: getDateString(-38), description: 'High churn risk detected.', details: { probability: 0.7, suggestedAction: 'Send win-back campaign' } },
        { id: 't3-1', type: 'purchase', date: getDateString(-40), description: 'Single item purchase.', details: { amount: 45.50 } },
        { id: 't3-2', type: 'ai_insight', date: getDateString(-35), description: 'Churn risk detected due to inactivity post-first purchase.' },
        { id: 't3-3', type: 'communication', date: getDateString(-30), description: 'Sent "We miss you" reactivation campaign.', details: { channel: 'Email', status: 'sent' } },
    ],
    notes: 'Follows on Instagram.'
  },
   { 
    id: 'CUST-004',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    personal: { firstName: 'Robert', lastName: 'Brown', email: 'rob.b@example.com', phone: '555-1122' },
    business: { lifecycle: 'lost', source: 'paid', tags: [], dateAdded: '2023-11-10' },
    transactions: { totalSpent: 112.00, lastPurchaseDate: getDateString(-90) },
    aiAnalysis: {
        churnRisk: { score: 0.95, level: 'high', mainFactor: 'Has already churned.' },
        nextVisitPrediction: { predictedDate: 'N/A', confidence: 'low' },
        upsellOpportunity: null
    },
    timeline: [
        { id: 't4-1', type: 'feedback', date: getDateString(-95), description: 'Complained about pricing.', details: { rating: 2, platform: 'In-store' } },
        { id: 't4-2', type: 'purchase', date: getDateString(-90), description: 'Final purchase.', details: { amount: 32.00 } },
    ],
    notes: 'Complained about pricing once.'
  },
  { 
    id: 'CUST-005',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    personal: { firstName: 'Emily', lastName: 'Davis', email: 'em.davis@example.com', phone: '555-3344' },
    business: { lifecycle: 'vip', source: 'referral', tags: ['influencer', 'local'], dateAdded: '2023-08-22' },
    transactions: { totalSpent: 5240, lastPurchaseDate: getDateString(-12) },
    aiAnalysis: {
        churnRisk: { score: 0.05, level: 'low', mainFactor: 'Frequent high-value purchases.' },
        nextVisitPrediction: { predictedDate: getDateString(18), confidence: 'high' },
        upsellOpportunity: { productOrService: 'Exclusive annual pass', reason: 'High engagement and spend.' }
    },
    timeline: [
        { id: 't5-1', type: 'purchase', date: getDateString(-12), description: 'Monthly subscription renewal', details: { amount: 250 } },
        { id: 't5-2', type: 'note', date: getDateString(-12), description: 'Posted a positive review on her blog.', details: { user: 'Admin' } }
    ],
    notes: 'Runs a local food blog.'
  },
  { 
    id: 'CUST-006',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    personal: { firstName: 'Michael', lastName: 'Miller', email: 'mike.m@example.com', phone: '555-5566' },
    business: { lifecycle: 'customer', source: 'organic', tags: [], dateAdded: getDateString(-5) },
    transactions: { totalSpent: 75.00, lastPurchaseDate: getDateString(-5) },
    aiAnalysis: {
        churnRisk: { score: 0.2, level: 'low', mainFactor: 'New and engaged customer.' },
        nextVisitPrediction: { predictedDate: getDateString(20), confidence: 'medium' },
        upsellOpportunity: { productOrService: 'Related accessories', reason: 'Purchased a main product.' }
    },
    timeline: [
        { id: 't6-1', type: 'note', date: getDateString(-5), description: 'Customer added to the system.', details: { user: 'System' } },
    ],
    notes: ''
  }
];

const MOCK_SPECIAL_DATES: SpecialDate[] = [
    { name: 'National Ice Cream Day', date: '2024-07-21', type: 'holiday' },
    { name: 'Start of "Back to School" campaign', date: '2024-07-29', type: 'commercial' },
    { name: 'Local Summer Festival', date: '2024-08-03', type: 'event' }
];

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<EnhancedCustomer[]>(MOCK_CUSTOMERS);
  const [specialDates] = useState<SpecialDate[]>(MOCK_SPECIAL_DATES);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [historicalPerformance] = useState<HistoricalPerformance[]>(MOCK_HISTORICAL_PERFORMANCE);

  const addCustomer = (newCustomer: EnhancedCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };
  
  const addCalendarEvent = useCallback((event: CalendarEvent) => {
    setCalendarEvents(prev => [...prev, event]);
  }, []);

  const addNoteToCustomer = useCallback((customerId: string, noteText: string) => {
    setCustomers(prevCustomers => prevCustomers.map(c => {
      if (c.id === customerId) {
        const newTimeline: TimelineEvent[] = [
          ...c.timeline,
          { id: `note-${Date.now()}`, type: 'note', date: getDateString(), description: noteText, details: { user: 'Admin' } }
        ];
        return { ...c, timeline: newTimeline };
      }
      return c;
    }));
  }, []);

  const addAsset = useCallback((asset: Asset) => {
    setAssets(prev => [asset, ...prev]);
  }, []);

  const updateAsset = useCallback((updatedAsset: Asset) => {
    setAssets(prev => prev.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset));
  }, []);
  
  const deleteAsset = useCallback((assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
  }, []);


  return (
    <AppDataContext.Provider value={{ customers, specialDates, calendarEvents, assets, historicalPerformance, setCalendarEvents, addCalendarEvent, addCustomer, addNoteToCustomer, setCustomers, addAsset, updateAsset, deleteAsset }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};