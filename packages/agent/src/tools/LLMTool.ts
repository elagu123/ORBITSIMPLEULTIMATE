// =============================================================================
// ORBIT AI AGENT - LLM TOOL (LARGE LANGUAGE MODEL)
// =============================================================================

import { 
  Message, 
  MessageIntent, 
  ConversationContext, 
  BusinessProfile,
  ContentRequest,
  GeneratedContent
} from '../types/index.js';
import { Logger } from '../utils/Logger.js';

/**
 * 🤖 HERRAMIENTA DE LENGUAJE (LLM)
 * 
 * Interfaz unificada para múltiples modelos de lenguaje:
 * - Claude (Anthropic)
 * - GPT (OpenAI) 
 * - Gemini (Google)
 * 
 * Capacidades:
 * - Análisis de intención de mensajes
 * - Generación de respuestas conversacionales
 * - Creación de contenido
 * - Análisis de sentimiento
 * - Traducción y localización
 */
export class LLMTool {
  private readonly logger: Logger;
  
  // Configuración de modelos
  private readonly models = {
    claude: {
      name: 'claude-3-5-sonnet-20241022',
      maxTokens: 8192,
      temperature: 0.7,
      available: !!process.env.ANTHROPIC_API_KEY
    },
    openai: {
      name: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.7,
      available: !!process.env.OPENAI_API_KEY
    },
    gemini: {
      name: 'gemini-2.5-flash',
      maxTokens: 8192,
      temperature: 0.7,
      available: !!process.env.GEMINI_API_KEY
    }
  };
  
  private primaryModel: keyof typeof this.models;
  private fallbackModel: keyof typeof this.models;
  
  constructor() {
    this.logger = new Logger('LLMTool');
    
    // Seleccionar modelo primario basado en disponibilidad
    this.primaryModel = this.selectBestModel();
    this.fallbackModel = this.selectFallbackModel();
  }
  
  async initialize(): Promise<void> {
    this.logger.info('🔄 Initializing LLM tool...');
    
    // Verificar disponibilidad de modelos
    const availableModels = Object.entries(this.models)
      .filter(([_, config]) => config.available)
      .map(([name]) => name);
    
    if (availableModels.length === 0) {
      throw new Error('No LLM models available - check API keys');
    }
    
    this.logger.info(`✅ LLM tool initialized. Primary: ${this.primaryModel}, Available: ${availableModels.join(', ')}`);
  }
  
  // ==========================================================================
  // ANÁLISIS DE INTENCIÓN DE MENSAJES
  // ==========================================================================
  
  /**
   * Analiza la intención de un mensaje de cliente
   */
  async analyzeMessageIntent(
    messageContent: string,
    context?: {
      platform?: string;
      history?: Message[];
      customerProfile?: any;
    }
  ): Promise<MessageIntent> {
    const prompt = this.buildIntentAnalysisPrompt(messageContent, context);
    
    try {
      const response = await this.generateCompletion(prompt, {
        maxTokens: 500,
        temperature: 0.3,
        responseFormat: 'json'
      });
      
      const parsed = JSON.parse(response);
      
      return {
        primary: parsed.intent || 'information_request',
        confidence: parsed.confidence || 0.7,
        entities: parsed.entities || [],
        sentiment: parsed.sentiment || 0.5,
        urgency: parsed.urgency || 'medium'
      };
      
    } catch (error) {
      this.logger.error('❌ Failed to analyze message intent:', error);
      
      // Fallback: análisis simple basado en keywords
      return this.analyzeIntentFallback(messageContent);
    }
  }
  
  private buildIntentAnalysisPrompt(messageContent: string, context: any = {}): string {
    return `
Eres un experto en análisis de intención de mensajes para negocios argentinos.

MENSAJE DEL CLIENTE: "${messageContent}"

CONTEXTO:
- Plataforma: ${context.platform || 'WhatsApp'}
- País: Argentina
- Negocio: Local/PYME

INSTRUCCIONES:
Analiza el mensaje y determina:

1. INTENCIÓN PRINCIPAL (una de estas):
   - greeting: Saludo inicial
   - product_inquiry: Consulta sobre productos/servicios
   - price_inquiry: Pregunta sobre precios
   - order_placement: Quiere hacer un pedido
   - complaint: Queja o problema
   - compliment: Elogio o feedback positivo
   - information_request: Solicitud de información general
   - support_request: Necesita ayuda/soporte
   - cancellation: Quiere cancelar algo
   - modification: Quiere modificar un pedido

2. NIVEL DE CONFIANZA (0.0 a 1.0)

3. ENTIDADES DETECTADAS:
   - productos mencionados
   - cantidades
   - ubicaciones
   - horarios

4. SENTIMIENTO (-1.0 a 1.0):
   - -1.0: Muy negativo
   - 0.0: Neutral
   - 1.0: Muy positivo

5. URGENCIA (low, medium, high)

RESPONDE EN JSON:
{
  "intent": "tipo_de_intencion",
  "confidence": 0.0,
  "entities": [
    {"type": "producto", "value": "nombre", "confidence": 0.0}
  ],
  "sentiment": 0.0,
  "urgency": "medium",
  "reasoning": "breve explicación"
}
`;
  }
  
