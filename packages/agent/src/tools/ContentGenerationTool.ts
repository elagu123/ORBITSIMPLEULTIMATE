// =============================================================================
// ORBIT AI AGENT - CONTENT GENERATION TOOL
// =============================================================================

import { 
  ContentRequest, 
  GeneratedContent, 
  BusinessProfile,
  ContentType,
  ContentPlatform 
} from '../types/index.js';
import { Logger } from '../utils/Logger.js';

/**
 * 🎨 HERRAMIENTA DE GENERACIÓN DE CONTENIDO
 * 
 * Especializada en crear contenido para marketing:
 * - Posts para redes sociales
 * - Stories de Instagram/Facebook
 * - Reels y videos cortos
 * - Carruseles informativos
 * - Newsletters
 * - Contenido promocional
 */
export class ContentGenerationTool {
  private readonly logger: Logger;
  
  // Templates y patrones por industria
  private readonly industryTemplates = {
    food: {
      hashtags: ['#comida', '#delivery', '#casero', '#fresco', '#sabor'],
      tones: ['delicioso', 'casero', 'fresco', 'tentador'],
      ctas: ['¡Pedí ahora!', '¡Te esperamos!', 'Hacé tu pedido', '¡Probalo hoy!']
    },
    retail: {
      hashtags: ['#moda', '#estilo', '#ofertas', '#nuevacoleccion', '#tendencia'],
      tones: ['moderno', 'elegante', 'trendy', 'único'],
      ctas: ['¡Compralo ya!', 'Últimas unidades', '¡No te lo pierdas!', 'Ver más']
    },
    services: {
      hashtags: ['#servicios', '#profesional', '#calidad', '#confianza', '#experiencia'],
      tones: ['profesional', 'confiable', 'experto', 'personalizado'],
      ctas: ['Contactanos', 'Consultá gratis', 'Solicitar info', 'Agendar cita']
    },
    beauty: {
      hashtags: ['#belleza', '#cuidado', '#natural', '#bienestar', '#autoestima'],
      tones: ['natural', 'radiante', 'cuidado', 'mimado'],
      ctas: ['Reservá turno', 'Cuidate', 'Transformate', 'Te esperamos']
    }
  };
  
  constructor() {
    this.logger = new Logger('ContentGenerationTool');
  }
  
  async initialize(): Promise<void> {
    this.logger.info('🔄 Initializing content generation tool...');
    // No requiere inicialización especial
    this.logger.info('✅ Content generation tool ready');
  }
  
  // ==========================================================================
  // GENERACIÓN DE CONTENIDO PRINCIPAL
  // ==========================================================================
  
  /**
   * Genera contenido basado en la solicitud y perfil del negocio
   */
  async generateContent(
    request: ContentRequest, 
    businessProfile?: BusinessProfile
  ): Promise<GeneratedContent> {
    this.logger.info(`🎨 Generating ${request.type} for ${request.platform}`);
    
    try {
      // Seleccionar generador específico según tipo
      const content = await this.generateByType(request, businessProfile);
      
      // Crear metadata del contenido
      const metadata = {
        generatedAt: new Date(),
        model: 'orbit-content-generator',
        tokens: this.estimateTokens(content.body),
        confidence: 0.85,
        businessId: businessProfile?.id || 'unknown',
        campaign: request.topic
      };
      
      const generatedContent: GeneratedContent = {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: request.type,
        platform: request.platform,
        content,
        metadata
      };
      
      this.logger.info(`✅ Content generated: ${request.type} (${content.body.length} chars)`);
      return generatedContent;
      
    } catch (error) {
      this.logger.error('❌ Failed to generate content:', error);
      throw error;
    }
  }
  
  private async generateByType(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    switch (request.type) {
      case 'post':
        return await this.generatePost(request, businessProfile);
      case 'story':
        return await this.generateStory(request, businessProfile);
      case 'reel':
        return await this.generateReel(request, businessProfile);
      case 'carousel':
        return await this.generateCarousel(request, businessProfile);
      case 'newsletter':
        return await this.generateNewsletter(request, businessProfile);
      case 'ad':
        return await this.generateAd(request, businessProfile);
      default:
        return await this.generatePost(request, businessProfile);
    }
  }
  
  // ==========================================================================
  // GENERADORES ESPECÍFICOS POR TIPO
  // ==========================================================================
  
