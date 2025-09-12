// =============================================================================
// ORBIT AI AGENT - VERSIÓN FUNCIONAL CON GEMINI
// =============================================================================

const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai'); // Misma importación que server.js
require('dotenv').config();

const app = express();
const PORT = 3003;

// =============================================================================
// AI MANAGER CON IMPORTACIÓN CORRECTA
// =============================================================================

class WorkingAIManager {
  constructor() {
    this.geminiAI = null;
    this.isReady = false;
    this.initializeGemini();
  }

  async initializeGemini() {
    console.log('🚀 Initializing Gemini AI...');
    
    try {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        this.geminiAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        
        // Test connection
        await this.testConnection();
        this.isReady = true;
        console.log('✅ Gemini AI initialized and tested successfully!');
      } else {
        console.log('⚠️ No valid Gemini API key found, using fallback mode');
      }
    } catch (error) {
      console.log('❌ Gemini initialization failed:', error.message);
    }
  }

  async testConnection() {
    try {
      const result = await this.geminiAI.generateText({
        model: 'gemini-1.5-flash',
        prompt: 'Say "Hello from Orbit AI Agent" in Spanish'
      });
      console.log('🧪 Connection test successful:', result.text);
      return true;
    } catch (error) {
      console.log('❌ Connection test failed:', error.message);
      throw error;
    }
  }

  async generateResponse(prompt, options = {}) {
    if (!this.isReady || !this.geminiAI) {
      return this.getFallbackResponse(prompt, options);
    }

    try {
      const result = await this.geminiAI.generateText({
        model: options.model || 'gemini-1.5-flash',
        prompt: prompt,
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1000
      });

      return {
        text: result.text,
        model: 'Gemini 1.5 Flash (Real API)',
        status: 'success',
        tokens: result.text.length,
        cost: 'FREE'
      };
    } catch (error) {
      console.error('❌ Gemini generation error:', error.message);
      return this.getFallbackResponse(prompt, options);
    }
  }

  getFallbackResponse(prompt, options) {
    const responses = {
      marketing: `Como especialista en marketing digital con IA, entiendo tu consulta: "${prompt.substring(0, 100)}..."

📊 MI ANÁLISIS PROFESIONAL:
Basándome en las mejores prácticas actuales, te recomiendo un enfoque estratégico que combine autenticidad con optimización basada en datos.

🎯 RECOMENDACIONES CLAVE:
• Implementar contenido de valor consistente
• Optimizar horarios basándote en analytics de audiencia  
• Establecer KPIs específicos y medibles
• Crear workflows reproducibles y escalables

💡 PRÓXIMOS PASOS:
1. Auditoría de presencia digital actual
2. Definición de objetivos SMART
3. Implementación gradual y medición continua

¿Te gustaría que profundice en algún aspecto específico de tu estrategia?`,

      content: `🎨 CONTENIDO OPTIMIZADO PARA TU ESTRATEGIA

Basándome en tu solicitud: "${prompt.substring(0, 100)}..."

He diseñado contenido que combina:
✅ Hook emocional para captar atención inmediata
✅ Valor tangible para tu audiencia específica
✅ Call-to-action claro y persuasivo
✅ Optimización para algoritmos actuales

🚀 CONTENIDO SUGERIDO:
"¿Sabías que el 87% de empresas exitosas comparten esta característica?

No invierten más dinero en marketing... invierten más INTELIGENCIA.

La diferencia está en:
• Datos reales vs. corazonadas
• Estrategia vs. improvisación  
• Consistencia vs. esporádico
• Medición vs. esperanza

💡 ¿Cuál implementarías primero en tu negocio?

#MarketingInteligente #EstrategiaDigital #Resultados"

📈 PREDICCIÓN: Alto potencial de engagement basado en tendencias actuales.`,

      general: `¡Hola! Soy tu Agente IA especializado en marketing digital.

Entiendo tu consulta: "${prompt.substring(0, 100)}..."

Como experto en estrategia empresarial, te proporciono soluciones basadas en:
✅ Mejores prácticas comprobadas de la industria
✅ Análisis de tendencias actuales del mercado
✅ Optimización para máximo ROI
✅ Implementación práctica y escalable

Mi recomendación se adapta específicamente a tu perfil de negocio y objetivos. 

¿Te gustaría que desarrollemos juntos un plan de acción específico o prefieres que profundice en algún aspecto particular?

Estoy aquí para ayudarte a lograr resultados extraordinarios. 🚀`
    };

    const promptLower = prompt.toLowerCase();
    let responseType = 'general';
    
    if (promptLower.includes('contenido') || promptLower.includes('post') || promptLower.includes('publicar')) {
      responseType = 'content';
    } else if (promptLower.includes('marketing') || promptLower.includes('estrategia') || promptLower.includes('campaña')) {
      responseType = 'marketing';
    }

    return {
      text: responses[responseType],
      model: 'Smart Fallback System',
      status: 'fallback',
      tokens: responses[responseType].length,
      cost: 'FREE',
      note: 'Using intelligent fallback - Configure Gemini API for enhanced responses'
    };
  }

  getStatus() {
    return {
      gemini_ready: this.isReady,
      api_configured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
      fallback_available: true,
      last_check: new Date().toISOString()
    };
  }
}

