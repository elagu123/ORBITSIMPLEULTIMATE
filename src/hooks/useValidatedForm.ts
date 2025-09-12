import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { isRateLimited, sanitizeInput } from '../utils/validation';
import DOMPurify from 'dompurify';

interface UseValidatedFormOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: Partial<T>;
  rateLimitKey?: string;
  rateLimitMax?: number;
  sanitize?: boolean; // Enable/disable automatic sanitization
}

export const useValidatedForm = <T extends Record<string, any>>({
  schema,
  onSubmit,
  defaultValues,
  rateLimitKey,
  rateLimitMax = 5,
  sanitize = true
}: UseValidatedFormOptions<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validate on change for better UX
  });

  const handleSubmit = form.handleSubmit(async (data: T) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Rate limiting check
    if (rateLimitKey && isRateLimited(rateLimitKey, rateLimitMax)) {
      setSubmitError('Demasiados intentos. Intenta de nuevo en unos minutos.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sanitize data if enabled
      let processedData = data;
      if (sanitize) {
        processedData = sanitizeFormData(data);
      }
      
      // Validate sanitized data against schema
      const validatedData = schema.parse(processedData);
      
      await onSubmit(validatedData);
      setSubmitSuccess(true);
      form.reset(defaultValues); // Reset form on success
    } catch (error) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Ha ocurrido un error. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const clearMessages = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  return {
    form,
    handleSubmit,
    isSubmitting,
    submitError,
    submitSuccess,
    clearMessages,
    // Convenience methods
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    formState: form.formState,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
};

// Sanitization function for form data
const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      // Apply different sanitization based on field name/type
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = value.toLowerCase().trim();
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
        sanitized[key] = sanitizeURL(value);
      } else if (key.toLowerCase().includes('html') || key.toLowerCase().includes('content')) {
        sanitized[key] = sanitizeHTML(value);
      } else {
        sanitized[key] = sanitizeInput(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    }
  });
  
  return sanitized;
};

// URL sanitization
const sanitizeURL = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
    return parsedUrl.toString();
  } catch {
    return '';
  }
};

// HTML sanitization
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
};

// Helper hook for field-level validation feedback
export const useFieldError = (fieldName: string, errors: any) => {
  const error = errors[fieldName];
  
  return {
    hasError: !!error,
    errorMessage: error?.message || '',
    fieldProps: {
      'aria-invalid': !!error,
      'aria-describedby': error ? `${fieldName}-error` : undefined,
    }
  };
};

// Security validation hook
export const useSecurityValidation = (data: Record<string, any>) => {
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  
  const validateSecurity = () => {
    const warnings: string[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Check for potential XSS
        if (/<script|javascript:|vbscript:/i.test(value)) {
          warnings.push(`Campo ${key} contiene código potencialmente peligroso`);
        }
        
        // Check for SQL injection patterns
        if (/['";]|(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE)/gi.test(value)) {
          warnings.push(`Campo ${key} contiene patrones sospechosos`);
        }
        
        // Check for file uploads with dangerous extensions
        if (key.toLowerCase().includes('file') && /\.(exe|bat|cmd|scr|pif|com|js|jar)$/i.test(value)) {
          warnings.push(`Campo ${key} contiene un tipo de archivo no permitido`);
        }
      }
    });
    
    setSecurityWarnings(warnings);
    return warnings.length === 0;
  };
  
  return {
    securityWarnings,
    validateSecurity,
    isSecure: securityWarnings.length === 0
  };
};