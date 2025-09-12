// =============================================================================
// ORBIT AI AGENT - TOOLKIT COMPLETO DE HERRAMIENTAS
// =============================================================================

import { 
  Message, 
  MessageIntent, 
  ConversationContext,
  GeneratedContent,
  ContentRequest,
  Campaign,
  Order,
  BusinessProfile,
  AgentContext,
  ToolConfig
} from '../types/index.js';
import { WhatsAppTool } from './WhatsAppTool.js';
import { SocialMediaTool } from './SocialMediaTool.js';
import { ContentGenerationTool } from './ContentGenerationTool.js';
import { AnalyticsTool } from './AnalyticsTool.js';
import { SalesTool } from './SalesTool.js';
import { LLMTool } from './LLMTool.js';
import { ImageGenerationTool } from './ImageGenerationTool.js';
import { EmailMarketingTool } from './EmailMarketingTool.js';
import { Logger } from '../utils/Logger.js';

/**
 * 🛠️ TOOLKIT COMPLETO DEL AGENTE
 * 
 * Conjunto de herramientas que le permiten al agente interactuar
 * con el mundo exterior:
 * 
 * - 📱 WhatsApp & Mensajería
 * - 📊 Redes Sociales (Instagram, Facebook, TikTok)
 * - 🎨 Generación de Contenido 
 * - 📈 Analytics & Métricas
 * - 💰 Ventas & Promociones
 * - 🤖 LLM & Procesamiento de Lenguaje
 * - 🖼️ Generación de Imágenes
 * - 📧 Email Marketing
 */
export class AgentToolkit {
  private readonly config: ToolConfig;
  private readonly logger: Logger;
  
  // HERRAMIENTAS PRINCIPALES
  public readonly whatsapp: WhatsAppTool;
  public readonly social: SocialMediaTool;
  public readonly content: ContentGenerationTool;
  public readonly analytics: AnalyticsTool;
  public readonly sales: SalesTool;
  public readonly llm: LLMTool;
  public readonly images: ImageGenerationTool;
  public readonly email: EmailMarketingTool;
  
  // ESTADO
  private isInitialized: boolean = false;
  private availableTools: Set<string> = new Set();
  
  constructor(config: ToolConfig) {
    this.config = config;
    this.logger = new Logger('AgentToolkit');
    
    // Inicializar herramientas según configuración
    this.whatsapp = new WhatsAppTool(config.whatsapp);
    this.social = new SocialMediaTool({
      instagram: config.instagram,
      facebook: config.facebook
    });
    this.content = new ContentGenerationTool();
    this.analytics = new AnalyticsTool(config.analytics);
    this.sales = new SalesTool();
    this.llm = new LLMTool();
    this.images = new ImageGenerationTool(config.imageGeneration);
    this.email = new EmailMarketingTool(config.emailMarketing);
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    this.logger.info('🔄 Initializing agent toolkit...');
    
    try {
      // Inicializar herramientas en paralelo
      const initPromises = [
        this.initializeTool('whatsapp', () => this.whatsapp.initialize()),
        this.initializeTool('social', () => this.social.initialize()),
        this.initializeTool('content', () => this.content.initialize()),
        this.initializeTool('analytics', () => this.analytics.initialize()),
        this.initializeTool('sales', () => this.sales.initialize()),
        this.initializeTool('llm', () => this.llm.initialize()),
        this.initializeTool('images', () => this.images.initialize()),
        this.initializeTool('email', () => this.email.initialize())
      ];
      
      await Promise.allSettled(initPromises);
      
      this.isInitialized = true;
      this.logger.info(`✅ Agent toolkit initialized. Available tools: ${Array.from(this.availableTools).join(', ')}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize toolkit:', error);
      throw error;
    }
  }
  
  private async initializeTool(name: string, initFn: () => Promise<void>): Promise<void> {
    try {
      await initFn();
      this.availableTools.add(name);
      this.logger.info(`✅ Tool '${name}' initialized successfully`);
    } catch (error) {
      this.logger.warn(`⚠️ Tool '${name}' failed to initialize:`, error);
    }
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE COMUNICACIÓN
  // ==========================================================================
  
  /**
   * Envía mensaje por WhatsApp
   */
  async sendWhatsAppMessage(to: string, content: string, context?: AgentContext): Promise<any> {
    if (!this.availableTools.has('whatsapp')) {
      throw new Error('WhatsApp tool not available');
    }
    
    this.logger.info(`📱 Sending WhatsApp message to ${to}`);
    
    try {
      const result = await this.whatsapp.sendMessage(to, content, {
        businessId: context?.businessId,
        automated: true,
        timestamp: new Date()
      });
      
      this.logger.info(`✅ WhatsApp message sent successfully`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Failed to send WhatsApp message:`, error);
      throw error;
    }
  }
  
