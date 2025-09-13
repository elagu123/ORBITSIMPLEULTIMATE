const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { GoogleGenAI, Type, Modality } = require('@google/genai');
const authRoutes = require('./auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Headers - Enhanced Configuration
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: isProduction 
        ? ["'self'"] 
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", isProduction ? "" : "http:"].filter(Boolean),
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://api.anthropic.com", "https://firebase.googleapis.com"],
      mediaSrc: ["'self'", "blob:", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      ...(isProduction && { upgradeInsecureRequests: [] }),
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some external resources
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: isProduction ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hidePoweredBy: true,
  permittedCrossDomainPolicies: false,
  dnsPrefetchControl: { allow: false },
  expectCt: isProduction ? {
    maxAge: 86400,
    enforce: true
  } : false
}));

// Additional security middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security for HTTPS
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy for privacy
  res.setHeader('Permissions-Policy', 
    'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), ' +
    'cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), ' +
    'execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), ' +
    'geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), ' +
    'midi=(), navigation-override=(), payment=(), picture-in-picture=(), ' +
    'publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), ' +
    'web-share=(), xr-spatial-tracking=()');
  
  next();
});

// HTTPS redirect middleware for production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5179', 'http://localhost:5180'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google AI
let geminiClient = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.error('🚨 GEMINI_API_KEY environment variable not set!');
}

// Middleware to check if AI is configured
const requireAI = (req, res, next) => {
  if (!geminiClient) {
    return res.status(500).json({ 
      error: 'AI service not configured', 
      message: 'GEMINI_API_KEY is required' 
    });
  }
  req.ai = geminiClient;
  next();
};

// Authentication routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Orbit AI Backend Server', 
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      ai: '/api/ai/*'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiConfigured: !!geminiClient
  });
});

// Generic AI generation endpoint
app.post('/api/ai/generate', requireAI, async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.5-flash', config = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`🤖 AI Request: ${model} - ${prompt.substring(0, 100)}...`);
    
    const response = await req.ai.models.generateContent({
      model,
      contents: prompt,
      config
    });

    res.json({ 
      success: true, 
      text: response.text,
      response: response
    });
  } catch (error) {
    console.error('❌ AI Generation Error:', error);
    res.status(500).json({ 
      error: 'AI generation failed', 
      message: error.message 
    });
  }
});

// Structured AI generation with JSON schema
app.post('/api/ai/generate-structured', requireAI, async (req, res) => {
  try {
    const { 
      prompt, 
      model = 'gemini-2.5-flash', 
      responseSchema,
      responseMimeType = 'application/json',
      tools = []
    } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`🤖 Structured AI Request: ${model}`);
    
    const config = {
      responseMimeType,
      ...(responseSchema && { responseSchema }),
      ...(tools.length > 0 && { tools })
    };

    const response = await req.ai.models.generateContent({
      model,
      contents: prompt,
      config
    });

    const result = responseMimeType === 'application/json' 
      ? JSON.parse(response.text.trim())
      : response.text;

    res.json({ 
      success: true, 
      result,
      rawText: response.text
    });
  } catch (error) {
    console.error('❌ Structured AI Generation Error:', error);
    res.status(500).json({ 
      error: 'Structured AI generation failed', 
      message: error.message 
    });
  }
});

// Image analysis endpoint
app.post('/api/ai/analyze-image', requireAI, async (req, res) => {
  try {
    const { imageData, mimeType, prompt, model = 'gemini-2.5-flash' } = req.body;
    
    if (!imageData || !prompt) {
      return res.status(400).json({ error: 'Image data and prompt are required' });
    }

    console.log(`🤖 Image Analysis Request: ${model}`);
    
    const imagePart = { inlineData: { mimeType, data: imageData } };
    
    const response = await req.ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] }
    });

    res.json({ 
      success: true, 
      text: response.text 
    });
  } catch (error) {
    console.error('❌ Image Analysis Error:', error);
    res.status(500).json({ 
      error: 'Image analysis failed', 
      message: error.message 
    });
  }
});

