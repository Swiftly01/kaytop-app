'use client';

import { useCallback } from 'react';
import { useToast } from '@/app/hooks/useToast';
import { NetworkError, useNetworkErrorHandler } from './NetworkErrorHandler';
import { ValidationError } from './ValidationErrorDisplay';

export interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
  customMessage?: string;
}

export function useErrorHandling() {
  const { error: showErrorToast, warning: showWarningToast, info: showInfoToast } = useToast();
  const { handleNetworkError, retryWithBackoff } = useNetworkErrorHandler();

  const handleError = useCallback((
    error: any, 
    options: ErrorHandlingOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      customMessage
    } = options;

    // Log error for debugging
    if (logError) {
      console.error('Error handled by useErrorHandling:', error);
    }

    let errorMessage = customMessage || 'An unexpected error occurred';
    let isNetworkError = false;

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        const networkError = handleNetworkError(error);
        errorMessage = networkError.message;
        isNetworkError = true;
      } else {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Show toast notification
    if (showToast) {
      if (isNetworkError) {
        showWarningToast(errorMessage);
      } else {
        showErrorToast(errorMessage);
      }
    }

    return {
      message: errorMessage,
      isNetworkError,
      originalError: error
    };
  }, [showErrorToast, showWarningToast, handleNetworkError]);

  const handleValidationErrors = useCallback((
    errors: ValidationError[],
    options: ErrorHandlingOptions = {}
  ) => {
    const { showToast = true } = options;

    if (errors.length === 0) return;

    if (showToast) {
      if (errors.length === 1) {
        showErrorToast(errors[0].message);
      } else {
        showErrorToast(`Please fix ${errors.length} validation errors`);
      }
    }

    return errors;
  }, [showErrorToast]);

  const handleAsyncOperation = useCallback(async (
    operation: () => Promise<any>,
    options: ErrorHandlingOptions & {
      loadingMessage?: string;
      successMessage?: string;
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<any | null> => {
    const {
      loadingMessage,
      successMessage,
      onSuccess,
      onError,
      retryable = false,
      ...errorOptions
    } = options;

    try {
      // Show loading message
      if (loadingMessage) {
        showInfoToast(loadingMessage);
      }

      let result: any;
      
      if (retryable) {
        result = await retryWithBackoff(operation);
      } else {
        result = await operation();
      }

      // Show success message
      if (successMessage) {
        showInfoToast(successMessage);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const handledError = handleError(error, errorOptions);
      
      // Call error callback
      if (onError) {
        onError(handledError);
      }

      return null;
    }
  }, [handleError, showInfoToast, retryWithBackoff]);

  return {
    handleError,
    handleValidationErrors,
    handleAsyncOperation,
    retryWithBackoff
  };
}

// Higher-order component for error boundary
export function withErrorBoundary(
  Component: React.ComponentType<any>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return function WrappedComponent(props: any) {
    const ErrorBoundary = require('./ErrorBoundary').default;
    
    return React.createElement(
      ErrorBoundary,
      { fallback },
      React.createElement(Component, props)
    );
  };
}

// Error context for global error handling
import { createContext, useContext, ReactNode } from 'react';

interface ErrorContextType {
  reportError: (error: Error, context?: string) => void;
  clearErrors: () => void;
  errors: Error[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<Error[]>([]);
  const { handleError } = useErrorHandling();

  const reportError = useCallback((error: Error, context?: string) => {
    console.error(`Error reported${context ? ` in ${context}` : ''}:`, error);
    setErrors(prev => [...prev, error]);
    handleError(error);
  }, [handleError]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ reportError, clearErrors, errors }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Import React at the top
import React from 'react';

// Utility functions for common error scenarios
export const ErrorUtils = {
  // File upload errors
  handleFileUploadError: (error: any, fileName?: string) => {
    if (error.code === 'FILE_TOO_LARGE') {
      return `File "${fileName}" is too large. Please choose a smaller file.`;
    }
    if (error.code === 'INVALID_FILE_TYPE') {
      return `File "${fileName}" has an unsupported format.`;
    }
    if (error.code === 'UPLOAD_FAILED') {
      return `Failed to upload "${fileName}". Please try again.`;
    }
    return `Error uploading file${fileName ? ` "${fileName}"` : ''}. Please try again.`;
  },

  // Form submission errors
  handleFormError: (error: any) => {
    if (error.status === 422) {
      return 'Please check your input and try again.';
    }
    if (error.status === 409) {
      return 'This data already exists. Please use different values.';
    }
    return 'Failed to save changes. Please try again.';
  },

  // Authentication errors
  handleAuthError: (error: any) => {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.status === 403) {
      return 'You don\'t have permission to perform this action.';
    }
    return 'Authentication failed. Please try again.';
  },

  // Data loading errors
  handleDataLoadError: (resourceName: string) => {
    return `Failed to load ${resourceName}. Please refresh the page or try again later.`;
  }
};

// Import React and useState for ErrorProvider
import { useState } from 'react';