  private async generatePost(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    const industry = businessProfile?.industry || 'retail';
    const templates = this.industryTemplates[industry as keyof typeof this.industryTemplates] || this.industryTemplates.retail;
    
    // Generar contenido base
    let body = '';
    
    if (request.topic) {
      body = await this.generateTopicPost(request.topic, request, businessProfile);
    } else if (request.products && request.products.length > 0) {
      body = await this.generateProductPost(request.products, request, businessProfile);
    } else {
      body = await this.generateGenericPost(request, businessProfile);
    }
    
    // Agregar call-to-action
    const cta = this.selectRandomItem(templates.ctas);
    body += `\\n\\n${cta}`;
    
    // Generar hashtags
    const hashtags = this.generateHashtags(industry, request.topic, request.platform);
    
    // Generar prompt para imagen
    const imagePrompt = this.generateImagePrompt(request, businessProfile);
    
    return {
      title: this.generateTitle(request, businessProfile),
      body,
      hashtags,
      cta,
      imagePrompt
    };
  }
  
  private async generateStory(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    // Stories son más cortas y visuales
    const industry = businessProfile?.industry || 'retail';
    const templates = this.industryTemplates[industry as keyof typeof this.industryTemplates] || this.industryTemplates.retail;
    
    const shortMessages = [
      '¡Nuevo producto disponible! 🔥',
      '¿Ya viste esto? 👆',
      '¡Oferta especial hoy! ⚡',
      'Detrás de escena 📸',
      '¡Te esperamos! 💖'
    ];
    
    const body = this.selectRandomItem(shortMessages);
    const cta = this.selectRandomItem(templates.ctas);
    
    return {
      body: `${body}\\n\\n${cta}`,
      imagePrompt: `Instagram story design for ${businessProfile?.name || 'local business'}, ${request.topic || 'general content'}, vibrant colors, mobile-friendly`,
      cta,
      duration: 15 // segundos
    };
  }
  
  private async generateReel(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    const industry = businessProfile?.industry || 'retail';
    
    const reelIdeas = {
      food: [
        'Proceso de preparación paso a paso',
        'Antes y después de la cocción',
        'Ingredientes frescos del día',
        'Cliente disfrutando el producto'
      ],
      retail: [
        'Unboxing del producto',
        'Diferentes formas de usar el producto',
        'Comparación con competencia',
        'Cliente satisfecho con la compra'
      ],
      services: [
        'Proceso de trabajo profesional',
        'Transformación antes/después',
        'Equipo trabajando en proyecto',
        'Cliente feliz con resultado'
      ],
      beauty: [
        'Transformación antes/después',
        'Proceso de tratamiento',
        'Productos utilizados',
        'Cliente radiante al final'
      ]
    };
    
    const ideas = reelIdeas[industry as keyof typeof reelIdeas] || reelIdeas.retail;
    const concept = this.selectRandomItem(ideas);
    
    const script = await this.generateReelScript(concept, request, businessProfile);
    
    return {
      body: script.text,
      concept,
      script: script.scenes,
      duration: 30, // segundos
      music: script.musicSuggestion,
      imagePrompt: `Vertical video thumbnail for ${concept}, ${businessProfile?.name}, engaging and eye-catching`
    };
  }
  
  private async generateCarousel(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    // Carrusel típicamente tiene 3-5 slides
    const slides = [];
    const slideCount = Math.floor(Math.random() * 3) + 3; // 3-5 slides
    
    // Primer slide - gancho
    slides.push({
      title: '¿Sabías que...?',
      content: await this.generateSlideContent('hook', request, businessProfile),
      imagePrompt: `Instagram carousel slide 1, attention-grabbing hook, ${businessProfile?.name}`
    });
    
    // Slides intermedios - contenido
    for (let i = 1; i < slideCount - 1; i++) {
      slides.push({
        title: `Punto ${i}`,
        content: await this.generateSlideContent('content', request, businessProfile),
        imagePrompt: `Instagram carousel slide ${i + 1}, informative content, clean design`
      });
    }
    
    // Último slide - CTA
    slides.push({
      title: '¡Actuá ahora!',
      content: await this.generateSlideContent('cta', request, businessProfile),
      imagePrompt: `Instagram carousel final slide, call to action, ${businessProfile?.name}`
    });
    
    return {
      body: slides.map(slide => slide.content).join('\\n\\n'),
      slides,
      totalSlides: slides.length,
      hashtags: this.generateHashtags(businessProfile?.industry || 'retail', request.topic, 'instagram')
    };
  }
  