// Specific endpoints for common operations
app.post('/api/ai/magic-onboarding', requireAI, async (req, res) => {
  try {
    const { businessName, industry } = req.body;
    
    if (!businessName || !industry) {
      return res.status(400).json({ error: 'businessName and industry are required' });
    }

    console.log(`🚀 Magic Onboarding: ${businessName} - ${industry}`);
    
    const prompt = `
      You are a "Magic Onboarding" AI for a marketing application called Orbit MKT. Your task is to take a business name and industry and automatically generate a complete, plausible, and well-structured business profile. This pre-fills the setup for the user, creating a "wow" experience.

      User's Input:
      - Business Name: "${businessName}"
      - Industry: "${industry}"

      Instructions:
      Based on the name and industry, generate a comprehensive BusinessProfile.
      1.  **marketingGoals**: Infer the most likely goals. For a new restaurant, it would be "increaseSales" and "buildBrandAwareness".
      2.  **brandVoice**: Infer a suitable tone and invent 2-3 relevant brand values.
      3.  **aiStrategy**: This is the most important part. Create a detailed strategy:
          -   **brandVoiceSpectrums**: Set the sliders (0.0 to 1.0) to match the inferred brand voice.
          -   **brandArchetype**: Choose the most fitting archetype.
          -   **keyTerminology**: Invent a few words to use and avoid.
          -   **targetAudience**: Describe a plausible target audience and their key pain points.
          -   **seoGuidelines**: Suggest 2-3 primary and secondary keywords.

      Your entire response MUST be a single, valid JSON object matching the BusinessProfile type definition provided in the schema. Do not add any other text or markdown.
    `;
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        businessName: { type: Type.STRING },
        industry: { type: Type.STRING },
        marketingGoals: {
          type: Type.OBJECT,
          properties: {
            increaseSales: { type: Type.BOOLEAN },
            buildBrandAwareness: { type: Type.BOOLEAN },
            customerRetention: { type: Type.BOOLEAN },
            leadGeneration: { type: Type.BOOLEAN },
          },
          required: ["increaseSales", "buildBrandAwareness", "customerRetention", "leadGeneration"]
        },
        brandVoice: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING },
            values: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["tone", "values"]
        },
        aiStrategy: {
          type: Type.OBJECT,
          properties: {
            brandVoiceSpectrums: {
              type: Type.OBJECT,
              properties: {
                formalVsCasual: { type: Type.NUMBER },
                seriousVsHumorous: { type: Type.NUMBER },
                calmVsEnthusiastic: { type: Type.NUMBER },
              },
              required: ["formalVsCasual", "seriousVsHumorous", "calmVsEnthusiastic"]
            },
            brandArchetype: { type: Type.STRING },
            keyTerminology: {
              type: Type.OBJECT,
              properties: {
                wordsToUse: { type: Type.ARRAY, items: { type: Type.STRING } },
                wordsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["wordsToUse", "wordsToAvoid"]
            },
            targetAudience: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                painPoints: { type: Type.STRING },
              },
              required: ["description", "painPoints"]
            },
            seoGuidelines: {
              type: Type.OBJECT,
              properties: {
                primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["primaryKeywords", "secondaryKeywords"]
            }
          },
          required: ["brandVoiceSpectrums", "brandArchetype", "keyTerminology", "targetAudience", "seoGuidelines"]
        }
      },
      required: ["businessName", "industry", "marketingGoals", "brandVoice", "aiStrategy"]
    };

    const response = await req.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema
      }
    });
    
    const result = JSON.parse(response.text.trim());
    // Ensure the name/industry are set
    result.businessName = businessName;
    result.industry = industry;
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Magic Onboarding Error:', error);
    res.status(500).json({ 
      error: 'Magic onboarding failed', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// 404 handler  
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Video download proxy endpoint for security
app.post('/api/download-video', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('🎥 Proxying video download:', videoUrl.substring(0, 50) + '...');
    
    // Add API key to the URL securely on the backend
    const secureUrl = process.env.GEMINI_API_KEY 
      ? `${videoUrl}&key=${process.env.GEMINI_API_KEY}`
      : videoUrl;
    
    const response = await fetch(secureUrl);
    
    if (!response.ok) {
      throw new Error(`Video fetch failed: ${response.status}`);
    }
    
    // Stream the video data directly to the client
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="generated-video.mp4"'
    });
    
    response.body.pipe(res);
    
  } catch (error) {
    console.error('❌ Video download error:', error);
    res.status(500).json({ 
      error: 'Failed to download video',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Orbit AI Backend Server running on port ${PORT}`);
  console.log(`🔧 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🤖 AI Configured: ${geminiClient ? '✅ Yes' : '❌ No'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;