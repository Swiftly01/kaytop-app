'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/hooks/useToast';
import { authService } from '@/lib/services/auth';
import { errorLogger } from '@/lib/services/errorLogging';

export interface GlobalErrorHandlerOptions {
  enableAuthRedirect?: boolean;
  enableNetworkRetry?: boolean;
  enableErrorLogging?: boolean;
}

export function useGlobalErrorHandler(options: GlobalErrorHandlerOptions = {}) {
  const router = useRouter();
  const { error: showError, warning: showWarning } = useToast();
  
  const {
    enableAuthRedirect = true,
    enableNetworkRetry = true,
    enableErrorLogging = true
  } = options;

  const handleGlobalError = (error: any, context?: string) => {
    // Log error for debugging and monitoring
    if (enableErrorLogging) {
      if (error.status) {
        errorLogger.logApiError(error, error.url || 'unknown', error.method || 'unknown');
      } else if (error.type === 'network') {
        errorLogger.logNetworkError(error);
      } else if (error.status === 401 || error.status === 403) {
        errorLogger.logAuthError(error, context || 'unknown');
      } else {
        errorLogger.logError(error.message || 'Unknown error', error, context);
      }
    }

    // Handle authentication errors
    if (enableAuthRedirect && (error.status === 401 || error.status === 403)) {
      if (error.status === 401) {
        // Clear authentication data
        authService.logout();
        
        // Show error message
        showError('Your session has expired. Please log in again.');
        
        // Redirect to login page
        router.push('/auth/login');
        return;
      } else if (error.status === 403) {
        showError('You don\'t have permission to perform this action.');
        return;
      }
    }

    // Handle network errors
    if (error.type === 'network' || error.name === 'NetworkError') {
      if (enableNetworkRetry && error.retryable) {
        showWarning('Network connection failed. Retrying...');
      } else {
        showError('Network connection failed. Please check your internet connection.');
      }
      return;
    }

    // Handle server errors
    if (error.status >= 500) {
      showError('Server error. Please try again later.');
      return;
    }

    // Handle validation errors
    if (error.status === 400 || error.status === 422) {
      const message = error.details?.message || error.message || 'Please check your input and try again.';
      showError(message);
      return;
    }

    // Handle rate limiting
    if (error.status === 429) {
      showWarning('Too many requests. Please wait a moment and try again.');
      return;
    }

    // Handle not found errors
    if (error.status === 404) {
      showError('The requested resource was not found.');
      return;
    }

    // Generic error handling
    const message = error.message || 'An unexpected error occurred. Please try again.';
    showError(message);
  };

  // Set up global error listeners
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleGlobalError(event.reason, 'unhandled promise rejection');
    };

    const handleError = (event: ErrorEvent) => {
      handleGlobalError(event.error, 'global error');
    };

    const handleApiError = (event: CustomEvent) => {
      handleGlobalError(event.detail, 'API error');
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('api-error', handleApiError as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('api-error', handleApiError as EventListener);
    };
  }, []);

  return {
    handleGlobalError
  };
}

// Global Error Handler Provider Component
interface GlobalErrorHandlerProviderProps {
  children: React.ReactNode;
  options?: GlobalErrorHandlerOptions;
}

export function GlobalErrorHandlerProvider({ 
  children, 
  options = {} 
}: GlobalErrorHandlerProviderProps) {
  useGlobalErrorHandler(options);
  
  return <>{children}</>;
}

// Enhanced API Error Handler for interceptors
export function createApiErrorHandler(router: any, showError: any) {
  return (error: any) => {
    // Handle authentication errors with redirect
    if (error.status === 401) {
      authService.logout();
      showError('Your session has expired. Please log in again.');
      router.push('/auth/login');
      return;
    }

    if (error.status === 403) {
      showError('You don\'t have permission to perform this action.');
      return;
    }

    // Handle other errors
    if (error.status >= 500) {
      showError('Server error. Please try again later.');
    } else if (error.status === 429) {
      showError('Too many requests. Please wait a moment and try again.');
    } else if (error.status === 404) {
      showError('The requested resource was not found.');
    } else if (error.message) {
      showError(error.message);
    } else {
      showError('An unexpected error occurred. Please try again.');
    }
  };
}