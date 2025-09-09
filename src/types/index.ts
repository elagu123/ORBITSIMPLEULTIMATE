// This file is the single source of truth for all types in the application.

// FIX: Added React import to resolve TypeScript namespace errors
// Issue: React namespace not available causing TS2503 errors
// Date: 2025-09-08
import React, { ReactNode, ElementType } from "react";

// =================================================================
// LEGACY TYPES (for old onboarding, now in src/components/features/onboarding/OnboardingWizard.tsx)
// =================================================================
export type StepId = 'welcome' | 'identity' | 'owner' | 'customers' | 'products' | 'marketing' | 'goals' | 'tone' | 'resources' | 'summary' | 'final';

export interface OldBusinessProfile {
    businessName: string;
    industry: 'indumentaria' | 'restaurante' | 'libreria' | 'gimnasio' | 'servicios' | 'otro';
    history: string;
    owner: {
        name: string;
        role: string;
        hobbies: string;
    };
    customers: {
        description: string;
        problem: string;
        source: string;
    };
    products: {
        main: string[];
        star: string;
        seasonality: string[];
    };
    marketing: {
        socialMedia: string[];
        biggestProblem: string;
    };
    goals: {
        main: string[];
        shortTerm: string;
        longTerm: string;
    };
    tone: {
        style: 'cercano y familiar' | 'profesional y elegante' | 'joven y divertido' | 'inspirador y aspiracional' | '';
        example: string;
    };
    resources: {
        manager: string;
        time: string;
        budget: string;
    };
}

export type PartialOldBusinessProfile = Partial<OldBusinessProfile>;

export interface InitialMarketingPlan {
    postIdeas: {
        title: string;
        content: string;
    }[];
    nextSteps: string[];
}


// =================================================================
// NEW APPLICATION TYPES (from src/types/*)
// =================================================================

// From: src/types/ai.ts
export interface AIStrategy {
  brandVoiceSpectrums: {
    formalVsCasual: number; // 0-1 slider
    seriousVsHumorous: number;
    calmVsEnthusiastic: number;
  };
  brandArchetype: 'hero' | 'sage' | 'explorer' | 'creator' | 'ruler' | 'lover' | 'jester' | 'everyman';
  keyTerminology: {
    wordsToUse: string[];
    wordsToAvoid: string[];
  };
  targetAudience: {
    description: string;
    painPoints: string;
  };
  seoGuidelines: {
    primaryKeywords: string[];
    secondaryKeywords: string[];
  };
}

export interface ContextualSuggestion {
    label: string;
    prompt: string;
    icon: string;
}

export interface AIRecommendedAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  actionType: 'generate_communication' | 'add_to_campaign';
  prompt: string;
}

export interface CreativeBrief {
    identifiedTrend: string;
    recommendedAngle: string;
    suggestedFormat: string;
    recommendedHashtags: string[];
}

export interface AIPerformancePrediction {
  overallScore: number;
  scores: {
    text: number;
    visual: number;
    cta: number;
  };
  suggestions: {
    text: string[];
    visual: string[];
  };
}

export interface PromptAnalysis {
  suggestedPrompt: string;
  reasoning: string[];
}

export interface CollectiveInsight {
    text: string;
    source: 'horarios' | 'promociones' | 'tono';
}

export interface AILearningFact {
  id: string;
  text: string;
  source: 'profile' | 'user_taught';
}

export interface CampaignAudience {
  description: string;
  estimatedReach: number;
  criteria: string[];
}

export interface CampaignContent {
  title: string;
  channel: 'Instagram' | 'Facebook' | 'Email';
  contentSnippet: string;
}

export interface CampaignScheduleItem {
  day: number; // Day of campaign, e.g., 1
  time: string; // e.g., '09:00 AM'
  contentTitle: string;
}

export interface AICampaignPlan {
  campaignName: string;
  goal: string;
  durationDays: number;
  audience: CampaignAudience;
  content: CampaignContent[];
  schedule: CampaignScheduleItem[];
}