  private analyzeIntentFallback(messageContent: string): MessageIntent {
    const content = messageContent.toLowerCase();
    
    // Detección simple por keywords
    if (content.includes('hola') || content.includes('buenos') || content.includes('buenas')) {
      return { primary: 'greeting', confidence: 0.8, entities: [], sentiment: 0.7, urgency: 'low' };
    }
    
    if (content.includes('precio') || content.includes('costo') || content.includes('cuánto')) {
      return { primary: 'price_inquiry', confidence: 0.7, entities: [], sentiment: 0.5, urgency: 'medium' };
    }
    
    if (content.includes('quiero') || content.includes('pedido') || content.includes('comprar')) {
      return { primary: 'order_placement', confidence: 0.8, entities: [], sentiment: 0.6, urgency: 'high' };
    }
    
    if (content.includes('problema') || content.includes('mal') || content.includes('error')) {
      return { primary: 'complaint', confidence: 0.7, entities: [], sentiment: -0.3, urgency: 'high' };
    }
    
    return { primary: 'information_request', confidence: 0.5, entities: [], sentiment: 0.5, urgency: 'medium' };
  }
  
  // ==========================================================================
  // GENERACIÓN DE RESPUESTAS CONVERSACIONALES
  // ==========================================================================
  
  /**
   * Genera respuesta conversacional para un mensaje
   */
  async generateConversationalResponse(params: {
    message: string;
    intent: MessageIntent;
    context: ConversationContext;
    businessProfile?: BusinessProfile;
  }): Promise<string> {
    const prompt = this.buildConversationPrompt(params);
    
    try {
      const response = await this.generateCompletion(prompt, {
        maxTokens: 300,
        temperature: 0.8
      });
      
      // Limpiar y validar respuesta
      return this.cleanConversationalResponse(response);
      
    } catch (error) {
      this.logger.error('❌ Failed to generate conversational response:', error);
      return this.getFallbackResponse(params.intent);
    }
  }
  
  private buildConversationPrompt(params: any): string {
    const { message, intent, context, businessProfile } = params;
    
    return `
Eres el asistente virtual de ${businessProfile?.name || 'un negocio local argentino'}.

PERSONALIDAD:
- Tono: Amigable y profesional
- Estilo: Argentino, cercano pero respetuoso
- Objetivo: Ayudar al cliente y generar ventas

CONTEXTO DEL NEGOCIO:
- Nombre: ${businessProfile?.name || 'Negocio Local'}
- Industria: ${businessProfile?.industry || 'General'}
- Ubicación: ${businessProfile?.location || 'Argentina'}

MENSAJE DEL CLIENTE: "${message}"
INTENCIÓN DETECTADA: ${intent.primary}
SENTIMIENTO: ${intent.sentiment > 0.3 ? 'Positivo' : intent.sentiment < -0.3 ? 'Negativo' : 'Neutral'}

HISTORIAL RECIENTE:
${context.history?.slice(-3).map(msg => `${msg.from === context.customerId ? 'Cliente' : 'Negocio'}: ${msg.content}`).join('\\n') || 'Primera interacción'}

INSTRUCCIONES:
1. Responde de manera natural y amigable
2. Usa expresiones argentinas cuando sea apropiado
3. Si es una consulta de producto/precio, ofrece información específica
4. Si es un pedido, guía al cliente paso a paso
5. Si es una queja, muestra empatía y ofrece soluciones
6. Siempre busca cerrar la venta o agendar una acción
7. Mantén el mensaje corto (máximo 2-3 oraciones)

RESPONDE COMO EL ASISTENTE DEL NEGOCIO:
`;
  }
  
  private cleanConversationalResponse(response: string): string {
    return response
      .trim()
      .replace(/^(Asistente|Negocio|Respuesta):\s*/i, '')
      .replace(/\n+/g, ' ')
      .substring(0, 500); // Limitar longitud
  }
  
