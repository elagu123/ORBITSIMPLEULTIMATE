import React from 'react';
import { useFieldError } from '../../hooks/useValidatedForm';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  errors: any;
  register: any;
  required?: boolean;
  helperText?: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  name,
  label,
  errors,
  register,
  required = false,
  helperText,
  className = '',
  ...props
}) => {
  const { hasError, errorMessage, fieldProps } = useFieldError(name, errors);

  const baseClasses = "w-full px-4 py-2 mt-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 transition-colors";
  const normalClasses = "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20";

  return (
    <div className="space-y-1">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        {...register(name)}
        {...fieldProps}
        {...props}
        className={`${baseClasses} ${hasError ? errorClasses : normalClasses} ${className}`}
      />
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </p>
      )}
      
      {helperText && !hasError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  errors: any;
  register: any;
  required?: boolean;
  helperText?: string;
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  name,
  label,
  errors,
  register,
  required = false,
  helperText,
  className = '',
  ...props
}) => {
  const { hasError, errorMessage, fieldProps } = useFieldError(name, errors);

  const baseClasses = "w-full px-4 py-2 mt-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 transition-colors resize-vertical";
  const normalClasses = "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20";

  return (
    <div className="space-y-1">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={name}
        {...register(name)}
        {...fieldProps}
        {...props}
        className={`${baseClasses} ${hasError ? errorClasses : normalClasses} ${className}`}
      />
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </p>
      )}
      
      {helperText && !hasError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  errors: any;
  register: any;
  required?: boolean;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  name,
  label,
  errors,
  register,
  required = false,
  helperText,
  options,
  placeholder = 'Seleccionar...',
  className = '',
  ...props
}) => {
  const { hasError, errorMessage, fieldProps } = useFieldError(name, errors);

  const baseClasses = "w-full px-4 py-2 mt-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 transition-colors";
  const normalClasses = "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20";

  return (
    <div className="space-y-1">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={name}
        {...register(name)}
        {...fieldProps}
        {...props}
        className={`${baseClasses} ${hasError ? errorClasses : normalClasses} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </p>
      )}
      
      {helperText && !hasError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};