// From: src/types/app.ts
export type Page = 'Dashboard' | 'Customers' | 'Content' | 'Calendar' | 'Assets' | 'Settings' | 'Systems' | 'AIStrategy';

export interface AppContextState {
  page: Page;
  entityName?: string;
  entityId?: string;
}

export interface AppDataContextType {
  customers: EnhancedCustomer[];
  specialDates: SpecialDate[];
  calendarEvents: CalendarEvent[];
  assets: Asset[];
  historicalPerformance: HistoricalPerformance[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  addCalendarEvent: (event: CalendarEvent) => void;
  addCustomer: (newCustomer: EnhancedCustomer) => void;
  addNoteToCustomer: (customerId: string, noteText: string) => void;
  setCustomers: React.Dispatch<React.SetStateAction<EnhancedCustomer[]>>;
  addAsset: (asset: Asset) => void;
  updateAsset: (updatedAsset: Asset) => void;
  deleteAsset: (assetId: string) => void;
}


// From: src/types/calendar.ts
export type CalendarViewMode = 'month' | 'week';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  type: 'post_idea' | 'scheduled_post' | 'campaign' | 'holiday';
  status: 'draft' | 'scheduled' | 'published' | 'editing';
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface SpecialDate {
  name: string;
  date: string; // YYYY-MM-DD
  type: 'holiday' | 'commercial' | 'event';
}

export interface HistoricalPerformance {
    date: string; // YYYY-MM-DD
    hour: number; // 0-23
    platform: 'instagram' | 'facebook';
    engagement: number; // A score from 0-100
}

export interface CalendarConflict {
    type: 'fatigue' | 'similarity';
    description: string;
    eventIds: string[];
}

export interface ConflictResolutionSuggestion {
    action: 'reschedule' | 'merge' | 'modify';
    description: string;
}

export interface CalendarContentSuggestion {
  id: string;
  title: string;
  reason: string;
  suggestedDate: string; // YYYY-MM-DD
  prompt: string;
}

export interface OptimalTimeSlot {
  time: string; // e.g., "09:00"
  reason: string;
}

export interface ContentGapSuggestion {
  date: string; // YYYY-MM-DD
  idea: string;
}


// From: src/types/content.ts
export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  tags: string[];
  createdAt: string;
}

export type TemplateCategory = 'promotional' | 'educational' | 'storytelling' | 'interactive' | 'announcement';

export interface ContentTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  structure: Record<string, string>; // e.g., { hook: 'Catchy opening', body: 'Main message' }
  variables: string[]; // e.g., ['discount', 'product_name']
}

export interface PostContent {
    structure: Record<string, string>;
    variables: Record<string, string>;
    imageUrl?: string;
    videoUrl?: string;
};

export interface VideoIdea {
    title: string;
    description: string;
}

export interface GeneratedVideo {
    video?: {
        uri?: string;
    };
}

export interface VideoOperationResponse {
    generatedVideos?: GeneratedVideo[];
}

export interface VideoOperation {
    name?: string;
    done?: boolean;
    response?: VideoOperationResponse;
}

export interface ContentVariation {
  tone: string;
  text: string;
}


// From: src/types/customers.ts
export type TimelineEventType = 'note' | 'purchase' | 'milestone' | 'ai_insight' | 'communication' | 'appointment' | 'feedback' | 'prediction' | 'meeting';

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  date: string;
  description: string;
  details?: {
    amount?: number;
    user?: string;
    channel?: 'Email' | 'WhatsApp' | 'SMS' | 'Instagram';
    status?: 'sent' | 'received' | 'opened' | 'clicked' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    rating?: number;
    platform?: string;
    probability?: number;
    suggestedAction?: string;
  };
};

