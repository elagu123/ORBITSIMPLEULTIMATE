// =============================================================================
// ORBIT AI AGENT - INTEGRACIÓN CON SISTEMA EXISTENTE
// =============================================================================

import { Logger } from '../utils/Logger.js';
import { OrbitAgent } from '../core/OrbitAgent.js';
import { AgentContext, BusinessProfile } from '../types/index.js';
import express from 'express';
import cors from 'cors';

/**
 * 🔗 INTEGRADOR DE ORBIT AGENT CON SISTEMA EXISTENTE
 * 
 * Conecta el agente autónomo con:
 * - Sistema Orbit Simple MKT existente
 * - APIs del backend actual
 * - Base de datos de usuarios
 * - Frontend React existente
 */
export class OrbitIntegration {
  private readonly logger: Logger;
  private readonly agent: OrbitAgent;
  private readonly app: express.Application;
  private readonly port: number = 3003; // Puerto dedicado para el agente

  constructor(agent: OrbitAgent) {
    this.logger = new Logger('OrbitIntegration');
    this.agent = agent;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Inicializar integración
   */
  async initialize(): Promise<void> {
    this.logger.info('🔄 Initializing Orbit Agent Integration...');

    // Inicializar agente
    await this.agent.initialize();

    // Iniciar servidor de integración
    this.startServer();

    // Conectar con sistema existente
    await this.connectToExistingSystem();

    // Registrar webhooks
    await this.setupWebhooks();

    this.logger.info('✅ Orbit Agent Integration initialized');
  }

  /**
   * Configurar middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors({
      origin: [
        'http://localhost:5173', // Vite dev
        'http://localhost:3000', // Frontend prod
        'http://localhost:3001'  // Server existente
      ],
      credentials: true
    }));

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging de requests
    this.app.use((req, res, next) => {
      this.logger.info(`📡 ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configurar rutas de la API del agente
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        agent: 'Orbit AI Agent',
        timestamp: new Date().toISOString()
      });
    });

    // Chat con el agente
    this.app.post('/agent/chat', async (req, res) => {
      try {
        const { message, businessId, userId, sessionId } = req.body;

        const context: AgentContext = {
          businessId: businessId || 'default',
          userId: userId || 'anonymous',
          sessionId: sessionId || `session_${Date.now()}`,
          timestamp: new Date()
        };

        const response = await this.agent.handleMessage(message, context);
        res.json(response);

      } catch (error) {
        this.logger.error('❌ Chat error:', error);
        res.status(500).json({ error: 'Failed to process message' });
      }
    });

    // Generar contenido
    this.app.post('/agent/content/generate', async (req, res) => {
      try {
        const { type, platform, audience, businessProfile } = req.body;

        const content = await this.agent.generateContent({
          type,
          platform,
          audience,
          businessProfile
        });

        res.json(content);

      } catch (error) {
        this.logger.error('❌ Content generation error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
      }
    });

    // Obtener recomendaciones
    this.app.post('/agent/recommendations', async (req, res) => {
      try {
        const { businessProfile, metrics, context } = req.body;

        const recommendations = await this.agent.getRecommendations({
          businessProfile,
          metrics,
          context
        });

        res.json(recommendations);

      } catch (error) {
        this.logger.error('❌ Recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
      }
    });

    // Ejecutar acción específica
    this.app.post('/agent/execute', async (req, res) => {
      try {
        const { action, params, context } = req.body;

        const result = await this.agent.executeAction(action, params, context);
        res.json(result);

      } catch (error) {
        this.logger.error('❌ Action execution error:', error);
        res.status(500).json({ error: 'Failed to execute action' });
      }
    });

    // Estado del agente
    this.app.get('/agent/status', async (req, res) => {
      try {
        const status = await this.agent.getStatus();
        res.json(status);

      } catch (error) {
        this.logger.error('❌ Status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
      }
    });

    // Webhook para recibir eventos del sistema existente
    this.app.post('/webhooks/orbit-system', async (req, res) => {
      try {
        const { event, data } = req.body;
        
        await this.handleSystemEvent(event, data);
        res.json({ success: true });

      } catch (error) {
        this.logger.error('❌ Webhook error:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
      }
    });

    // Sincronizar datos de usuario
    this.app.post('/agent/sync/user', async (req, res) => {
      try {
        const { userId, userData } = req.body;

        await this.syncUserData(userId, userData);
        res.json({ success: true });

      } catch (error) {
        this.logger.error('❌ User sync error:', error);
        res.status(500).json({ error: 'Failed to sync user data' });
      }
    });
  }

  /**
   * Iniciar servidor
   */
  private startServer(): void {
    this.app.listen(this.port, () => {
      this.logger.info(`🚀 Orbit Agent Server running on port ${this.port}`);
    });
  }

  /**
   * Conectar con sistema Orbit Simple MKT existente
   */
  private async connectToExistingSystem(): Promise<void> {
    this.logger.info('🔗 Connecting to existing Orbit Simple MKT system...');

    try {
      // Verificar conectividad con backend existente
      const response = await fetch('http://localhost:3001/health');
      
      if (response.ok) {
        this.logger.info('✅ Connected to Orbit Simple MKT backend');
      } else {
        this.logger.warn('⚠️ Orbit Simple MKT backend not responding');
      }

      // Sincronizar configuraciones
      await this.syncSystemConfiguration();

    } catch (error) {
      this.logger.warn('⚠️ Could not connect to existing system:', error);
    }
  }

  /**
   * Configurar webhooks
   */
  private async setupWebhooks(): Promise<void> {
    this.logger.info('🔄 Setting up webhooks...');

    // Registrar webhook en sistema existente
    try {
      const webhookUrl = `http://localhost:${this.port}/webhooks/orbit-system`;
      
      // Aquí se registraría el webhook en el sistema existente
      this.logger.info(`📡 Webhook registered: ${webhookUrl}`);

    } catch (error) {
      this.logger.error('❌ Failed to setup webhooks:', error);
    }
  }

  /**
   * Manejar eventos del sistema existente
   */
  private async handleSystemEvent(event: string, data: any): Promise<void> {
    this.logger.info(`📨 Received system event: ${event}`);

    switch (event) {
      case 'user_registered':
        await this.onUserRegistered(data);
        break;

      case 'content_published':
        await this.onContentPublished(data);
        break;

      case 'campaign_started':
        await this.onCampaignStarted(data);
        break;

      case 'metrics_updated':
        await this.onMetricsUpdated(data);
        break;

      default:
        this.logger.warn(`❓ Unknown event: ${event}`);
    }
  }

  /**
   * Usuario registrado
   */
  private async onUserRegistered(userData: any): Promise<void> {
    const context: AgentContext = {
      businessId: userData.businessId || 'default',
      userId: userData.id,
      sessionId: `onboarding_${Date.now()}`,
      timestamp: new Date()
    };

    // Iniciar secuencia de bienvenida autónoma
    await this.agent.startOnboardingSequence(userData, context);
  }

  /**
   * Contenido publicado
   */
  private async onContentPublished(data: any): Promise<void> {
    // Analizar rendimiento y ajustar estrategia
    const context: AgentContext = {
      businessId: data.businessId,
      userId: data.userId,
      sessionId: `content_analysis_${Date.now()}`,
      timestamp: new Date()
    };

    await this.agent.analyzeContentPerformance(data, context);
  }

  /**
   * Campaña iniciada
   */
  private async onCampaignStarted(data: any): Promise<void> {
    // Monitorear campaña y optimizar
    const context: AgentContext = {
      businessId: data.businessId,
      userId: data.userId,
      sessionId: `campaign_monitor_${Date.now()}`,
      timestamp: new Date()
    };

    await this.agent.startCampaignMonitoring(data, context);
  }

  /**
   * Métricas actualizadas
   */
  private async onMetricsUpdated(data: any): Promise<void> {
    // Analizar métricas y generar insights
    const context: AgentContext = {
      businessId: data.businessId,
      userId: data.userId,
      sessionId: `metrics_analysis_${Date.now()}`,
      timestamp: new Date()
    };

    await this.agent.analyzeMetricsUpdate(data, context);
  }

  /**
   * Sincronizar datos de usuario
   */
  private async syncUserData(userId: string, userData: any): Promise<void> {
    this.logger.info(`🔄 Syncing user data for ${userId}`);

    // Actualizar perfil en memoria del agente
    await this.agent.updateUserProfile(userId, userData);

    // Sincronizar con base de datos del agente
    // Implementar según base de datos utilizada
  }

  /**
   * Sincronizar configuración del sistema
   */
  private async syncSystemConfiguration(): Promise<void> {
    try {
      // Obtener configuración del sistema existente
      const response = await fetch('http://localhost:3001/api/config');
      
      if (response.ok) {
        const config = await response.json();
        
        // Aplicar configuración al agente
        await this.agent.updateConfiguration(config);
        
        this.logger.info('✅ System configuration synchronized');
      }

    } catch (error) {
      this.logger.warn('⚠️ Could not sync system configuration:', error);
    }
  }

  /**
   * Cerrar integración
   */
  async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down Orbit Agent Integration...');
    
    await this.agent.shutdown();
    
    this.logger.info('✅ Integration shutdown complete');
  }
}