  private async generateNewsletter(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    const sections = [
      await this.generateNewsletterIntro(businessProfile),
      await this.generateNewsletterContent(request, businessProfile),
      await this.generateNewsletterPromo(businessProfile),
      await this.generateNewsletterClosing(businessProfile)
    ];
    
    return {
      subject: `Newsletter ${businessProfile?.name || 'Negocio'} - ${request.topic || 'Novedades'}`,
      body: sections.join('\\n\\n'),
      sections,
      htmlVersion: this.generateNewsletterHTML(sections, businessProfile)
    };
  }
  
  private async generateAd(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    const industry = businessProfile?.industry || 'retail';
    const templates = this.industryTemplates[industry as keyof typeof this.industryTemplates] || this.industryTemplates.retail;
    
    // Ads necesitan ser más directos y persuasivos
    const headline = await this.generateAdHeadline(request, businessProfile);
    const description = await this.generateAdDescription(request, businessProfile);
    const cta = this.selectRandomItem(templates.ctas);
    
    return {
      headline,
      body: `${description}\\n\\n${cta}`,
      cta,
      targetAudience: this.defineTargetAudience(businessProfile),
      imagePrompt: `Facebook/Instagram ad creative, ${headline}, ${businessProfile?.name}, professional and converting`
    };
  }
  
  // ==========================================================================
  // GENERADORES DE CONTENIDO ESPECÍFICO
  // ==========================================================================
  
  private async generateTopicPost(
    topic: string,
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    const businessName = businessProfile?.name || 'nuestro negocio';
    const industry = businessProfile?.industry || 'retail';
    
    const topicTemplates = {
      'oferta especial': `🔥 ¡OFERTA ESPECIAL! 🔥\\n\\nEn ${businessName} tenemos una promoción increíble para vos.\\n\\n¿Te la vas a perder?`,
      'producto nuevo': `✨ ¡NOVEDAD! ✨\\n\\n¿Ya viste lo último que llegó a ${businessName}?\\n\\nTe va a encantar.`,
      'fin de semana': `🎉 ¡FINDE ESPECIAL! 🎉\\n\\nArranca el fin de semana con lo mejor de ${businessName}.\\n\\n¡Te esperamos!`,
      'testimonial': `💬 Esto nos dijo uno de nuestros clientes:\\n\\n"El servicio de ${businessName} es increíble"\\n\\n¡Gracias por confiar en nosotros!`,
      'detras de escena': `👀 DETRÁS DE ESCENA\\n\\nAsí trabajamos en ${businessName} para darte siempre lo mejor.\\n\\n¡Mirá cómo lo hacemos!`
    };
    
    // Buscar template que coincida o usar genérico
    for (const [key, template] of Object.entries(topicTemplates)) {
      if (topic.toLowerCase().includes(key)) {
        return template;
      }
    }
    
    // Template genérico basado en el tópico
    return `En ${businessName} sabemos de ${topic}.\\n\\nTe contamos todo lo que necesitás saber.\\n\\n¡Seguí leyendo! 👇`;
  }
  
  private async generateProductPost(
    products: string[],
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    const businessName = businessProfile?.name || 'nuestro negocio';
    const product = products[0]; // Usar el primer producto
    
    const productTemplates = [
      `🌟 ¿Conocés ${product}? 🌟\\n\\nEn ${businessName} te ofrecemos la mejor calidad.\\n\\n¡Vení a probarlo!`,
      `✨ DESTACADO ✨\\n\\n${product} es uno de nuestros favoritos en ${businessName}.\\n\\n¿Ya lo probaste?`,
      `💎 RECOMENDADO 💎\\n\\nSi buscás ${product}, en ${businessName} tenemos lo mejor.\\n\\n¡Te esperamos!`,
      `🔥 LO MÁS PEDIDO 🔥\\n\\n${product} es el favorito de nuestros clientes en ${businessName}.\\n\\n¡Descubrí por qué!`
    ];
    
    return this.selectRandomItem(productTemplates);
  }
  
