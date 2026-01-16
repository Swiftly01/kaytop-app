'use client';

import { ReactNode } from 'react';

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorsDisplayProps {
  errors: ValidationError[];
  className?: string;
}

export function ValidationErrorsDisplay({ errors, className = '' }: ValidationErrorsDisplayProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errors.length === 1 ? 'Validation Error' : 'Validation Errors'}
          </h3>
          
          {errors.length === 1 ? (
            <p className="mt-1 text-sm text-red-700">
              {errors[0].message}
            </p>
          ) : (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={`${error.field}-${index}`}>
                  <span className="font-medium">{error.field}:</span> {error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Field-level validation error component
interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <p className={`text-sm text-red-600 mt-1 flex items-center ${className}`}>
      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      {error}
    </p>
  );
}

// Validation utilities
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED'
    };
  }
  return null;
}

export function validateEmail(email: string, fieldName: string = 'Email'): ValidationError | null {
  if (!email) {
    return validateRequired(email, fieldName);
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: fieldName,
      message: 'Please enter a valid email address',
      code: 'INVALID_EMAIL'
    };
  }
  
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationError | null {
  if (!value) {
    return validateRequired(value, fieldName);
  }
  
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters long`,
      code: 'MIN_LENGTH'
    };
  }
  
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationError | null {
  if (value && value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${maxLength} characters long`,
      code: 'MAX_LENGTH'
    };
  }
  
  return null;
}

export function validateNumericRange(value: number, min: number, max: number, fieldName: string): ValidationError | null {
  if (isNaN(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`,
      code: 'INVALID_NUMBER'
    };
  }
  
  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be between ${min} and ${max}`,
      code: 'OUT_OF_RANGE'
    };
  }
  
  return null;
}

export function validateFileSize(file: File, maxSizeBytes: number, fieldName: string = 'File'): ValidationError | null {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      field: fieldName,
      message: `File size must be less than ${maxSizeMB}MB`,
      code: 'FILE_TOO_LARGE'
    };
  }
  
  return null;
}

export function validateFileType(file: File, allowedTypes: string[], fieldName: string = 'File'): ValidationError | null {
  if (!allowedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
    return {
      field: fieldName,
      message: `File type not supported. Allowed types: ${allowedTypes.join(', ')}`,
      code: 'INVALID_FILE_TYPE'
    };
  }
  
  return null;
}

// Validation hook for forms
export function useValidation() {
  const validateForm = (validationRules: Array<() => ValidationError | null>): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    validationRules.forEach(rule => {
      const error = rule();
      if (error) {
        errors.push(error);
      }
    });
    
    return errors;
  };

  return { validateForm };
}