import { z } from 'zod';

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

// Email validation with custom error messages
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .refine(
    (email) => !email.includes('+') || email.includes('@'),
    'Invalid email format'
  );

// Password validation with security requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Name validation (sanitized)
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and dots')
  .transform((str) => str.trim().replace(/\s+/g, ' ')); // Remove extra whitespace

// Phone validation
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .transform((str) => str.replace(/\D/g, '')); // Remove non-digits

// URL validation
const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    (url) => {
      try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    },
    'URL must use HTTP or HTTPS protocol'
  );

// Business name validation
const businessNameSchema = z
  .string()
  .min(1, 'Business name is required')
  .max(100, 'Business name is too long')
  .regex(/^[a-zA-Z0-9\s\-&.,!]+$/, 'Business name contains invalid characters')
  .transform((str) => str.trim().replace(/\s+/g, ' '));

// Content validation (for user-generated content)
const contentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(5000, 'Content is too long')
  .transform((str) => str.trim());

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'), // Less strict for login
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"]
});

export const resetPasswordSchema = z.object({
  email: emailSchema
});

// =============================================================================
// BUSINESS PROFILE SCHEMAS
// =============================================================================

export const businessProfileSchema = z.object({
  businessName: businessNameSchema,
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().max(1000, 'Description is too long').optional(),
  website: urlSchema.optional(),
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: z.object({
    street: z.string().max(200, 'Street address is too long').optional(),
    city: z.string().max(100, 'City name is too long').optional(),
    state: z.string().max(100, 'State name is too long').optional(),
    zipCode: z.string().max(20, 'ZIP code is too long').optional(),
    country: z.string().max(100, 'Country name is too long').optional()
  }).optional()
});

// =============================================================================
// CONTENT CREATION SCHEMAS
// =============================================================================

export const contentCreationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .transform((str) => str.trim()),
  content: contentSchema,
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'], {
    errorMap: () => ({ message: 'Please select a valid platform' })
  }),
  scheduledDate: z.date().optional(),
  tags: z.array(z.string().max(50, 'Tag is too long')).max(10, 'Too many tags').optional(),
  isPublic: z.boolean().default(true)
});

// =============================================================================
// CUSTOMER DATA SCHEMAS
// =============================================================================

export const customerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'Company name is too long').optional(),
  notes: z.string().max(2000, 'Notes are too long').optional(),
  tags: z.array(z.string().max(30, 'Tag is too long')).max(20, 'Too many tags').optional(),
  status: z.enum(['lead', 'prospect', 'customer', 'inactive'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }).default('lead')
});

// =============================================================================
// CAMPAIGN SCHEMAS
// =============================================================================

export const campaignSchema = z.object({
  name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name is too long')
    .transform((str) => str.trim()),
  description: z.string().max(1000, 'Description is too long').optional(),
  budget: z.number()
    .min(0, 'Budget cannot be negative')
    .max(1000000, 'Budget is too large')
    .optional(),
  startDate: z.date(),
  endDate: z.date(),
  platforms: z.array(z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'tiktok']))
    .min(1, 'At least one platform is required')
    .max(6, 'Too many platforms selected'),
  targetAudience: z.object({
    ageMin: z.number().min(13, 'Minimum age is 13').max(100, 'Maximum age is 100').optional(),
    ageMax: z.number().min(13, 'Minimum age is 13').max(100, 'Maximum age is 100').optional(),
    gender: z.enum(['all', 'male', 'female', 'other']).default('all'),
    interests: z.array(z.string().max(50, 'Interest is too long')).max(20, 'Too many interests').optional()
  }).optional()
}).refine((data) => !data.targetAudience?.ageMin || !data.targetAudience?.ageMax || data.targetAudience.ageMin <= data.targetAudience.ageMax, {
  message: "Minimum age cannot be greater than maximum age",
  path: ["targetAudience", "ageMin"]
}).refine((data) => data.startDate <= data.endDate, {
  message: "Start date cannot be after end date",
  path: ["endDate"]
});

// =============================================================================
// AI PROMPT SCHEMAS (Security critical)
// =============================================================================

export const aiPromptSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(8000, 'Prompt is too long')
    .refine(
      (prompt) => !/<script|javascript:|data:|vbscript:/i.test(prompt),
      'Prompt contains potentially dangerous content'
    )
    .refine(
      (prompt) => !/\b(api[_\s]?key|password|token|secret|credential)\b/i.test(prompt),
      'Prompt should not contain sensitive information'
    )
    .transform((str) => str.trim()),
  context: z.string().max(2000, 'Context is too long').optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal', 'creative'], {
    errorMap: () => ({ message: 'Please select a valid tone' })
  }).optional(),
  length: z.enum(['short', 'medium', 'long'], {
    errorMap: () => ({ message: 'Please select a valid length' })
  }).optional()
});

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, GIF, and WebP files are allowed'
    ),
  alt: z.string().max(200, 'Alt text is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional()
});

// =============================================================================
// SETTINGS SCHEMAS
// =============================================================================

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt']).default('en'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false)
  }).default({}),
  timezone: z.string().max(50, 'Timezone is too long').optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']).default('USD')
});

// =============================================================================
// WEBHOOK SCHEMAS (For integrations)
// =============================================================================

export const webhookSchema = z.object({
  url: urlSchema,
  events: z.array(z.enum([
    'user.created', 'user.updated', 'campaign.started', 'campaign.completed',
    'content.published', 'customer.added', 'order.placed'
  ])).min(1, 'At least one event is required'),
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters').optional(),
  isActive: z.boolean().default(true)
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;
export type ContentCreationFormData = z.infer<typeof contentCreationSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;
export type AIPromptFormData = z.infer<typeof aiPromptSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;
export type WebhookFormData = z.infer<typeof webhookSchema>;