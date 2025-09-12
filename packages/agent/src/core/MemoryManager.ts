// =============================================================================
// ORBIT AI AGENT - SISTEMA DE MEMORIA CONTEXTUAL
// =============================================================================

import Redis from 'redis';
import { 
  MemorySystem, 
  VectorMemory, 
  EventMemory, 
  MemoryEntry, 
  AgentEvent, 
  EventFilter, 
  EventPattern,
  LRUCache,
  MemoryConfig,
  AgentContext
} from '../types/index.js';
import { Logger } from '../utils/Logger.js';
import { EmbeddingProvider } from '../utils/EmbeddingProvider.js';

/**
 * 🧠 SISTEMA DE MEMORIA CONTEXTUAL
 * 
 * Gestiona múltiples capas de memoria:
 * - Short-term: Conversación actual (RAM)
 * - Working Memory: Últimas N interacciones (LRU Cache)
 * - Long-term: Conocimiento persistente (Vector DB)
 * - Episodic: Eventos importantes (PostgreSQL)
 */
export class MemoryManager implements MemorySystem {
  private readonly config: MemoryConfig;
  private readonly logger: Logger;
  private readonly embeddings: EmbeddingProvider;
  
  // CAPAS DE MEMORIA
  public readonly shortTerm: Map<string, any> = new Map();
  public readonly workingMemory: LRUMemoryCache;
  public readonly longTerm: VectorMemoryStore;
  public readonly episodic: EpisodicMemoryStore;
  
  // CONEXIONES
  private redisClient?: Redis.RedisClientType;
  private isInitialized: boolean = false;
  