  private async generateGenericPost(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    const businessName = businessProfile?.name || 'nuestro negocio';
    const industry = businessProfile?.industry || 'retail';
    
    const genericTemplates = {
      food: [
        `🍽️ En ${businessName} cada plato es una experiencia.\\n\\n¿Ya probaste nuestras especialidades?`,
        `👨‍🍳 Cocinamos con amor en ${businessName}.\\n\\nVení a disfrutar de sabores únicos.`,
        `🥘 La calidad que buscás está en ${businessName}.\\n\\n¡Te esperamos con el menú del día!`
      ],
      retail: [
        `🛍️ En ${businessName} encontrás todo lo que buscás.\\n\\n¡Vení a descubrir nuestras novedades!`,
        `✨ Calidad y estilo se encuentran en ${businessName}.\\n\\n¿Ya viste nuestra nueva colección?`,
        `🎯 Lo que necesitás está en ${businessName}.\\n\\n¡Visitanos y sorprendete!`
      ],
      services: [
        `🏆 En ${businessName} somos especialistas.\\n\\n¿Necesitás ayuda con tu proyecto?`,
        `💪 La experiencia que buscás está en ${businessName}.\\n\\n¡Contactanos para una consulta!`,
        `⭐ Calidad y profesionalismo definen a ${businessName}.\\n\\n¡Dejanos ayudarte!`
      ],
      beauty: [
        `💅 En ${businessName} realzamos tu belleza natural.\\n\\n¿Ya reservaste tu turno?`,
        `✨ Cuidamos tu bienestar en ${businessName}.\\n\\n¡Vení a mimarte un poco!`,
        `🌸 Tu mejor versión te espera en ${businessName}.\\n\\n¡Reservá tu cita hoy!`
      ]
    };
    
    const templates = genericTemplates[industry as keyof typeof genericTemplates] || genericTemplates.retail;
    return this.selectRandomItem(templates);
  }
  
  // ==========================================================================
  // GENERADORES DE ELEMENTOS ESPECÍFICOS
  // ==========================================================================
  
  private generateHashtags(
    industry: string = 'retail', 
    topic?: string, 
    platform: ContentPlatform = 'instagram'
  ): string[] {
    const industryTags = this.industryTemplates[industry as keyof typeof this.industryTemplates]?.hashtags || [];
    const genericTags = ['#argentina', '#calidad', '#negociolocal', '#atencionpersonalizada'];
    const platformTags = {
      instagram: ['#instagram', '#ig', '#insta'],
      facebook: ['#facebook', '#fb'],
      tiktok: ['#tiktok', '#fyp', '#viral']
    };
    
    let hashtags = [...industryTags];
    
    // Agregar tags específicos del tópico
    if (topic) {
      const topicWords = topic.toLowerCase().split(' ');
      topicWords.forEach(word => {
        if (word.length > 3) {
          hashtags.push(`#${word}`);
        }
      });
    }
    
    // Agregar tags genéricos
    hashtags = hashtags.concat(genericTags.slice(0, 2));
    
    // Agregar tags de plataforma
    hashtags = hashtags.concat(platformTags[platform]?.slice(0, 1) || []);
    
    // Limitar cantidad según plataforma
    const maxTags = platform === 'instagram' ? 8 : platform === 'facebook' ? 5 : 3;
    return hashtags.slice(0, maxTags);
  }
  
  private generateImagePrompt(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): string {
    const businessName = businessProfile?.name || 'local business';
    const industry = businessProfile?.industry || 'retail';
    const location = businessProfile?.location || 'Argentina';
    
    const basePrompt = `Professional ${industry} business photo for ${businessName} in ${location}`;
    
    let specificElements = '';
    switch (request.type) {
      case 'post':
        specificElements = ', high-quality product photography, clean background, marketing style';
        break;
      case 'story':
        specificElements = ', vertical format 9:16, mobile-friendly, vibrant colors';
        break;
      case 'ad':
        specificElements = ', advertising photography, conversion-focused, professional lighting';
        break;
      default:
        specificElements = ', social media ready, engaging composition';
    }
    
    if (request.topic) {
      specificElements += `, ${request.topic} theme`;
    }
    
    return basePrompt + specificElements;
  }
  
  // ==========================================================================
  // UTILIDADES Y VARIACIONES
  // ==========================================================================
  
  /**
   * Genera variaciones de contenido existente
   */
  async generateVariations(originalContent: string, count: number = 3): Promise<string[]> {
    this.logger.info(`🔄 Generating ${count} variations of content`);
    
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const variation = await this.createVariation(originalContent, i);
      variations.push(variation);
    }
    