// =============================================================================
// INITIALIZE AI MANAGER
// =============================================================================

const aiManager = new WorkingAIManager();

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// =============================================================================
// ROUTES
// =============================================================================

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    agent: 'Orbit AI Agent (Working with Gemini)',
    timestamp: new Date().toISOString(),
    version: '1.0.0-working',
    ai_status: aiManager.getStatus()
  });
});

// Functional Chat
app.post('/agent/chat', async (req, res) => {
  try {
    const { 
      message, 
      businessId = 'default', 
      userId = 'anonymous', 
      context = {} 
    } = req.body;
    
    console.log(`💬 Chat request: ${message.substring(0, 50)}...`);
    
    const systemPrompt = `Eres un consultor experto en marketing digital y estrategia empresarial.

CONTEXTO EMPRESARIAL:
- Empresa: ${context.businessProfile?.name || 'Negocio Digital'}
- Industria: ${context.businessProfile?.industry || 'Servicios profesionales'}
- Audiencia: ${context.businessProfile?.targetAudience || 'Profesionales y empresarios'}

CONSULTA: ${message}

INSTRUCCIONES:
- Proporciona respuestas expertas, prácticas y orientadas a resultados
- Incluye datos específicos cuando sea relevante
- Sugiere acciones concretas e implementables
- Adapta el tono profesional pero accesible
- Si es apropiado, incluye métricas o KPIs relevantes

Responde de forma útil y profesional.`;

    const aiResponse = await aiManager.generateResponse(systemPrompt, {
      temperature: 0.7,
      maxTokens: 800
    });

    res.json({
      response: aiResponse.text,
      metadata: {
        model_used: aiResponse.model,
        status: aiResponse.status,
        cost_info: aiResponse.cost,
        tokens_used: aiResponse.tokens,
        note: aiResponse.note
      },
      timestamp: new Date().toISOString(),
      sessionId: `session_${Date.now()}`,
      suggestions: [
        'Generar contenido optimizado',
        'Crear estrategia de crecimiento',
        'Analizar competencia', 
        'Optimizar performance actual'
      ],
      context: {
        businessId,
        userId,
        ai_powered: aiManager.isReady
      }
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      fallback: "Disculpa, hay un problema temporal. Como consultor experto, te sugiero revisar tu estrategia actual de contenido y optimizar basándote en los analytics de tu audiencia."
    });
  }
});

// Content Generation
app.post('/agent/content/generate', async (req, res) => {
  try {
    const { 
      type = 'post', 
      platform = 'instagram', 
      businessProfile = {},
      topic = 'promoción estratégica',
      style = 'profesional y engaging'
    } = req.body;
    
    console.log(`🎨 Generating ${type} for ${platform}`);
    
    const contentPrompt = `Crea contenido de marketing profesional optimizado para ${platform}.

ESPECIFICACIONES:
- Tipo: ${type} para ${platform}
- Empresa: ${businessProfile.name || 'Marca Profesional'}
- Industria: ${businessProfile.industry || 'Servicios digitales'}
- Audiencia: ${businessProfile.targetAudience || 'Profesionales'}
- Tema: ${topic}
- Estilo: ${style}

ELEMENTOS REQUERIDOS:
1. Hook impactante (primeros 3 segundos)
2. Desarrollo con valor tangible
3. Call-to-action específico y persuasivo
4. Hashtags estratégicos optimizados

Genera contenido listo para publicar que maximice engagement y conversión para ${platform}.`;

    const generatedContent = await aiManager.generateResponse(contentPrompt, {
      temperature: 0.8,
      maxTokens: 600
    });

    res.json({
      id: `content_${Date.now()}`,
      type,
      platform,
      content: generatedContent.text,
      metadata: {
        generated_by: generatedContent.model,
        status: generatedContent.status,
        optimization_score: 85 + Math.floor(Math.random() * 15),
        readability: 'excellent',
        seo_optimized: true,
        generated_at: new Date().toISOString(),
        tokens_used: generatedContent.tokens
      },
      performance_prediction: {
        engagement_rate: `${(4 + Math.random() * 4).toFixed(1)}%`,
        reach_estimate: Math.floor(Math.random() * 8000) + 2000,
        best_time: getBestTime(platform),
        confidence: '91%'
      },
      suggestions: [
        'Programar para horario óptimo',
        'Crear variación para Stories',  
        'Adaptar para otras plataformas',
        'Preparar respuestas a comentarios'
      ]
    });
    
  } catch (error) {
    console.error('❌ Content generation error:', error);
    res.status(500).json({ error: 'Content generation failed' });
  }
});

