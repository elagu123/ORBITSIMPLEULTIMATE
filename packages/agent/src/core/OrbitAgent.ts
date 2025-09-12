// =============================================================================
// ORBIT AI AGENT - CORE INTELLIGENCE SYSTEM
// =============================================================================

import { EventEmitter } from 'events';
import { 
  AgentContext, 
  BusinessAnalysis, 
  Action, 
  TaskResult, 
  Message, 
  ConversationContext,
  Recommendation,
  LearningEvent,
  AgentConfig,
  MemorySystem,
  BusinessProfile
} from '../types/index.js';
import { AnalysisEngine } from '../engines/AnalysisEngine.js';
import { PlanningEngine } from '../engines/PlanningEngine.js';
import { ExecutionEngine } from '../engines/ExecutionEngine.js';
import { LearningEngine } from '../engines/LearningEngine.js';
import { MemoryManager } from './MemoryManager.js';
import { TaskOrchestrator } from '../orchestrator/TaskOrchestrator.js';
import { AgentToolkit } from '../tools/AgentToolkit.js';
import { RecommendationEngine } from '../engines/RecommendationEngine.js';
import { Logger } from '../utils/Logger.js';

/**
 * 🧠 ORBIT AI AGENT
 * 
 * Agente IA autónomo con capacidades de:
 * - Análisis contextual continuo
 * - Planificación estratégica
 * - Ejecución autónoma de tareas
 * - Aprendizaje adaptativo
 * - Comunicación natural
 * 
 * Actúa como Community Manager Senior y Experto en Ventas
 * con focus en negocios locales argentinos.
 */
export class OrbitAgent extends EventEmitter {
  private readonly config: AgentConfig;
  private readonly logger: Logger;
  
  // NÚCLEO COGNITIVO
  private readonly analyzer: AnalysisEngine;
  private readonly planner: PlanningEngine;
  private readonly executor: ExecutionEngine;
  private readonly learner: LearningEngine;
  private readonly memory: MemoryManager;
  
  // SISTEMAS DE APOYO
  private readonly tools: AgentToolkit;
  private readonly orchestrator: TaskOrchestrator;
  private readonly recommender: RecommendationEngine;
  
  // ESTADO INTERNO
  private isRunning: boolean = false;
  private currentTasks: Map<string, Action> = new Map();
  private businessProfiles: Map<string, BusinessProfile> = new Map();
  
  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger('OrbitAgent');
    
    // Inicializar sistemas
    this.memory = new MemoryManager(config.memory);
    this.tools = new AgentToolkit(config.tools);
    this.orchestrator = new TaskOrchestrator(this);
    
    // Inicializar motores cognitivos
    this.analyzer = new AnalysisEngine(this.memory, this.tools);
    this.planner = new PlanningEngine(this.memory, this.tools);
    this.executor = new ExecutionEngine(this.tools, this.orchestrator);
    this.learner = new LearningEngine(this.memory);
    this.recommender = new RecommendationEngine(this.analyzer, this.learner);
    
    // Setup event listeners
    this.setupEventListeners();
    