  constructor(config: MemoryConfig) {
    this.config = config;
    this.logger = new Logger('MemoryManager');
    this.embeddings = new EmbeddingProvider();
    
    // Inicializar capas de memoria
    this.workingMemory = new LRUMemoryCache(config.workingMemorySize);
    this.longTerm = new VectorMemoryStore(config, this.embeddings);
    this.episodic = new EpisodicMemoryStore();
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.logger.info('🔄 Initializing memory system...');
      
      // Conectar a Redis para working memory persistente
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await this.redisClient.connect();
      
      // Inicializar sistemas de memoria
      await this.longTerm.initialize();
      await this.episodic.initialize();
      
      // Restaurar working memory desde Redis
      await this.restoreWorkingMemory();
      
      this.isInitialized = true;
      this.logger.info('✅ Memory system initialized successfully');
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize memory system:', error);
      throw error;
    }
  }
  
  async close(): Promise<void> {
    this.logger.info('🔄 Closing memory system...');
    
    // Persistir working memory
    await this.persistWorkingMemory();
    
    // Cerrar conexiones
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    
    await this.longTerm.close();
    await this.episodic.close();
    
    this.isInitialized = false;
    this.logger.info('✅ Memory system closed');
  }
  
  // ==========================================================================
  // MEMORY OPERATIONS
  // ==========================================================================
  
  /**
   * Recuerda información relevante para un contexto dado
   */
  async recall(query: string, context: AgentContext, limit: number = 10): Promise<MemoryEntry[]> {
    const memories: MemoryEntry[] = [];
    
    // 1. Buscar en memoria a corto plazo (conversación actual)
    const shortTermKey = `${context.businessId}:${context.sessionId}`;
    if (this.shortTerm.has(shortTermKey)) {
      const sessionMemory = this.shortTerm.get(shortTermKey);
      memories.push({
        id: `short_term_${Date.now()}`,
        content: JSON.stringify(sessionMemory),
        score: 1.0,
        metadata: { type: 'short_term', session: context.sessionId },
        timestamp: new Date()
      });
    }
    
    // 2. Buscar en working memory (cache LRU)
    const workingMemories = await this.workingMemory.searchRelevant(query, 3);
    memories.push(...workingMemories);
    
    // 3. Buscar en memoria a largo plazo (vector search)
    const longTermMemories = await this.longTerm.search(query, limit - memories.length);
    memories.push(...longTermMemories);
    
    // 4. Buscar eventos episódicos relevantes
    const episodicMemories = await this.episodic.searchRelevant(query, context, 2);
    memories.push(...episodicMemories);
    
    // Ordenar por relevancia y limitar resultados
    return memories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Almacena nueva información en el sistema de memoria
   */
  async store(content: string, metadata: Record<string, any>, context?: AgentContext): Promise<string> {
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determinar en qué capa almacenar basado en el tipo de contenido
    const memoryType = metadata.type || 'general';
    
    switch (memoryType) {
      case 'session':
      case 'conversation':
        // Almacenar en memoria a corto plazo
        if (context) {
          const sessionKey = `${context.businessId}:${context.sessionId}`;
          let sessionMemory = this.shortTerm.get(sessionKey) || [];
          sessionMemory.push({ content, metadata, timestamp: new Date() });
          
          // Mantener solo los últimos N mensajes
          if (sessionMemory.length > this.config.shortTermSize) {
            sessionMemory = sessionMemory.slice(-this.config.shortTermSize);
          }
          
          this.shortTerm.set(sessionKey, sessionMemory);
        }
        break;
        
      case 'insight':
      case 'pattern':
      case 'learning':
        // Almacenar en memoria a largo plazo (persistente)
        await this.longTerm.store(content, { ...metadata, id: memoryId });
        
        // También en working memory para acceso rápido
        this.workingMemory.set(memoryId, {
          id: memoryId,
          content,
          metadata,
          timestamp: new Date(),
          score: 0.9
        });
        break;
        
      case 'event':
      case 'action_result':
        // Almacenar como evento episódico
        await this.episodic.log({
          id: memoryId,
          type: metadata.eventType || 'general',
          data: { content, ...metadata },
          timestamp: new Date(),
          businessId: context?.businessId || 'unknown',
          success: metadata.success !== false,
          impact: metadata.impact || 'medium'
        });
        break;
        
      default:
        // Almacenar en working memory por defecto
        this.workingMemory.set(memoryId, {
          id: memoryId,
          content,
          metadata,
          timestamp: new Date(),
          score: 0.8
        });
    }
    
    return memoryId;
  }
  
  /**
   * Actualiza memoria existente
   */
  async update(memoryId: string, content: string, metadata?: Record<string, any>): Promise<void> {
    // Intentar actualizar en cada capa de memoria
    
    // Working memory
    if (this.workingMemory.has(memoryId)) {
      const existing = this.workingMemory.get(memoryId);
      if (existing) {
        existing.content = content;
        if (metadata) {
          existing.metadata = { ...existing.metadata, ...metadata };
        }
        this.workingMemory.set(memoryId, existing);
      }
    }
    
    // Long-term memory
    try {
      await this.longTerm.update(memoryId, content);
    } catch (error) {
      // Memory might not exist in long-term, that's ok
    }
  }
  
  /**
   * Elimina memoria
   */
  async forget(memoryId: string): Promise<void> {
    // Eliminar de todas las capas
    
    // Short-term (buscar en todas las sesiones)
    for (const [key, sessions] of this.shortTerm.entries()) {
      if (Array.isArray(sessions)) {
        const filtered = sessions.filter(s => s.metadata?.id !== memoryId);
        if (filtered.length !== sessions.length) {
          this.shortTerm.set(key, filtered);
        }
      }
    }
    
    // Working memory
    this.workingMemory.delete(memoryId);
    
    // Long-term memory
    try {
      await this.longTerm.delete(memoryId);
    } catch (error) {
      // Memory might not exist, that's ok
    }
  }
  
  // ==========================================================================
  // SPECIALIZED MEMORY OPERATIONS
  // ==========================================================================
  
  /**
   * Encuentra patrones en la memoria
   */
  async findPatterns(businessId: string, type?: string): Promise<EventPattern[]> {
    return await this.episodic.getPattern(type || 'all');
  }
  
  /**
   * Obtiene historial de interacciones con un cliente
   */
  async getCustomerHistory(customerId: string, limit: number = 50): Promise<MemoryEntry[]> {
    const query = `customer:${customerId}`;
    return await this.recall(query, {
      businessId: 'any',
      userId: customerId,
      sessionId: 'history',
      timestamp: new Date()
    }, limit);
  }
  
  /**
   * Obtiene insights de performance de contenido
   */
  async getContentInsights(businessId: string, days: number = 7): Promise<MemoryEntry[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const events = await this.episodic.query({
      type: 'content_generated',
      businessId,
      dateFrom,
      success: true
    });
    
    return events.map(event => ({
      id: event.id,
      content: JSON.stringify(event.data),
      score: event.impact === 'high' ? 1.0 : event.impact === 'medium' ? 0.7 : 0.4,
      metadata: { type: 'content_insight', event: event.type },
      timestamp: event.timestamp
    }));
  }
  
  // ==========================================================================
  // INTERNAL UTILITIES
  // ==========================================================================
  
  private async restoreWorkingMemory(): Promise<void> {
    if (!this.redisClient) return;
    
    try {
      const keys = await this.redisClient.keys('orbit:memory:*');
      
      for (const key of keys) {
        const data = await this.redisClient.get(key);
        if (data) {
          const memory = JSON.parse(data);
          this.workingMemory.set(memory.id, memory);
        }
      }
      
      this.logger.info(`🔄 Restored ${keys.length} working memories from Redis`);
    } catch (error) {
      this.logger.error('❌ Failed to restore working memory:', error);
    }
  }
  
  private async persistWorkingMemory(): Promise<void> {
    if (!this.redisClient) return;
    
    try {
      const memories = this.workingMemory.getAll();
      
      for (const memory of memories) {
        const key = `orbit:memory:${memory.id}`;
        await this.redisClient.setEx(key, 3600 * 24 * 7, JSON.stringify(memory)); // 7 days TTL
      }
      
      this.logger.info(`💾 Persisted ${memories.length} working memories to Redis`);
    } catch (error) {
      this.logger.error('❌ Failed to persist working memory:', error);
    }
  }
}