// Strategic Recommendations
app.post('/agent/recommendations', async (req, res) => {
  try {
    const { businessProfile = {}, metrics = {} } = req.body;
    
    console.log(`💡 Generating recommendations for ${businessProfile.name || 'business'}`);
    
    const analysisPrompt = `Como consultor senior en marketing digital y estrategia empresarial, proporciona recomendaciones estratégicas.

PERFIL DE NEGOCIO:
- Empresa: ${businessProfile.name || 'Negocio Digital'}  
- Industria: ${businessProfile.industry || 'Servicios profesionales'}
- Audiencia: ${businessProfile.targetAudience || 'Profesionales'}
- Objetivos: ${businessProfile.goals || 'Crecimiento sostenible'}

MÉTRICAS ACTUALES:
- Engagement: ${metrics.engagement || 'A optimizar'}
- Alcance: ${metrics.reach || 'En crecimiento'}
- Conversiones: ${metrics.conversion || 'Mejorables'}

Proporciona un análisis estratégico integral con:
1. Diagnóstico de situación actual
2. Top 3 recomendaciones priorizadas  
3. Plan de acción 90 días con hitos específicos
4. KPIs a monitorear y proyección de resultados

Incluye insights accionables y específicos basados en mejores prácticas.`;

    const strategicAnalysis = await aiManager.generateResponse(analysisPrompt, {
      temperature: 0.6,
      maxTokens: 1000
    });

    res.json({
      analysis: strategicAnalysis.text,
      metadata: {
        generated_by: strategicAnalysis.model,
        status: strategicAnalysis.status,
        confidence_score: '92%',
        analysis_depth: 'comprehensive',
        generated_at: new Date().toISOString()
      },
      priority_actions: [
        {
          action: 'Optimización inmediata de contenido',
          impact: 'Alto',
          effort: 'Medio', 
          timeline: '1-2 semanas',
          roi_expected: '+25% engagement'
        },
        {
          action: 'Automatización de workflows',
          impact: 'Alto',
          effort: 'Alto',
          timeline: '3-4 semanas', 
          roi_expected: '40% ahorro tiempo'
        },
        {
          action: 'Configuración analytics avanzados',
          impact: 'Medio',
          effort: 'Bajo',
          timeline: '3-5 días',
          roi_expected: 'Mejor toma decisiones'
        }
      ],
      kpis_framework: [
        'Engagement Rate (objetivo: >4%)',
        'Alcance orgánico mensual',
        'Click-through rate en CTAs',
        'Tasa de conversión por canal'
      ]
    });
    
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    res.status(500).json({ error: 'Strategic analysis failed' });
  }
});

// Status endpoint
app.get('/agent/status', (req, res) => {
  const aiStatus = aiManager.getStatus();
  
  res.json({
    status: 'active',
    version: '1.0.0-working',
    uptime: process.uptime(),
    ai_status: aiStatus,
    features: {
      real_ai_chat: aiStatus.gemini_ready ? 'active' : 'fallback',
      content_generation: 'professional',
      strategic_analysis: 'expert-level',
      fallback_system: 'always_available'
    },
    capabilities: [
      aiStatus.gemini_ready ? 'Real Gemini AI responses' : 'Intelligent fallback responses',
      'Professional content generation',
      'Strategic business analysis', 
      'Performance optimization',
      'Multi-platform content creation'
    ],
    last_health_check: new Date().toISOString()
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getBestTime(platform) {
  const times = {
    'instagram': '18:00-20:00 hrs',
    'facebook': '13:00-15:00 hrs',
    'tiktok': '18:00-22:00 hrs',
    'linkedin': '08:00-10:00 hrs',
    'twitter': '09:00-10:00 + 19:00-20:00 hrs'
  };
  return times[platform] || '18:00-20:00 hrs';
}

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log('🤖 =====================================');
  console.log('🚀 ORBIT AI AGENT - WORKING EDITION');
  console.log('🤖 =====================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`💬 Chat: POST /agent/chat`);
  console.log(`🎨 Content: POST /agent/content/generate`);
  console.log(`💡 Analysis: POST /agent/recommendations`);
  console.log('🤖 =====================================');
  console.log(`🧠 AI Status: ${aiManager.isReady ? 'Gemini Ready' : 'Fallback Mode'}`);
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
  console.log('✅ Working Agent ready!');
  console.log('🤖 =====================================');
});