    this.logger.info('🧠 Orbit Agent initialized successfully');
  }
  
  // ==========================================================================
  // LIFECYCLE MANAGEMENT
  // ==========================================================================
  
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent already running');
      return;
    }
    
    try {
      this.logger.info('🚀 Starting Orbit Agent...');
      
      // Inicializar memoria y sistemas
      await this.memory.initialize();
      await this.tools.initialize();
      await this.orchestrator.start();
      
      this.isRunning = true;
      this.emit('agent.started');
      
      // Ejecutar rutina de inicio
      await this.bootSequence();
      
      this.logger.info('✅ Orbit Agent started successfully');
    } catch (error) {
      this.logger.error('❌ Failed to start agent:', error);
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.logger.info('🛑 Stopping Orbit Agent...');
    
    // Completar tareas críticas
    await this.gracefulShutdown();
    
    // Detener sistemas
    await this.orchestrator.stop();
    await this.memory.close();
    
    this.isRunning = false;
    this.emit('agent.stopped');
    
    this.logger.info('✅ Orbit Agent stopped successfully');
  }
  
  private async bootSequence(): Promise<void> {
    this.logger.info('🔄 Executing boot sequence...');
    
    // 1. Cargar perfiles de negocio activos
    await this.loadActiveBusinessProfiles();
    
    // 2. Recuperar contexto de conversaciones pendientes
    await this.restoreConversationContext();
    
    // 3. Analizar estado actual del mercado
    await this.performStartupAnalysis();
    
    // 4. Generar recomendaciones iniciales
    await this.generateStartupRecommendations();
    
    this.emit('agent.ready');
  }
  
  private async gracefulShutdown(): Promise<void> {
    this.logger.info('🔄 Executing graceful shutdown...');
    
    // 1. Completar tareas críticas
    const criticalTasks = Array.from(this.currentTasks.values())
      .filter(task => task.priority === 'critical');
    
    await Promise.allSettled(
      criticalTasks.map(task => this.completeTask(task))
    );
    
    // 2. Guardar estado y aprendizajes
    await this.saveAgentState();
    await this.learner.persistLearnings();
    
    // 3. Notificar tareas pendientes
    const pendingTasks = Array.from(this.currentTasks.values());
    if (pendingTasks.length > 0) {
      this.emit('agent.tasks_pending', pendingTasks);
    }
  }
  
  // ==========================================================================
  // CORE AGENT PIPELINE - PERCEPCIÓN → ACCIÓN
  // ==========================================================================
  
  /**
   * Pipeline principal del agente: Percepción → Análisis → Planificación → Ejecución → Aprendizaje
   */
  async process(trigger: AgentTrigger): Promise<AgentResponse> {
    const context = this.createContext(trigger);
    const startTime = Date.now();
    
    try {
      this.logger.info(`🔄 Processing trigger: ${trigger.type}`, { context });
      
      // 1. PERCEPCIÓN - Qué está pasando?
      const perception = await this.perceive(trigger, context);
      
      // 2. ANÁLISIS - Qué significa?
      const analysis = await this.analyze(perception, context);
      
      // 3. PLANIFICACIÓN - Qué hacer?
      const plan = await this.plan(analysis, context);
      
      // 4. DECISIÓN - Vale la pena?
      const decision = await this.decide(plan, context);
      
      // 5. EJECUCIÓN - Hacerlo
      const result = await this.execute(decision, context);
      
      // 6. APRENDIZAJE - Qué aprendimos?
      await this.learn(result, context);
      
      const processingTime = Date.now() - startTime;
      
      this.logger.info(`✅ Trigger processed in ${processingTime}ms`, { 
        trigger: trigger.type, 
        actions: result.actions.length 
      });
      
      return {
        success: true,
        actions: result.actions,
        insights: result.insights,
        recommendations: result.recommendations,
        processingTime
      };
      
    } catch (error) {
      this.logger.error('❌ Error processing trigger:', error);
      
      // Aprender del error
      await this.learnFromError(error, context);
      
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // ==========================================================================
  // PIPELINE STAGES
  // ==========================================================================
  
  private async perceive(trigger: AgentTrigger, context: AgentContext): Promise<Perception> {
    // Recopilar información contextual relevante
    const businessProfile = await this.getBusinessProfile(context.businessId);
    const recentMemories = await this.memory.recall(trigger.data.query || '', context);
    const currentMetrics = await this.tools.analytics.getCurrentMetrics(context.businessId);
    
    return {
      trigger,
      context,
      businessProfile,
      memories: recentMemories,
      metrics: currentMetrics,
      timestamp: new Date()
    };
  }
  
  private async analyze(perception: Perception, context: AgentContext): Promise<BusinessAnalysis> {
    return await this.analyzer.analyzeBusinessState({
      businessProfile: perception.businessProfile,
      metrics: perception.metrics,
      context: perception.context,
      trigger: perception.trigger
    });
  }
  
  private async plan(analysis: BusinessAnalysis, context: AgentContext): Promise<ActionPlan> {
    return await this.planner.createActionPlan(analysis, {
      businessId: context.businessId,
      timeHorizon: 'immediate', // próximas 24h por defecto
      maxActions: 5,
      priorityThreshold: 'medium'
    });
  }
  
  private async decide(plan: ActionPlan, context: AgentContext): Promise<ExecutionDecision> {
    // Evaluar si ejecutar las acciones propuestas
    const businessProfile = await this.getBusinessProfile(context.businessId);
    const availableResources = await this.assessResources(context);
    
    // Filtrar acciones basado en configuración del negocio
    const approvedActions = plan.actions.filter(action => {
      // Verificar si requiere aprobación humana
      if (this.config.safety.approvalRequired.includes(action.type)) {
        return businessProfile.preferences.autoPublish;
      }
      
      // Verificar recursos necesarios
      return availableResources.canExecute(action);
    });
    
    return {
      approvedActions,
      rejectedActions: plan.actions.filter(a => !approvedActions.includes(a)),
      rationale: plan.rationale,
      confidence: plan.confidence
    };
  }
  
  private async execute(decision: ExecutionDecision, context: AgentContext): Promise<ExecutionResult> {
    const results: TaskResult[] = [];
    const insights: string[] = [];
    const recommendations: Recommendation[] = [];
    
    // Ejecutar acciones aprobadas
    for (const action of decision.approvedActions) {
      try {
        const result = await this.executor.execute(action, context);
        results.push(result);
        
        // Generar insights basados en el resultado
        if (result.status === 'completed') {
          const actionInsights = await this.generateActionInsights(action, result);
          insights.push(...actionInsights);
        }
      } catch (error) {
        this.logger.error(`Failed to execute action ${action.id}:`, error);
        results.push({
          taskId: action.id,
          status: 'failed',
          error: error.message,
          duration: 0,
          timestamp: new Date()
        });
      }
    }
    
    // Generar recomendaciones proactivas
    const proactiveRecommendations = await this.recommender.generateRecommendations({
      businessId: context.businessId,
      basedOn: 'execution_results',
      results
    });
    
    recommendations.push(...proactiveRecommendations);
    
    return {
      actions: results,
      insights,
      recommendations
    };
  }
  
  private async learn(result: ExecutionResult, context: AgentContext): Promise<void> {
    // Crear eventos de aprendizaje para cada acción ejecutada
    const learningEvents: LearningEvent[] = result.actions.map(actionResult => ({
      id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'action_result',
      data: {
        action: actionResult.taskId,
        result: actionResult.status,
        metrics: actionResult.metrics
      },
      outcome: actionResult.output,
      businessId: context.businessId,
      timestamp: new Date()
    }));
    
    // Procesar aprendizajes
    await Promise.all(
      learningEvents.map(event => this.learner.processLearningEvent(event))
    );
    
    // Actualizar memoria con nuevos insights
    for (const insight of result.insights) {
      await this.memory.longTerm.store(insight, {
        type: 'insight',
        businessId: context.businessId,
        timestamp: new Date().toISOString(),
        confidence: 0.8
      });
    }
  }
  
  // ==========================================================================
  // PUBLIC API - INTERFACES PRINCIPALES
  // ==========================================================================
  
  /**
   * Maneja un mensaje entrante (WhatsApp, Instagram, etc.)
   */
  async handleMessage(message: Message): Promise<MessageResponse> {
    const context = this.createContext({
      type: 'message_received',
      data: { message },
      businessId: message.to, // assuming message.to is businessId
      timestamp: new Date()
    });
    
    // Procesar a través del pipeline principal
    const response = await this.process({
      type: 'message_received',
      data: { message },
      businessId: context.businessId,
      timestamp: new Date()
    });
    
    return {
      success: response.success,
      reply: response.actions.find(a => a.type === 'send_message')?.output,
      actions: response.actions,
      processingTime: response.processingTime
    };
  }
  
  /**
   * Genera contenido para redes sociales
   */
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const context = this.createContext({
      type: 'content_request',
      data: { request },
      businessId: request.businessId,
      timestamp: new Date()
    });
    
    const response = await this.process({
      type: 'content_request',
      data: { request },
      businessId: request.businessId,
      timestamp: new Date()
    });
    
    // Extraer contenido generado de las acciones
    const contentAction = response.actions.find(a => a.type === 'create_content');
    
    if (!contentAction || !contentAction.output) {
      throw new Error('Failed to generate content');
    }
    
    return contentAction.output;
  }
  
  /**
   * Obtiene recomendaciones proactivas para un negocio
   */
  async getRecommendations(businessId: string): Promise<Recommendation[]> {
    return await this.recommender.generateRecommendations({
      businessId,
      basedOn: 'current_state',
      includeTypes: ['content', 'promotion', 'customer_service', 'growth']
    });
  }
  
  /**
   * Ejecuta una recomendación específica
   */
  async executeRecommendation(recommendationId: string, businessId: string): Promise<TaskResult[]> {
    const recommendation = await this.memory.longTerm.search(`recommendation:${recommendationId}`, 1);
    
    if (recommendation.length === 0) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }
    
    const context = this.createContext({
      type: 'recommendation_execution',
      data: { recommendationId },
      businessId,
      timestamp: new Date()
    });
    
    // Ejecutar acciones de la recomendación
    const results: TaskResult[] = [];
    for (const action of recommendation[0].metadata.actions || []) {
      const result = await this.executor.execute(action, context);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Chat conversacional con el agente
   */
  async chat(message: string, context: ConversationContext): Promise<string> {
    const agentContext = this.createContext({
      type: 'chat_message',
      data: { message, context },
      businessId: context.customerId, // assuming customerId maps to businessId
      timestamp: new Date()
    });
    
    // Usar modelo conversacional directamente
    const response = await this.tools.llm.generateResponse({
      prompt: message,
      context: context.history.slice(-5), // últimos 5 mensajes
      businessProfile: await this.getBusinessProfile(agentContext.businessId),
      tone: 'helpful_assistant'
    });
    
    return response;
  }
  
  /**
   * Analiza performance y genera insights
   */
  async generateInsights(businessId: string, period: string = '7d'): Promise<BusinessInsights> {
    const analysis = await this.analyzer.analyzeBusinessState({
      businessId,
      timeframe: period,
      includeComparative: true,
      includeForecasting: true
    });
    
    return {
      summary: analysis.metrics,
      opportunities: analysis.opportunities,
      risks: analysis.risks,
      recommendations: await this.recommender.generateRecommendations({
        businessId,
        basedOn: 'performance_analysis',
        analysis
      }),
      trends: analysis.competitive.opportunities,
      forecast: await this.analyzer.forecastMetrics(businessId, period)
    };
  }
  
  // ==========================================================================
  // INTERNAL UTILITIES
  // ==========================================================================
  
  private createContext(trigger: AgentTrigger): AgentContext {
    return {
      businessId: trigger.businessId,
      userId: trigger.userId || 'system',
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: trigger.timestamp || new Date(),
      metadata: trigger.metadata || {}
    };
  }
  
  private async getBusinessProfile(businessId: string): Promise<BusinessProfile> {
    let profile = this.businessProfiles.get(businessId);
    
    if (!profile) {
      // Cargar desde base de datos
      profile = await this.loadBusinessProfile(businessId);
      this.businessProfiles.set(businessId, profile);
    }
    
    return profile;
  }
  
  private async loadBusinessProfile(businessId: string): Promise<BusinessProfile> {
    // Implementar carga desde base de datos
    // Por ahora, perfil por defecto
    return {
      id: businessId,
      name: 'Negocio Local',
      industry: 'retail',
      location: 'Buenos Aires, AR',
      targetAudience: 'Público general',
      products: [],
      socialMedia: {},
      preferences: {
        tone: 'casual',
        language: 'simple',
        proactivity: 'medium',
        creativity: 'balanced',
        autoPublish: false,
        maxDailySpend: 100
      }
    };
  }
  
  private async loadActiveBusinessProfiles(): Promise<void> {
    // Implementar carga de perfiles activos
    this.logger.info('📋 Loading active business profiles...');
  }
  
  private async restoreConversationContext(): Promise<void> {
    // Implementar restauración de contexto de conversaciones
    this.logger.info('💬 Restoring conversation contexts...');
  }
  
  private async performStartupAnalysis(): Promise<void> {
    // Implementar análisis inicial del mercado
    this.logger.info('📊 Performing startup analysis...');
  }
  
  private async generateStartupRecommendations(): Promise<void> {
    // Implementar generación de recomendaciones iniciales
    this.logger.info('💡 Generating startup recommendations...');
  }
  
  private async saveAgentState(): Promise<void> {
    // Implementar guardado de estado
    this.logger.info('💾 Saving agent state...');
  }
  
  private async completeTask(task: Action): Promise<void> {
    try {
      await this.executor.execute(task, this.createContext({
        type: 'shutdown_task',
        businessId: task.parameters.businessId || 'unknown',
        timestamp: new Date()
      }));
    } catch (error) {
      this.logger.error(`Failed to complete critical task ${task.id}:`, error);
    }
  }
  
  private async assessResources(context: AgentContext): Promise<ResourceAssessment> {
    // Implementar evaluación de recursos
    return {
      canExecute: () => true, // Por ahora, siempre true
      availableTokens: 1000000,
      availableCalls: 100,
      timeConstraints: []
    };
  }
  
  private async generateActionInsights(action: Action, result: TaskResult): Promise<string[]> {
    // Generar insights basados en el resultado de una acción
    const insights: string[] = [];
    
    if (result.metrics?.userSatisfaction) {
      if (result.metrics.userSatisfaction > 0.8) {
        insights.push(`Acción ${action.type} tuvo alta satisfacción del usuario (${result.metrics.userSatisfaction})`);
      }
    }
    
    return insights;
  }
  
  private async learnFromError(error: Error, context: AgentContext): Promise<void> {
    const learningEvent: LearningEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'error_occurred',
      data: {
        error: error.message,
        stack: error.stack,
        context
      },
      outcome: { success: false },
      businessId: context.businessId,
      timestamp: new Date()
    };
    
    await this.learner.processLearningEvent(learningEvent);
  }
  
  private setupEventListeners(): void {
    // Setup internal event listeners
    this.on('agent.started', () => {
      this.logger.info('🎉 Agent started event emitted');
    });
    
    this.on('agent.stopped', () => {
      this.logger.info('👋 Agent stopped event emitted');
    });
    
    this.on('agent.ready', () => {
      this.logger.info('✅ Agent ready event emitted');
    });
  }
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

interface AgentTrigger {
  type: string;
  data: any;
  businessId: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

interface Perception {
  trigger: AgentTrigger;
  context: AgentContext;
  businessProfile: BusinessProfile;
  memories: any[];
  metrics: any;
  timestamp: Date;
}

interface ActionPlan {
  actions: Action[];
  rationale: string;
  confidence: number;
  timeframe: string;
}

interface ExecutionDecision {
  approvedActions: Action[];
  rejectedActions: Action[];
  rationale: string;
  confidence: number;
}

interface ExecutionResult {
  actions: TaskResult[];
  insights: string[];
  recommendations: Recommendation[];
}

interface AgentResponse {
  success: boolean;
  actions?: TaskResult[];
  insights?: string[];
  recommendations?: Recommendation[];
  error?: string;
  processingTime: number;
}

interface MessageResponse {
  success: boolean;
  reply?: any;
  actions: TaskResult[];
  processingTime: number;
}

interface ContentGenerationRequest {
  businessId: string;
  type: string;
  topic?: string;
  platform: string;
  objective: string;
}

interface BusinessInsights {
  summary: any;
  opportunities: any[];
  risks: any[];
  recommendations: Recommendation[];
  trends: string[];
  forecast: any;
}

interface ResourceAssessment {
  canExecute: (action: Action) => boolean;
  availableTokens: number;
  availableCalls: number;
  timeConstraints: string[];
}