  /**
   * Procesa mensaje entrante de WhatsApp
   */
  async processIncomingMessage(message: Message): Promise<MessageIntent> {
    if (!this.availableTools.has('whatsapp')) {
      throw new Error('WhatsApp tool not available');
    }
    
    this.logger.info(`📱 Processing incoming message from ${message.from}`);
    
    try {
      // Analizar intención usando LLM
      const intent = await this.llm.analyzeMessageIntent(message.content, {
        platform: message.platform,
        history: [] // Obtener del contexto si está disponible
      });
      
      this.logger.info(`🧠 Message intent detected: ${intent.primary} (confidence: ${intent.confidence})`);
      return intent;
      
    } catch (error) {
      this.logger.error(`❌ Failed to process message:`, error);
      throw error;
    }
  }
  
  /**
   * Genera respuesta inteligente para mensaje
   */
  async generateMessageResponse(
    message: Message, 
    intent: MessageIntent, 
    context: ConversationContext
  ): Promise<string> {
    if (!this.availableTools.has('llm')) {
      return 'Gracias por tu mensaje. Te responderé pronto.';
    }
    
    this.logger.info(`🤖 Generating response for intent: ${intent.primary}`);
    
    try {
      const response = await this.llm.generateConversationalResponse({
        message: message.content,
        intent,
        context,
        businessProfile: context.customerProfile ? undefined : await this.getBusinessProfile(context)
      });
      
      this.logger.info(`✅ Response generated successfully`);
      return response;
      
    } catch (error) {
      this.logger.error(`❌ Failed to generate response:`, error);
      return 'Disculpa, hubo un problema. ¿Podrías repetir tu consulta?';
    }
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE REDES SOCIALES
  // ==========================================================================
  
  /**
   * Publica contenido en redes sociales
   */
  async publishToSocial(content: GeneratedContent, platforms: string[]): Promise<any[]> {
    if (!this.availableTools.has('social')) {
      throw new Error('Social media tools not available');
    }
    
    this.logger.info(`📱 Publishing to social platforms: ${platforms.join(', ')}`);
    
    try {
      const results = await Promise.allSettled(
        platforms.map(platform => 
          this.social.publishContent(content, platform)
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      this.logger.info(`✅ Published to ${successful}/${platforms.length} platforms`);
      
      return results.map(r => r.status === 'fulfilled' ? r.value : null);
      
    } catch (error) {
      this.logger.error(`❌ Failed to publish to social media:`, error);
      throw error;
    }
  }
  
  /**
   * Programa contenido para redes sociales
   */
  async scheduleContent(content: GeneratedContent, publishAt: Date, platforms: string[]): Promise<any> {
    if (!this.availableTools.has('social')) {
      throw new Error('Social media tools not available');
    }
    
    this.logger.info(`📅 Scheduling content for ${publishAt.toISOString()}`);
    
    return await this.social.scheduleContent(content, publishAt, platforms);
  }
  
  /**
   * Obtiene métricas de redes sociales
   */
  async getSocialMetrics(businessId: string, timeframe: string = '7d'): Promise<any> {
    if (!this.availableTools.has('social')) {
      return { engagement: 0, reach: 0, clicks: 0 };
    }
    
    return await this.social.getMetrics(businessId, timeframe);
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE CONTENIDO
  // ==========================================================================
  
  /**
   * Genera contenido para redes sociales
   */
  async generateContent(request: ContentRequest, businessProfile?: BusinessProfile): Promise<GeneratedContent> {
    if (!this.availableTools.has('content')) {
      throw new Error('Content generation tool not available');
    }
    
    this.logger.info(`🎨 Generating ${request.type} content for ${request.platform}`);
    
    try {
      const content = await this.content.generateContent(request, businessProfile);
      
      // Si se requiere imagen, generarla
      if (content.content.imagePrompt && this.availableTools.has('images')) {
        const imageUrl = await this.images.generateImage(content.content.imagePrompt, {
          style: 'marketing',
          platform: request.platform
        });
        content.content.imageUrl = imageUrl;
      }
      
      this.logger.info(`✅ Content generated successfully: ${request.type}`);
      return content;
      
    } catch (error) {
      this.logger.error(`❌ Failed to generate content:`, error);
      throw error;
    }
  }
  
  /**
   * Genera variaciones de contenido existente
   */
  async generateContentVariations(originalContent: string, count: number = 3): Promise<string[]> {
    if (!this.availableTools.has('content')) {
      return [originalContent];
    }
    
    return await this.content.generateVariations(originalContent, count);
  }
  
  /**
   * Optimiza contenido para SEO
   */
  async optimizeContentForSEO(content: string, keywords: string[]): Promise<string> {
    if (!this.availableTools.has('content')) {
      return content;
    }
    
    return await this.content.optimizeForSEO(content, keywords);
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE VENTAS
  // ==========================================================================
  
  /**
   * Crea promoción automática
   */
  async createPromotion(params: {
    type: string;
    discount: number;
    products?: string[];
    duration: number;
    businessId: string;
  }): Promise<any> {
    if (!this.availableTools.has('sales')) {
      throw new Error('Sales tools not available');
    }
    
    this.logger.info(`💰 Creating promotion: ${params.type} (${params.discount}% off)`);
    
    return await this.sales.createPromotion(params);
  }
  
  /**
   * Procesa pedido de cliente
   */
  async processOrder(orderData: {
    customerId: string;
    items: any[];
    total: number;
    businessId: string;
  }): Promise<Order> {
    if (!this.availableTools.has('sales')) {
      throw new Error('Sales tools not available');
    }
    
    this.logger.info(`🛒 Processing order for customer ${orderData.customerId}`);
    
    return await this.sales.processOrder(orderData);
  }
  
  /**
   * Genera recomendaciones de upsell/cross-sell
   */
  async generateSalesRecommendations(customerId: string, currentCart: any[]): Promise<any[]> {
    if (!this.availableTools.has('sales')) {
      return [];
    }
    
    return await this.sales.generateRecommendations(customerId, currentCart);
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE ANÁLISIS
  // ==========================================================================
  
  /**
   * Obtiene métricas actuales del negocio
   */
  async getCurrentMetrics(businessId: string): Promise<any> {
    if (!this.availableTools.has('analytics')) {
      // Métricas mock por defecto
      return {
        sales: Math.floor(Math.random() * 1000),
        orders: Math.floor(Math.random() * 50),
        visitors: Math.floor(Math.random() * 500),
        socialEngagement: Math.floor(Math.random() * 100)
      };
    }
    
    return await this.analytics.getCurrentMetrics(businessId);
  }
  
  /**
   * Genera reporte de performance
   */
  async generatePerformanceReport(businessId: string, period: string): Promise<any> {
    if (!this.availableTools.has('analytics')) {
      return { error: 'Analytics not available' };
    }
    
    this.logger.info(`📊 Generating performance report for ${period}`);
    
    return await this.analytics.generateReport(businessId, period);
  }
  
  /**
   * Analiza competencia
   */
  async analyzeCompetitors(businessProfile: BusinessProfile): Promise<any> {
    if (!this.availableTools.has('analytics')) {
      return { competitors: [], insights: [] };
    }
    
    return await this.analytics.analyzeCompetitors(businessProfile);
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE IMAGEN
  // ==========================================================================
  
  /**
   * Genera imagen para contenido
   */
  async generateContentImage(prompt: string, options?: any): Promise<string> {
    if (!this.availableTools.has('images')) {
      // Imagen placeholder
      return 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Contenido+Visual';
    }
    
    this.logger.info(`🖼️ Generating image for prompt: ${prompt.substring(0, 50)}...`);
    
    return await this.images.generateImage(prompt, {
      style: 'marketing',
      quality: 'high',
      ...options
    });
  }
  
  /**
   * Genera múltiples variaciones de imagen
   */
  async generateImageVariations(prompt: string, count: number = 3): Promise<string[]> {
    if (!this.availableTools.has('images')) {
      const placeholder = 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Imagen+';
      return Array.from({ length: count }, (_, i) => `${placeholder}${i + 1}`);
    }
    
    return await this.images.generateVariations(prompt, count);
  }
  
  // ==========================================================================
  // HERRAMIENTAS DE EMAIL
  // ==========================================================================
  
  /**
   * Envía campaña de email marketing
   */
  async sendEmailCampaign(campaign: {
    subject: string;
    content: string;
    recipients: string[];
    businessId: string;
  }): Promise<any> {
    if (!this.availableTools.has('email')) {
      throw new Error('Email marketing tools not available');
    }
    
    this.logger.info(`📧 Sending email campaign to ${campaign.recipients.length} recipients`);
    
    return await this.email.sendCampaign(campaign);
  }
  
  /**
   * Crea newsletter automático
   */
  async createNewsletter(businessId: string, content: any[]): Promise<any> {
    if (!this.availableTools.has('email')) {
      throw new Error('Email marketing tools not available');
    }
    
    return await this.email.createNewsletter(businessId, content);
  }
  
  // ==========================================================================
  // UTILIDADES Y HELPERS
  // ==========================================================================
  
  /**
   * Verifica si una herramienta está disponible
   */
  isToolAvailable(toolName: string): boolean {
    return this.availableTools.has(toolName);
  }
  
  /**
   * Lista herramientas disponibles
   */
  getAvailableTools(): string[] {
    return Array.from(this.availableTools);
  }
  
  /**
   * Obtiene estadísticas del toolkit
   */
  getToolkitStats(): any {
    return {
      totalTools: 8,
      availableTools: this.availableTools.size,
      tools: Object.fromEntries(
        Array.from(this.availableTools).map(tool => [tool, 'active'])
      ),
      initialized: this.isInitialized
    };
  }
  
  // ==========================================================================
  // MÉTODOS PRIVADOS
  // ==========================================================================
  
  private async getBusinessProfile(context: ConversationContext): Promise<BusinessProfile | undefined> {
    // En producción, cargar desde base de datos
    // Por ahora, retornar undefined
    return undefined;
  }
  
  /**
   * Ejecuta herramienta con manejo de errores y retry
   */
  private async executeWithRetry<T>(
    toolName: string,
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`⚠️ Tool '${toolName}' failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Valida parámetros de entrada
   */
  private validateParams(params: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!params[field]) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}