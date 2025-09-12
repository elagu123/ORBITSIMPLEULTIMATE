// =============================================================================
// ORBIT AI AGENT - TYPE DEFINITIONS
// =============================================================================

export interface AgentContext {
  businessId: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  location: string;
  targetAudience: string;
  products: Product[];
  socialMedia: SocialMediaAccounts;
  preferences: AgentPreferences;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock?: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface SocialMediaAccounts {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
}

export interface AgentPreferences {
  tone: 'formal' | 'casual' | 'humorous' | 'professional';
  language: 'technical' | 'simple' | 'local_slang';
  proactivity: 'high' | 'medium' | 'low';
  creativity: 'conservative' | 'balanced' | 'experimental';
  autoPublish: boolean;
  maxDailySpend: number;
}

// =============================================================================
// COGNITIVE SYSTEM INTERFACES
// =============================================================================

export interface MemorySystem {
  shortTerm: Map<string, any>;
  workingMemory: LRUCache<string, any>;
  longTerm: VectorMemory;
  episodic: EventMemory;
}

export interface VectorMemory {
  store: (content: string, metadata: Record<string, any>) => Promise<string>;
  search: (query: string, limit?: number) => Promise<MemoryEntry[]>;
  update: (id: string, content: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export interface EventMemory {
  log: (event: AgentEvent) => Promise<void>;
  query: (filters: EventFilter) => Promise<AgentEvent[]>;
  getPattern: (type: string) => Promise<EventPattern>;
}

export interface MemoryEntry {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AgentEvent {
  id: string;
  type: EventType;
  data: Record<string, any>;
  timestamp: Date;
  businessId: string;
  success: boolean;
  impact?: 'low' | 'medium' | 'high';
}

export type EventType = 
  | 'message_received'
  | 'content_generated'
  | 'sale_detected'
  | 'promotion_created'
  | 'customer_interaction'
  | 'learning_event'
  | 'error_occurred';

export interface EventFilter {
  type?: EventType;
  businessId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  success?: boolean;
}

export interface EventPattern {
  type: string;
  frequency: number;
  successRate: number;
  bestTimes: Date[];
  commonContext: Record<string, any>;
}

// =============================================================================
// ANALYSIS & PLANNING INTERFACES
// =============================================================================

export interface BusinessAnalysis {
  metrics: PerformanceMetrics;
  competitive: CompetitiveAnalysis;
  opportunities: Opportunity[];
  risks: Risk[];
  sentiment: SentimentAnalysis;
}

export interface PerformanceMetrics {
  salesTrend: TrendAnalysis;
  engagementRate: number;
  conversionFunnel: ConversionData;
  customerSatisfaction: number;
  responseTime: number;
  contentPerformance: ContentMetrics;
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  timeframe: string;
  confidence: number;
}

export interface ConversionData {
  awareness: number;
  consideration: number;
  purchase: number;
  retention: number;
  advocacy: number;
}

export interface ContentMetrics {
  reach: number;
  engagement: number;
  clicks: number;
  shares: number;
  saves: number;
  bestPerformingType: string;
}

export interface CompetitiveAnalysis {
  marketPosition: string;
  pricingComparison: PricingData;
  contentGaps: string[];
  opportunities: string[];
}

export interface PricingData {
  ourPrices: Record<string, number>;
  competitorPrices: Record<string, number>;
  marketAverage: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: number;
  effort: 'low' | 'medium' | 'high';
  deadline?: Date;
  actions: Action[];
}

export type OpportunityType = 
  | 'content_creation'
  | 'promotion'
  | 'customer_retention'
  | 'new_audience'
  | 'competitor_response'
  | 'trend_capitalization'
  | 'upsell_crosssell';

export interface Risk {
  id: string;
  type: RiskType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  description: string;
  impact: string;
  mitigation: Action[];
}

export type RiskType = 
  | 'customer_churn'
  | 'competitor_threat'
  | 'negative_sentiment'
  | 'sales_decline'
  | 'inventory_issue'
  | 'reputation_damage';

export interface SentimentAnalysis {
  overall: number; // -1 to 1
  bySource: Record<string, number>;
  trends: SentimentTrend[];
  alerts: SentimentAlert[];
}

export interface SentimentTrend {
  period: string;
  score: number;
  volume: number;
}

export interface SentimentAlert {
  type: 'positive_spike' | 'negative_spike' | 'volume_increase';
  score: number;
  source: string;
  timestamp: Date;
}

// =============================================================================
// ACTION & TASK INTERFACES
// =============================================================================

export interface Action {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  parameters: Record<string, any>;
  priority: TaskPriority;
  estimatedDuration: number; // minutes
  dependencies?: string[];
  scheduledFor?: Date;
  deadline?: Date;
  status: TaskStatus;
}

export type ActionType = 
  | 'create_content'
  | 'send_message'
  | 'create_promotion'
  | 'schedule_post'
  | 'respond_comment'
  | 'analyze_competitor'
  | 'generate_report'
  | 'update_pricing'
  | 'segment_customers'
  | 'send_newsletter';

export type TaskPriority = 'background' | 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  output?: any;
  error?: string;
  duration: number;
  timestamp: Date;
  metrics?: TaskMetrics;
}

export interface TaskMetrics {
  tokensUsed?: number;
  apiCalls?: number;
  cost?: number;
  userSatisfaction?: number;
}

// =============================================================================
// COMMUNICATION INTERFACES
// =============================================================================

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'document';
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'email';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MessageIntent {
  primary: IntentType;
  confidence: number;
  entities: Entity[];
  sentiment: number;
  urgency: 'low' | 'medium' | 'high';
}

export type IntentType = 
  | 'greeting'
  | 'product_inquiry' 
  | 'price_inquiry'
  | 'order_placement'
  | 'complaint'
  | 'compliment'
  | 'information_request'
  | 'support_request'
  | 'cancellation'
  | 'modification';

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export interface ConversationContext {
  customerId: string;
  platform: string;
  history: Message[];
  currentIntent?: MessageIntent;
  customerProfile?: CustomerProfile;
  activeOrder?: Order;
}

export interface CustomerProfile {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  preferences: CustomerPreferences;
  purchaseHistory: Purchase[];
  engagementHistory: Interaction[];
  segments: string[];
  lifetime_value: number;
  risk_score: number; // churn prediction
}

export interface CustomerPreferences {
  communicationStyle: 'formal' | 'casual';
  preferredTime: string;
  interests: string[];
  dislikes: string[];
  budget_range?: [number, number];
}

export interface Purchase {
  id: string;
  date: Date;
  amount: number;
  products: string[];
  channel: string;
  satisfaction?: number;
}

export interface Interaction {
  id: string;
  date: Date;
  type: string;
  platform: string;
  outcome: string;
  sentiment: number;
}

// =============================================================================
// CONTENT & CAMPAIGN INTERFACES
// =============================================================================

export interface ContentRequest {
  type: ContentType;
  topic?: string;
  products?: string[];
  targetAudience?: string;
  tone?: string;
  platform: ContentPlatform;
  objective: ContentObjective;
  constraints?: ContentConstraints;
}

export type ContentType = 
  | 'post'
  | 'story' 
  | 'reel'
  | 'carousel'
  | 'newsletter'
  | 'ad'
  | 'product_showcase'
  | 'testimonial'
  | 'educational'
  | 'promotional';

export type ContentPlatform = 
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp_status'
  | 'email'
  | 'website';

export type ContentObjective = 
  | 'awareness'
  | 'engagement'
  | 'traffic'
  | 'leads'
  | 'sales'
  | 'retention';

export interface ContentConstraints {
  maxLength?: number;
  mustInclude?: string[];
  mustAvoid?: string[];
  style?: string;
  hashtags?: string[];
}

export interface GeneratedContent {
  id: string;
  type: ContentType;
  platform: ContentPlatform;
  content: ContentPiece;
  metadata: ContentMetadata;
  performance?: ContentPerformance;
}

export interface ContentPiece {
  title?: string;
  body: string;
  imagePrompt?: string;
  imageUrl?: string;
  hashtags?: string[];
  cta?: string;
  scheduling?: ScheduleOptions;
}

export interface ContentMetadata {
  generatedAt: Date;
  model: string;
  tokens: number;
  confidence: number;
  businessId: string;
  campaign?: string;
}

export interface ContentPerformance {
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  cost?: number;
  roi?: number;
}

export interface ScheduleOptions {
  publishAt: Date;
  timezone: string;
  autoPublish: boolean;
  platforms: ContentPlatform[];
}

// =============================================================================
// CAMPAIGN INTERFACES
// =============================================================================

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  objective: string;
  status: CampaignStatus;
  budget?: number;
  startDate: Date;
  endDate: Date;
  targetAudience: TargetAudience;
  content: GeneratedContent[];
  performance: CampaignPerformance;
}

export type CampaignType = 
  | 'awareness'
  | 'engagement' 
  | 'conversion'
  | 'retention'
  | 'seasonal'
  | 'product_launch'
  | 'competitive_response';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface TargetAudience {
  segments: string[];
  demographics: Demographics;
  interests: string[];
  behaviors: string[];
  excludeSegments?: string[];
}

export interface Demographics {
  ageRange?: [number, number];
  gender?: 'male' | 'female' | 'all';
  location?: string[];
  income?: [number, number];
}

export interface CampaignPerformance {
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
  roi: number;
  cpa: number; // cost per acquisition
  ctr: number; // click-through rate
}

// =============================================================================
// RECOMMENDATION INTERFACES
// =============================================================================

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rationale: string;
  actions: RecommendedAction[];
  estimatedImpact: ImpactEstimate;
  confidence: number;
  validUntil?: Date;
  businessId: string;
}

export type RecommendationType = 
  | 'content'
  | 'promotion'
  | 'pricing'
  | 'inventory'
  | 'customer_service'
  | 'competitive'
  | 'trend'
  | 'retention'
  | 'growth';

export interface RecommendedAction {
  type: ActionType;
  title: string;
  description: string;
  parameters: Record<string, any>;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface ImpactEstimate {
  metric: string;
  expectedChange: number;
  confidence: number;
  timeframe: string;
}

// =============================================================================
// LEARNING INTERFACES
// =============================================================================

export interface LearningEvent {
  id: string;
  type: LearningType;
  data: any;
  outcome: any;
  feedback?: Feedback;
  businessId: string;
  timestamp: Date;
}

export type LearningType = 
  | 'action_result'
  | 'user_feedback'
  | 'performance_metric'
  | 'pattern_discovered'
  | 'anomaly_detected'
  | 'model_update';

export interface Feedback {
  rating: number; // 1-5
  category: 'quality' | 'relevance' | 'timing' | 'tone';
  comment?: string;
  userId: string;
  timestamp: Date;
}

export interface Pattern {
  id: string;
  type: string;
  description: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  businessId?: string; // null for global patterns
}

export interface LearningInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  metadata: Record<string, any>;
}

// =============================================================================
// UTILITY INTERFACES
// =============================================================================

export interface LRUCache<K, V> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  has: (key: K) => boolean;
  delete: (key: K) => boolean;
  clear: () => void;
  size: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  deliveryAddress?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

// =============================================================================
// AGENT CONFIGURATION
// =============================================================================

export interface AgentConfig {
  models: ModelConfig;
  memory: MemoryConfig;
  tools: ToolConfig;
  learning: LearningConfig;
  safety: SafetyConfig;
  performance: PerformanceConfig;
}

export interface ModelConfig {
  primary: string; // claude-3-5-sonnet
  fallback: string; // gpt-4
  embedding: string; // text-embedding-ada-002
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface MemoryConfig {
  shortTermSize: number;
  workingMemorySize: number;
  vectorDimensions: number;
  similarityThreshold: number;
  retentionDays: number;
}

export interface ToolConfig {
  whatsapp: boolean;
  instagram: boolean;
  facebook: boolean;
  analytics: boolean;
  emailMarketing: boolean;
  imageGeneration: boolean;
}

export interface LearningConfig {
  enabled: boolean;
  feedbackWeight: number;
  adaptationRate: number;
  crossTenantLearning: boolean;
  privacyLevel: 'strict' | 'moderate' | 'permissive';
}

export interface SafetyConfig {
  contentFiltering: boolean;
  spamPrevention: boolean;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  approvalRequired: string[]; // action types requiring approval
}

export interface PerformanceConfig {
  cacheSize: number;
  batchSize: number;
  concurrentTasks: number;
  retryAttempts: number;
  metricsCollection: boolean;
}