    return variations;
  }
  
  private async createVariation(originalContent: string, index: number): Promise<string> {
    // Variaciones simples por ahora
    const variationStrategies = [
      'Cambiar el tono a más casual',
      'Hacer más directo y comercial',
      'Agregar más emoción y entusiasmo',
      'Enfoque en beneficios del cliente'
    ];
    
    // En producción, usar LLM para generar variaciones reales
    const strategy = variationStrategies[index % variationStrategies.length];
    
    // Por ahora, variación simple
    return `[Variación ${index + 1} - ${strategy}]\\n\\n${originalContent}`;
  }
  
  /**
   * Optimiza contenido para SEO
   */
  async optimizeForSEO(content: string, keywords: string[]): Promise<string> {
    this.logger.info(`🔍 Optimizing content for SEO with keywords: ${keywords.join(', ')}`);
    
    let optimizedContent = content;
    
    // Insertar keywords naturalmente
    keywords.forEach((keyword, index) => {
      if (index === 0 && !content.toLowerCase().includes(keyword.toLowerCase())) {
        // Agregar keyword principal al inicio
        optimizedContent = `${keyword}: ${optimizedContent}`;
      }
    });
    
    return optimizedContent;
  }
  
  // ==========================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ==========================================================================
  
  private selectRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
  
  private estimateTokens(text: string): number {
    // Estimación simple: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }
  
  private generateTitle(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): string {
    if (request.topic) return request.topic;
    if (request.products && request.products.length > 0) return request.products[0];
    return `Contenido ${businessProfile?.name || 'Negocio'}`;
  }
  
  private async generateReelScript(
    concept: string,
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<any> {
    const scenes = [
      { time: '0-5s', action: 'Hook visual llamativo', text: '¿Sabías que...?' },
      { time: '5-15s', action: 'Desarrollo del concepto', text: 'Te mostramos cómo...' },
      { time: '15-25s', action: 'Revelación/resultado', text: '¡Mirá el resultado!' },
      { time: '25-30s', action: 'Call to action', text: '¡Seguinos para más!' }
    ];
    
    return {
      scenes,
      text: scenes.map(scene => scene.text).join(' '),
      musicSuggestion: 'Música upbeat y moderna'
    };
  }
  
  private async generateSlideContent(
    type: 'hook' | 'content' | 'cta',
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    const businessName = businessProfile?.name || 'nuestro negocio';
    
    switch (type) {
      case 'hook':
        return `¡Atención! En ${businessName} tenemos algo increíble para contarte...`;
      case 'content':
        return `Por eso en ${businessName} siempre buscamos darte la mejor experiencia.`;
      case 'cta':
        return `¿Qué esperás? ¡Contactanos ahora y descubrí todo lo que ${businessName} tiene para vos!`;
    }
  }
  
  private async generateNewsletterIntro(businessProfile?: BusinessProfile): Promise<string> {
    return `¡Hola! Soy ${businessProfile?.name || 'el equipo'} y te traigo las novedades más importantes de esta semana.`;
  }
  
  private async generateNewsletterContent(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    return `Esta semana queremos contarte sobre ${request.topic || 'nuestras novedades'}. Es algo que sabemos que te va a interesar muchísimo.`;
  }
  
  private async generateNewsletterPromo(businessProfile?: BusinessProfile): Promise<string> {
    return `🎉 OFERTA ESPECIAL para suscriptores del newsletter: ¡Aprovechá esta oportunidad única!`;
  }
  
  private async generateNewsletterClosing(businessProfile?: BusinessProfile): Promise<string> {
    return `Gracias por ser parte de la comunidad de ${businessProfile?.name || 'nuestro negocio'}. ¡Nos vemos la próxima semana!`;
  }
  
  private generateNewsletterHTML(sections: string[], businessProfile?: BusinessProfile): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Newsletter ${businessProfile?.name || 'Negocio'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0066cc;">${businessProfile?.name || 'Newsletter'}</h1>
    ${sections.map(section => `<p>${section}</p>`).join('')}
  </div>
</body>
</html>
    `.trim();
  }
  
  private async generateAdHeadline(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    const headlines = [
      `¡Descubrí lo mejor de ${businessProfile?.name || 'nuestro negocio'}!`,
      `${request.topic || 'Ofertas especiales'} en ${businessProfile?.name || 'tu negocio favorito'}`,
      `¿Buscás calidad? ¡Encontrala en ${businessProfile?.name || 'nosotros'}!`
    ];
    
    return this.selectRandomItem(headlines);
  }
  
  private async generateAdDescription(
    request: ContentRequest,
    businessProfile?: BusinessProfile
  ): Promise<string> {
    return `No busques más. En ${businessProfile?.name || 'nuestro negocio'} tenemos exactamente lo que necesitás con la mejor calidad y atención personalizada.`;
  }
  
  private defineTargetAudience(businessProfile?: BusinessProfile): any {
    return {
      age: '25-45',
      interests: [businessProfile?.industry || 'retail', 'local business', 'quality products'],
      location: businessProfile?.location || 'Argentina',
      behavior: 'Active on social media, values quality and personal service'
    };
  }
}