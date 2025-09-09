import { z } from 'zod';

// ===================================================================
// VALIDATION SCHEMAS - Security-focused validation rules
// ===================================================================

// Common field validations
const emailSchema = z.string()
  .email('Por favor ingresa un email válido')
  .min(1, 'Email es requerido')
  .max(100, 'Email demasiado largo')
  .transform((email) => email.toLowerCase().trim());

const passwordSchema = z.string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100, 'Contraseña demasiado larga')
  .refine((password) => password.length >= 6, {
    message: 'Contraseña muy débil'
  });

const nameSchema = z.string()
  .min(1, 'Nombre es requerido')
  .max(50, 'Nombre demasiado largo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo se permiten letras y espacios')
  .transform((name) => name.trim());

const businessNameSchema = z.string()
  .min(1, 'Nombre del negocio es requerido')
  .max(100, 'Nombre demasiado largo')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s&.-]+$/, 'Caracteres no válidos en nombre del negocio')
  .transform((name) => name.trim());

const phoneSchema = z.string()
  .regex(/^[+]?[0-9\s()-]+$/, 'Formato de teléfono no válido')
  .min(10, 'Teléfono muy corto')
  .max(20, 'Teléfono muy largo')
  .optional()
  .or(z.literal(''));

const urlSchema = z.string()
  .url('URL no válida')
  .max(200, 'URL demasiado larga')
  .optional()
  .or(z.literal(''));

// Text content validation (for posts, messages, etc.)
const shortTextSchema = z.string()
  .min(1, 'Este campo es requerido')
  .max(280, 'Texto demasiado largo (máximo 280 caracteres)')
  .transform((text) => text.trim());

const longTextSchema = z.string()
  .min(1, 'Este campo es requerido')
  .max(2000, 'Texto demasiado largo (máximo 2000 caracteres)')
  .transform((text) => text.trim());

// Sanitization helpers
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// ===================================================================
// FORM SCHEMAS
// ===================================================================

// Authentication
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña es requerida')
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Onboarding
export const businessProfileSchema = z.object({
  businessName: businessNameSchema,
  industry: z.string().min(1, 'Industria es requerida'),
  email: emailSchema.optional(),
  phone: phoneSchema,
  website: urlSchema
});

export const magicOnboardingSchema = z.object({
  businessName: businessNameSchema,
  industry: z.enum([
    'restaurant', 'retail', 'services', 'healthcare', 'education', 
    'technology', 'real_estate', 'fitness', 'beauty', 'other'
  ], {
    errorMap: () => ({ message: 'Selecciona una industria válida' })
  })
});

// Customer management
export const customerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(500, 'Notas muy largas').optional().or(z.literal(''))
});

// Content creation
export const contentSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(100, 'Título muy largo'),
  content: longTextSchema,
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'all'], {
    errorMap: () => ({ message: 'Selecciona una plataforma válida' })
  }),
  scheduledDate: z.string().optional(),
  tags: z.array(z.string().max(30)).max(10, 'Máximo 10 tags').optional()
});

// AI prompts (security-focused)
export const aiPromptSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt es requerido')
    .max(1000, 'Prompt muy largo')
    .refine((prompt) => {
      // Block potentially malicious prompts
      const dangerousPatterns = [
        /system\s*:/i,
        /ignore\s+previous/i,
        /forget\s+everything/i,
        /<script/i,
        /javascript:/i,
        /data:/i,
        /vbscript:/i
      ];
      return !dangerousPatterns.some(pattern => pattern.test(prompt));
    }, {
      message: 'Prompt contiene contenido no permitido'
    })
    .transform(sanitizeInput)
});

// Calendar events
export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(100, 'Título muy largo'),
  description: z.string().max(500, 'Descripción muy larga').optional().or(z.literal('')),
  date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate >= new Date();
  }, {
    message: 'Fecha debe ser futura y válida'
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
});

// Campaign creation
export const campaignSchema = z.object({
  name: z.string().min(1, 'Nombre de campaña requerido').max(100, 'Nombre muy largo'),
  objective: z.string().min(1, 'Objetivo requerido').max(200, 'Objetivo muy largo'),
  budget: z.number().min(0, 'Presupuesto debe ser positivo').max(1000000, 'Presupuesto muy alto'),
  startDate: z.string().refine((date) => new Date(date) >= new Date(), {
    message: 'Fecha de inicio debe ser futura'
  }),
  endDate: z.string()
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'Fecha de fin debe ser posterior a la de inicio',
  path: ['endDate']
});

// ===================================================================
// TYPE EXPORTS
// ===================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;
export type MagicOnboardingFormData = z.infer<typeof magicOnboardingSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type ContentFormData = z.infer<typeof contentSchema>;
export type AIPromptFormData = z.infer<typeof aiPromptSchema>;
export type CalendarEventFormData = z.infer<typeof calendarEventSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;

// ===================================================================
// VALIDATION HELPER FUNCTIONS
// ===================================================================

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => err.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Error de validación desconocido'] 
    };
  }
};

// Rate limiting for sensitive operations
export const isRateLimited = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  
  // Clean old requests
  const validRequests = requests.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validRequests));
  
  return false;
};