  private getFallbackResponse(intent: MessageIntent): string {
    const fallbackResponses = {
      greeting: '¡Hola! ¿Cómo puedo ayudarte hoy?',
      product_inquiry: 'Te ayudo con información sobre nuestros productos. ¿Qué te interesa?',
      price_inquiry: 'Claro, te paso los precios. ¿De qué producto específicamente?',
      order_placement: '¡Perfecto! Te ayudo a armar tu pedido. ¿Qué te gustaría?',
      complaint: 'Entiendo tu preocupación. Vamos a solucionarlo juntos. ¿Me contás más detalles?',
      compliment: '¡Muchas gracias! Nos alegra saber que estás contento con nuestro servicio.',
      support_request: 'Por supuesto, te ayudo. ¿Cuál es tu consulta?',
      information_request: 'Te ayudo con la información que necesites. ¿Qué querés saber?'
    };
    
    return fallbackResponses[intent.primary] || '¡Hola! ¿Cómo puedo ayudarte?';
  }
  
  // ==========================================================================
  // GENERACIÓN DE CONTENIDO
  // ==========================================================================
  
  /**
   * Genera contenido para redes sociales
   */
  async generateContent(request: ContentRequest, businessProfile?: BusinessProfile): Promise<string> {
    const prompt = this.buildContentGenerationPrompt(request, businessProfile);
    
    try {
      const response = await this.generateCompletion(prompt, {
        maxTokens: 800,
        temperature: 0.9
      });
      
      return this.cleanContentResponse(response, request);
      
    } catch (error) {
      this.logger.error('❌ Failed to generate content:', error);
      return this.getFallbackContent(request);
    }
  }
  
  private buildContentGenerationPrompt(request: ContentRequest, businessProfile?: BusinessProfile): string {
    return `
Eres un Community Manager experto especializado en negocios argentinos.

NEGOCIO:
- Nombre: ${businessProfile?.name || 'Negocio Local'}
- Industria: ${businessProfile?.industry || 'General'}
- Público: ${businessProfile?.targetAudience || 'Público general'}
- Ubicación: ${businessProfile?.location || 'Argentina'}

SOLICITUD DE CONTENIDO:
- Tipo: ${request.type}
- Plataforma: ${request.platform}
- Objetivo: ${request.objective}
- Tema: ${request.topic || 'General'}
- Tono: ${request.constraints?.style || 'Amigable y profesional'}

PRODUCTOS/SERVICIOS MENCIONADOS:
${request.products?.join(', ') || 'Productos/servicios del negocio'}

INSTRUCCIONES:
1. Crea contenido específico para ${request.platform}
2. Usa un tono ${request.constraints?.style || 'amigable'} y apropiado para Argentina
3. Incluye call-to-action efectivo
4. Optimiza para ${request.objective}
5. ${request.type === 'story' ? 'Contenido corto y visual' : request.type === 'post' ? 'Contenido atractivo con hashtags' : 'Contenido apropiado para el formato'}

${request.constraints?.maxLength ? `LÍMITE: Máximo ${request.constraints.maxLength} caracteres` : ''}

ELEMENTOS OBLIGATORIOS:
${request.constraints?.mustInclude?.map(item => `- ${item}`).join('\\n') || '- Call to action relevante'}

EVITAR:
${request.constraints?.mustAvoid?.map(item => `- ${item}`).join('\\n') || '- Lenguaje demasiado técnico'}

GENERA EL CONTENIDO:
`;
  }
  
  private cleanContentResponse(response: string, request: ContentRequest): string {
    let cleaned = response.trim();
    
    // Aplicar límites de longitud si están especificados
    if (request.constraints?.maxLength) {
      cleaned = cleaned.substring(0, request.constraints.maxLength);
    }
    
    // Agregar hashtags si no los tiene y es para redes sociales
    if (['instagram', 'facebook', 'tiktok'].includes(request.platform) && !cleaned.includes('#')) {
      cleaned += this.generateHashtags(request);
    }
    
    return cleaned;
  }
  
  private generateHashtags(request: ContentRequest): string {
    const commonHashtags = {
      food: ' #comida #delivery #argentina',
      retail: ' #tienda #ofertas #argentina',
      services: ' #servicios #calidad #argentina',
      beauty: ' #belleza #cuidado #argentina'
    };
    
    return commonHashtags[request.topic as keyof typeof commonHashtags] || ' #negocio #calidad #argentina';
  }
  
