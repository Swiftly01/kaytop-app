'use client';

import { useState, useCallback } from 'react';

export interface NetworkError {
  message: string;
  status?: number;
  code?: string;
  retryable: boolean;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export function useNetworkErrorHandler() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleNetworkError = useCallback((error: any): NetworkError => {
    let networkError: NetworkError = {
      message: 'An unexpected error occurred',
      retryable: true
    };

    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network connectivity issues
      networkError = {
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        retryable: true
      };
    } else if (error.status) {
      // HTTP errors
      switch (error.status) {
        case 400:
          networkError = {
            message: 'Invalid request. Please check your input and try again.',
            status: 400,
            code: 'BAD_REQUEST',
            retryable: false
          };
          break;
        case 401:
          networkError = {
            message: 'Authentication failed. Please log in again.',
            status: 401,
            code: 'UNAUTHORIZED',
            retryable: false
          };
          break;
        case 403:
          networkError = {
            message: 'Access denied. You don\'t have permission to perform this action.',
            status: 403,
            code: 'FORBIDDEN',
            retryable: false
          };
          break;
        case 404:
          networkError = {
            message: 'The requested resource was not found.',
            status: 404,
            code: 'NOT_FOUND',
            retryable: false
          };
          break;
        case 408:
          networkError = {
            message: 'Request timeout. Please try again.',
            status: 408,
            code: 'TIMEOUT',
            retryable: true
          };
          break;
        case 429:
          networkError = {
            message: 'Too many requests. Please wait a moment and try again.',
            status: 429,
            code: 'RATE_LIMITED',
            retryable: true
          };
          break;
        case 500:
          networkError = {
            message: 'Server error. Please try again later.',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            retryable: true
          };
          break;
        case 502:
        case 503:
        case 504:
          networkError = {
            message: 'Service temporarily unavailable. Please try again later.',
            status: error.status,
            code: 'SERVICE_UNAVAILABLE',
            retryable: true
          };
          break;
        default:
          networkError = {
            message: `Request failed with status ${error.status}`,
            status: error.status,
            code: 'HTTP_ERROR',
            retryable: error.status >= 500
          };
      }
    } else if (error.message) {
      networkError.message = error.message;
    }

    return networkError;
  }, []);

  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    options: RetryOptions = {}
  ) => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2
    } = options;

    setIsRetrying(true);
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        const networkError = handleNetworkError(error);
        
        if (!networkError.retryable || attempt === maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          throw networkError;
        }

        setRetryCount(attempt + 1);
        
        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [handleNetworkError]);

  return {
    handleNetworkError,
    retryWithBackoff,
    isRetrying,
    retryCount
  };
}

// Network Error Display Component
interface NetworkErrorDisplayProps {
  error: NetworkError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
}

export function NetworkErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true 
}: NetworkErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Network Error
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {error.message}
          </p>
          {error.status && (
            <p className="mt-1 text-xs text-red-600">
              Error {error.status}
            </p>
          )}
          
          {(showRetry && error.retryable && onRetry) && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onDismiss}
              aria-label="Close"
              className="text-red-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