// =============================================================================
// LRU CACHE IMPLEMENTATION
// =============================================================================

class LRUMemoryCache implements LRUCache<string, MemoryEntry> {
  private cache = new Map<string, MemoryEntry>();
  private readonly maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: string): MemoryEntry | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
    return entry;
  }
  
  set(key: string, value: MemoryEntry): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  get size(): number {
    return this.cache.size;
  }
  
  getAll(): MemoryEntry[] {
    return Array.from(this.cache.values());
  }
  
  async searchRelevant(query: string, limit: number): Promise<MemoryEntry[]> {
    const memories = Array.from(this.cache.values());
    
    // Simple text matching (en producción usar embeddings)
    const relevant = memories
      .filter(memory => 
        memory.content.toLowerCase().includes(query.toLowerCase()) ||
        JSON.stringify(memory.metadata).toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return relevant;
  }
}

// =============================================================================
// VECTOR MEMORY STORE
// =============================================================================

class VectorMemoryStore implements VectorMemory {
  private readonly config: MemoryConfig;
  private readonly embeddings: EmbeddingProvider;
  private readonly logger: Logger;
  private memories: Map<string, MemoryEntry> = new Map();
  
  constructor(config: MemoryConfig, embeddings: EmbeddingProvider) {
    this.config = config;
    this.embeddings = embeddings;
    this.logger = new Logger('VectorMemoryStore');
  }
  
  async initialize(): Promise<void> {
    // En producción, conectar a Pinecone o PGVector
    this.logger.info('🔄 Initializing vector memory store...');
    
    // Por ahora, usar almacenamiento en memoria
    // TODO: Implementar Pinecone/PGVector
    
    this.logger.info('✅ Vector memory store initialized');
  }
  
  async close(): Promise<void> {
    // Cleanup resources
  }
  