  private getFallbackContent(request: ContentRequest): string {
    const fallbackContent = {
      post: '¡Conocé nuestros productos! Calidad y atención personalizada. 📞 Contactanos para más info. #negocio #calidad',
      story: '¡Nuevo producto disponible! 🔥 Escribinos por WhatsApp',
      reel: 'Así trabajamos nosotros 💪 ¡Te esperamos!',
      carousel: 'Descubrí todo lo que tenemos para ofrecerte 👆'
    };
    
    return fallbackContent[request.type as keyof typeof fallbackContent] || fallbackContent.post;
  }
  
  // ==========================================================================
  // ANÁLISIS DE SENTIMIENTO
  // ==========================================================================
  
  /**
   * Analiza el sentimiento de un texto
   */
  async analyzeSentiment(text: string): Promise<{ score: number; label: string; confidence: number }> {
    const prompt = `
Analiza el sentimiento del siguiente texto en español argentino:

"${text}"

Responde en JSON con:
{
  "score": -1.0 a 1.0 (negativo a positivo),
  "label": "positivo" | "neutral" | "negativo",
  "confidence": 0.0 a 1.0
}
`;
    
    try {
      const response = await this.generateCompletion(prompt, {
        maxTokens: 200,
        temperature: 0.3,
        responseFormat: 'json'
      });
      
      return JSON.parse(response);
      
    } catch (error) {
      this.logger.error('❌ Failed to analyze sentiment:', error);
      
      // Fallback simple
      const score = this.analyzeSentimentFallback(text);
      return {
        score,
        label: score > 0.1 ? 'positivo' : score < -0.1 ? 'negativo' : 'neutral',
        confidence: 0.5
      };
    }
  }
  
  private analyzeSentimentFallback(text: string): number {
    const positiveWords = ['bien', 'bueno', 'excelente', 'genial', 'perfecto', 'gracias', 'contento'];
    const negativeWords = ['mal', 'malo', 'terrible', 'problema', 'error', 'queja', 'molesto'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.some(pw => word.includes(pw))) score += 0.2;
      if (negativeWords.some(nw => word.includes(nw))) score -= 0.2;
    }
    
    return Math.max(-1, Math.min(1, score));
  }
  
  // ==========================================================================
  // UTILIDADES PRIVADAS
  // ==========================================================================
  
  private selectBestModel(): keyof typeof this.models {
    // Priorizar Claude > GPT > Gemini
    if (this.models.claude.available) return 'claude';
    if (this.models.openai.available) return 'openai';
    if (this.models.gemini.available) return 'gemini';
    
    throw new Error('No LLM models available');
  }
  
  private selectFallbackModel(): keyof typeof this.models {
    const available = Object.entries(this.models)
      .filter(([name, config]) => config.available && name !== this.primaryModel)
      .map(([name]) => name);
    
    return available[0] as keyof typeof this.models || this.primaryModel;
  }
  
  private async generateCompletion(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      responseFormat?: 'text' | 'json';
    } = {}
  ): Promise<string> {
    try {
      // Intentar con modelo primario
      return await this.callModel(this.primaryModel, prompt, options);
    } catch (error) {
      this.logger.warn(`⚠️ Primary model ${this.primaryModel} failed, trying fallback`);
      
      try {
        // Intentar con modelo fallback
        return await this.callModel(this.fallbackModel, prompt, options);
      } catch (fallbackError) {
        this.logger.error(`❌ Both models failed:`, { primary: error, fallback: fallbackError });
        throw new Error(`All LLM models failed: ${error.message}`);
      }
    }
  }
  
  private async callModel(
    modelName: keyof typeof this.models,
    prompt: string,
    options: any = {}
  ): Promise<string> {
    const model = this.models[modelName];
    
    switch (modelName) {
      case 'claude':
        return await this.callClaude(prompt, options);
      case 'openai':
        return await this.callOpenAI(prompt, options);
      case 'gemini':
        return await this.callGemini(prompt, options);
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  }
  
  private async callClaude(prompt: string, options: any): Promise<string> {
    // Implementar llamada a Claude API
    // Por ahora, respuesta simulada
    this.logger.info('🤖 Calling Claude model (simulated)');
    return 'Respuesta simulada de Claude';
  }
  
  private async callOpenAI(prompt: string, options: any): Promise<string> {
    // Implementar llamada a OpenAI API
    this.logger.info('🤖 Calling OpenAI model (simulated)');
    return 'Respuesta simulada de OpenAI';
  }
  
  private async callGemini(prompt: string, options: any): Promise<string> {
    // Implementar llamada a Gemini API
    this.logger.info('🤖 Calling Gemini model (simulated)');
    return 'Respuesta simulada de Gemini';
  }
}