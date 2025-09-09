import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { isRateLimited } from '../utils/validation';

interface UseValidatedFormOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: Partial<T>;
  rateLimitKey?: string;
  rateLimitMax?: number;
}

export const useValidatedForm = <T extends Record<string, any>>({
  schema,
  onSubmit,
  defaultValues,
  rateLimitKey,
  rateLimitMax = 5
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
      await onSubmit(data);
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