  async store(content: string, metadata: Record<string, any>): Promise<string> {
    const id = metadata.id || `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generar embedding (en producción)
    // const embedding = await this.embeddings.generateEmbedding(content);
    
    const memory: MemoryEntry = {
      id,
      content,
      score: 1.0,
      metadata,
      timestamp: new Date()
    };
    
    this.memories.set(id, memory);
    
    return id;
  }
  
  async search(query: string, limit: number = 10): Promise<MemoryEntry[]> {
    // En producción, usar vector similarity search
    // Por ahora, simple text matching
    
    const results: MemoryEntry[] = [];
    const queryLower = query.toLowerCase();
    
    for (const memory of this.memories.values()) {
      if (memory.content.toLowerCase().includes(queryLower)) {
        // Calculate similarity score (mock)
        const words = queryLower.split(' ');
        let score = 0;
        
        for (const word of words) {
          if (memory.content.toLowerCase().includes(word)) {
            score += 0.2;
          }
        }
        
        results.push({ ...memory, score });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  async update(id: string, content: string): Promise<void> {
    const existing = this.memories.get(id);
    if (existing) {
      existing.content = content;
      existing.timestamp = new Date();
    }
  }
  
  async delete(id: string): Promise<void> {
    this.memories.delete(id);
  }
}

// =============================================================================
// EPISODIC MEMORY STORE
// =============================================================================

class EpisodicMemoryStore implements EventMemory {
  private readonly logger: Logger;
  private events: AgentEvent[] = [];
  
  constructor() {
    this.logger = new Logger('EpisodicMemoryStore');
  }
  
  async initialize(): Promise<void> {
    // En producción, conectar a PostgreSQL
    this.logger.info('🔄 Initializing episodic memory store...');
    this.logger.info('✅ Episodic memory store initialized');
  }
  
  async close(): Promise<void> {
    // Cleanup resources
  }
  
  async log(event: AgentEvent): Promise<void> {
    this.events.push(event);
    
    // Mantener solo los últimos N eventos en memoria
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }
  
  async query(filters: EventFilter): Promise<AgentEvent[]> {
    let filtered = this.events;
    
    if (filters.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }
    
    if (filters.businessId) {
      filtered = filtered.filter(e => e.businessId === filters.businessId);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(e => e.timestamp >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(e => e.timestamp <= filters.dateTo!);
    }
    
    if (filters.success !== undefined) {
      filtered = filtered.filter(e => e.success === filters.success);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getPattern(type: string): Promise<EventPattern> {
    const relevantEvents = type === 'all' 
      ? this.events 
      : this.events.filter(e => e.type.includes(type));
    
    if (relevantEvents.length === 0) {
      return {
        type,
        frequency: 0,
        successRate: 0,
        bestTimes: [],
        commonContext: {}
      };
    }
    
    const successfulEvents = relevantEvents.filter(e => e.success);
    const successRate = successfulEvents.length / relevantEvents.length;
    
    // Analizar mejores horarios
    const hourCounts = new Map<number, number>();
    for (const event of successfulEvents) {
      const hour = event.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
    
    const bestHours = Array.from(hourCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const date = new Date();
        date.setHours(hour, 0, 0, 0);
        return date;
      });
    
    return {
      type,
      frequency: relevantEvents.length,
      successRate,
      bestTimes: bestHours,
      commonContext: {} // TODO: Analizar contexto común
    };
  }
  
  async searchRelevant(query: string, context: AgentContext, limit: number): Promise<MemoryEntry[]> {
    const relevantEvents = this.events
      .filter(e => e.businessId === context.businessId)
      .filter(e => 
        JSON.stringify(e.data).toLowerCase().includes(query.toLowerCase()) ||
        e.type.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
    
    return relevantEvents.map(event => ({
      id: event.id,
      content: `Event: ${event.type} - ${JSON.stringify(event.data)}`,
      score: event.success ? 0.8 : 0.4,
      metadata: { type: 'episodic_event', eventType: event.type, success: event.success },
      timestamp: event.timestamp
    }));
  }
}