export interface EnhancedCustomer {
  id: string;
  avatar?: string;
  
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate?: string; // YYYY-MM-DD
  };
  
  business: {
    lifecycle: 'lead' | 'prospect' | 'customer' | 'vip' | 'lost';
    source: 'organic' | 'paid' | 'referral' | 'social';
    tags: string[];
    dateAdded: string;
  };
  
  transactions: {
    totalSpent: number;
    lastPurchaseDate: string;
  };

  aiAnalysis: {
    churnRisk: {
      score: number; // 0-1
      level: 'low' | 'medium' | 'high';
      mainFactor: string;
      explanation?: string;
    };
    nextVisitPrediction: {
      predictedDate: string; // YYYY-MM-DD
      confidence: 'low' | 'medium' | 'high';
    };
    upsellOpportunity: {
      productOrService: string;
      reason: string;
      explanation?: string;
    } | null;
  };
  
  timeline: TimelineEvent[];
  notes: string;
}

export type CustomerFormData = Omit<EnhancedCustomer, 'id' | 'timeline' | 'aiAnalysis'>;


// From: src/types/dashboard.ts
export interface Metric {
  value: number | string;
  change: number; // percentage
  changeType: 'increase' | 'decrease';
}

export type ChartData = {
  name: string;
  revenue: number;
}[];

export interface RecentActivity {
  id: string;
  type: 'customer_added' | 'content_created' | 'post_published' | 'sale_made';
  description: string;
  timestamp: string;
  icon: ElementType;
}

export interface ProactiveTask {
  id: string;
  type: 'customer_retention' | 'content_opportunity' | 'celebratory_message';
  description: string;
  actionText: string;
  isCompleted: boolean;
  relatedId: string; // Can be a customer ID or a special date name
}

export interface DashboardData {
  metrics: {
    totalCustomers: Metric;
    contentGenerated: Metric;
    scheduledPosts: Metric;
    revenue: Metric;
  };
  salesChart: ChartData;
  recentActivity: RecentActivity[];
  tasks: ProactiveTask[];
}


// From: src/types/gamification.ts
export type AchievementId = 
  | 'firstLogin'
  | 'firstContent'
  | 'firstCustomer'
  | 'firstSchedule'
  | 'firstTask'
  | 'contentCreator'
  | 'customerChampion'
  | 'plannerPro'
  | 'busyBee'
  | 'loginStreak';


// From: src/types/pos.ts
export interface POSItem {
  id: string;
  name: string;
  price: number;
  type: 'service' | 'product';
  category?: string;
}

export interface CartItem extends POSItem {
  quantity: number;
}


// From: src/types/profile.ts
export interface BusinessProfile {
  businessName: string;
  industry: 'restaurant' | 'retail' | 'beauty' | 'fitness' | 'healthcare' | 'services' | 'other';
  marketingGoals: {
    increaseSales: boolean;
    buildBrandAwareness: boolean;
    customerRetention: boolean;
    leadGeneration: boolean;
  };
  brandVoice: {
    tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
    values: string[];
  };
  aiStrategy: AIStrategy;
}

export type PartialBusinessProfile = Partial<BusinessProfile> & {
  businessName: string;
  industry: 'restaurant' | 'retail' | 'beauty' | 'fitness' | 'healthcare' | 'services' | 'other';
};


// From: src/types/systems.ts
export interface Integration {
  id: string;
  name: string;
  category: string;
  icon: ElementType;
  connected: boolean;
}

export interface HumanizedMetric {
  emoji: string;
  simple: string;
  context: string;
  action: string;
}

export interface ActionableInsight {
  icon: string;
  title: string;
  impact: string;
  actionText: string;
}

export type SmartNotificationCategory = 'critical' | 'opportunity' | 'warning' | 'informational';

export interface SmartNotification {
  id: string;
  category: SmartNotificationCategory;
  icon: string; // Corresponds to a Lucide icon name
  title: string;
  description: string;
  timestamp: string;
  actions: {
    primary: {
      label: string;
    };
    secondary?: {
      label: string;
    };
  };
}


// From: src/types/whatsapp.ts
export interface WhatsAppMessage {
    id: string;
    sender: 'user' | 'business';
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

export interface WhatsAppConversation {
    id: string;
    customerName: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    messages: WhatsAppMessage[];
}

export interface WhatsAppPromoCode {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    uses: number;
    maxUses?: number;
    isActive: boolean;
    expiresAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Size", "Color"
  value: string; // e.g., "M", "Red"
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  images: string[];
  variants: ProductVariant[];
}
