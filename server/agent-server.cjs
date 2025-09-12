// =============================================================================
// ORBIT AI AGENT - VERSIÓN SIMPLE PARA TESTING
// =============================================================================

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    agent: 'Orbit AI Agent (Simple Version)',
    timestamp: new Date().toISOString(),
    version: '1.0.0-simple'
  });
});

// Chat endpoint
app.post('/agent/chat', async (req, res) => {
  try {
    const { message, businessId = 'default', userId = 'anonymous' } = req.body;
    
    console.log(`📨 Chat message from ${userId}: ${message}`);
    
    // Respuesta simulada inteligente
    const responses = [
      `¡Hola! Soy tu asistente de marketing IA. Entiendo que quieres: "${message}". Te puedo ayudar con estrategias de contenido, análisis de audiencia y campañas automatizadas.`,
      `Excelente pregunta sobre "${message}". Basado en las tendencias actuales, te recomiendo enfocar en contenido visual y storytelling auténtico.`,
      `He analizado tu solicitud: "${message}". Mi recomendación es crear una campaña multi-plataforma que combine Instagram, Facebook y email marketing.`,
      `Interesante consulta sobre "${message}". Como agente IA especializado en marketing, sugiero implementar una estrategia de contenido generativo con análisis de performance en tiempo real.`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
      response: randomResponse,
      timestamp: new Date().toISOString(),
      sessionId: `session_${Date.now()}`,
      suggestions: [
        'Generar contenido para Instagram',
        'Analizar competencia',
        'Crear campaña de email',
        'Optimizar performance'
      ]
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Content generation endpoint
app.post('/agent/content/generate', async (req, res) => {
  try {
    const { type = 'post', platform = 'instagram', audience, businessProfile } = req.body;
    
    console.log(`🎨 Generating ${type} for ${platform}`);
    
    const content = {
      id: `content_${Date.now()}`,
      type,
      platform,
      title: `${businessProfile?.name || 'Tu Marca'} - Contenido ${type} para ${platform}`,
      content: `🚀 ¡Descubre lo increíble que ${businessProfile?.name || 'tu negocio'} tiene para ofrecerte!\n\n✨ Conectamos contigo de manera auténtica\n💡 Innovación que transforma experiencias\n🎯 Resultados que superan expectativas\n\n#Marketing #${platform} #Innovación #${businessProfile?.industry || 'Negocios'}`,
      hashtags: ['#Marketing', '#DigitalStrategy', '#Innovation', `#${platform}`, '#Business'],
      imageUrl: `https://via.placeholder.com/1080x1080/0066cc/ffffff?text=${encodeURIComponent(businessProfile?.name || 'Content')}`,
      performance_prediction: {
        engagement_rate: Math.floor(Math.random() * 15) + 5,
        reach_estimate: Math.floor(Math.random() * 5000) + 1000,
        best_time: '6:00 PM - 8:00 PM'
      },
      created_at: new Date().toISOString()
    };
    
    res.json(content);
    
  } catch (error) {
    console.error('❌ Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Recommendations endpoint
app.post('/agent/recommendations', async (req, res) => {
  try {
    const { businessProfile, metrics } = req.body;
    
    console.log(`💡 Generating recommendations for ${businessProfile?.name || 'business'}`);
    
    const recommendations = {
      strategic_recommendations: [
        {
          title: 'Optimizar Horarios de Publicación',
          description: 'Basado en el análisis de tu audiencia, publica entre 6-8 PM para máximo engagement',
          priority: 'high',
          impact: 'increase_engagement',
          implementation: 'immediate'
        },
        {
          title: 'Diversificar Contenido Visual',
          description: 'Incluir más videos cortos y carruseles aumentará tu alcance orgánico en un 40%',
          priority: 'medium',
          impact: 'increase_reach',
          implementation: 'this_week'
        },
        {
          title: 'Implementar User Generated Content',
          description: 'Incentiva a tus clientes a compartir experiencias con tu marca usando hashtags específicos',
          priority: 'medium',
          impact: 'build_community',
          implementation: 'this_month'
        }
      ],
      content_suggestions: [
        'Behind-the-scenes de tu proceso de trabajo',
        'Testimonios de clientes satisfechos',
        'Tips y consejos relacionados con tu industria',
        'Preguntas interactivas en Stories'
      ],
      performance_insights: {
        best_performing_content: 'Posts con imágenes de productos',
        growth_trend: '+15% en las últimas 2 semanas',
        engagement_peak: '6:00 PM - 8:00 PM',
        top_hashtags: ['#Marketing', '#Innovation', '#Business']
      },
      next_actions: [
        'Crear 5 posts para la próxima semana',
        'Configurar stories automatizadas',
        'Analizar competencia directa',
        'Optimizar bio de Instagram'
      ]
    };
    
    res.json(recommendations);
    
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Status endpoint
app.get('/agent/status', (req, res) => {
  res.json({
    status: 'active',
    version: '1.0.0-simple',
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    features: {
      chat: 'active',
      content_generation: 'active',
      recommendations: 'active',
      analytics: 'simulated'
    },
    integrations: {
      whatsapp: 'simulated',
      instagram: 'simulated',
      facebook: 'simulated',
      email: 'simulated'
    }
  });
});

// Execute action endpoint
app.post('/agent/execute', async (req, res) => {
  try {
    const { action, params } = req.body;
    
    console.log(`🔄 Executing action: ${action}`);
    
    const mockResults = {
      'send_whatsapp': `WhatsApp message sent successfully to ${params?.to || 'contact'}`,
      'publish_content': `Content published to ${params?.platform || 'Instagram'} successfully`,
      'analyze_performance': 'Performance analysis completed. Results look promising!',
      'schedule_post': `Post scheduled for ${params?.schedule || 'tomorrow'} successfully`,
      'generate_report': 'Comprehensive report generated and ready for download'
    };
    
    const result = mockResults[action] || `Action ${action} executed successfully`;
    
    res.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
      execution_id: `exec_${Date.now()}`
    });
    
  } catch (error) {
    console.error('❌ Action execution error:', error);
    res.status(500).json({ error: 'Failed to execute action' });
  }
});

// WebSocket simulation endpoint
app.get('/agent/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send periodic updates
  const interval = setInterval(() => {
    const events = [
      'New Instagram engagement detected',
      'WhatsApp message processed',
      'Content performance update available',
      'Recommendation engine updated',
      'Analytics data refreshed'
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    res.write(`data: ${JSON.stringify({
      type: 'agent_update',
      message: event,
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 10000);
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log('🤖 =====================================');
  console.log('🚀 ORBIT AI AGENT - SIMPLE VERSION');
  console.log('🤖 =====================================');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/agent/chat`);
  console.log(`🎨 Content gen: POST http://localhost:${PORT}/agent/content/generate`);
  console.log(`💡 Recommendations: POST http://localhost:${PORT}/agent/recommendations`);
  console.log('✅ Agent ready for connections!');
  console.log('🤖 =====================================');
});