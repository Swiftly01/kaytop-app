/**
 * Unified API Error Handler
 * Comprehensive error handling for unified API interactions with enhanced logging and recovery
 */

import { authenticationManager } from './authManager';
import { API_CONFIG } from './config';
import type { ApiError, AuthError, NetworkError, ServerError } from './types';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  logError?: boolean;
  retryable?: boolean;
}

export interface ErrorContext {
  endpoint?: string;
  method?: string;
  requestData?: any;
  userId?: string;
  timestamp?: string;
}

export class UnifiedAPIErrorHandler {
  
  /**
   * Handle authentication errors using unified authentication manager
   */
  static handleAuthenticationError(error: AuthError, options: ErrorHandlerOptions = {}): void {
    const { logError = true } = options;
    
    if (logError) {
      console.error('🔐 Authentication error:', error);
    }

    // Use unified authentication manager for handling auth failures
    authenticationManager.handleAuthenticationFailure();
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: NetworkError, options: ErrorHandlerOptions = {}): string {
    const { logError = true } = options;
    
    if (logError) {
      console.error('Network error:', error);
    }

    if (error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (error.status === 408) {
      return 'Request timeout. The server took too long to respond.';
    }
    
    return 'Network error occurred. Please try again.';
  }

  /**
   * Handle server errors
   */
  static handleServerError(error: ServerError, options: ErrorHandlerOptions = {}): string {
    const { logError = true } = options;
    
    if (logError) {
      console.error('Server error:', error);
    }

    switch (error.status) {
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. The server is temporarily down for maintenance.';
      case 504:
        return 'Gateway timeout. The server took too long to respond.';
      default:
        return 'Server error occurred. Please try again later.';
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: ApiError, options: ErrorHandlerOptions = {}): string[] {
    const { logError = true } = options;
    
    if (logError) {
      console.error('Validation error:', error);
    }

    if (error.status === 400 && error.details?.validation) {
      return error.details.validation.map((v: any) => v.message || 'Validation error');
    }
    
    if (error.status === 422 && error.details?.errors) {
      // Handle Laravel-style validation errors
      const errors: string[] = [];
      Object.values(error.details.errors).forEach((fieldErrors: any) => {
        if (Array.isArray(fieldErrors)) {
          errors.push(...fieldErrors);
        }
      });
      return errors;
    }
    
    return [error.message || 'Validation error occurred'];
  }

  /**
   * Handle general API errors
   */
  static handleApiError(error: any, options: ErrorHandlerOptions = {}): string {
    const { logError = true } = options;
    
    if (logError) {
      console.error('API error:', error);
    }

    // Handle different error types
    if (error.type === 'auth') {
      this.handleAuthenticationError(error as AuthError, options);
      return 'Authentication failed. Please log in again.';
    }
    
    if (error.type === 'network') {
      return this.handleNetworkError(error as NetworkError, options);
    }
    
    if (error.type === 'server') {
      return this.handleServerError(error as ServerError, options);
    }
    
    // Handle validation errors
    if (error.status === 400 || error.status === 422) {
      const validationErrors = this.handleValidationError(error, options);
      return validationErrors.join(', ');
    }
    
    // Handle other HTTP errors
    switch (error.status) {
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict: The resource already exists or there is a data conflict.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Create user-friendly error message
   */
  static createUserFriendlyMessage(error: any): string {
    // Extract meaningful error message from different error formats
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.details?.message) {
      return error.details.message;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determine if error is retryable
   */
  static isRetryableError(error: any): boolean {
    if (error.type === 'network') {
      return true;
    }
    
    if (error.status) {
      // Retry on server errors and rate limiting
      return [408, 429, 500, 502, 503, 504].includes(error.status);
    }
    
    return false;
  }

  /**
   * Log error with enhanced context for debugging and monitoring
   */
  static logErrorWithContext(error: any, context: ErrorContext): void {
    // Safely extract error properties, handling cases where error might be null/undefined
    const safeError = error || {};
    
    const errorLog = {
      timestamp: context.timestamp || new Date().toISOString(),
      error: {
        message: safeError.message || 'Unknown error',
        status: safeError.status || 'Unknown status',
        type: safeError.type || 'Unknown type',
        stack: safeError.stack || 'No stack trace',
        // Include all enumerable properties
        ...Object.getOwnPropertyNames(safeError).reduce((acc, key) => {
          try {
            acc[key] = safeError[key];
          } catch (e) {
            acc[key] = 'Unable to serialize';
          }
          return acc;
        }, {} as any),
        // Include details if available
        details: safeError.details || null,
        // Include response data if available
        response: safeError.response?.data || null,
      },
      context: {
        endpoint: context.endpoint,
        method: context.method,
        requestData: context.requestData ? JSON.stringify(context.requestData).substring(0, 1000) : null, // Limit size
        userId: context.userId || authenticationManager.getCurrentUser()?.id,
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      sessionId: this.getSessionId(),
    };
    
    console.error('🚨 Unified API Error Log:', errorLog);
    
    // Also log the raw error for debugging
    console.error('🔍 Raw Error Object:', error);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(errorLog);
    }
  }

  /**
   * Get or create session ID for error tracking
   */
  private static getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Send error to tracking service (placeholder for production implementation)
   */
  private static sendToErrorTracking(errorLog: any): void {
    if (!API_CONFIG.ENABLE_ERROR_TRACKING) {
      return;
    }

    if (API_CONFIG.ERROR_TRACKING_ENDPOINT) {
      // Send to configured error tracking service
      fetch(API_CONFIG.ERROR_TRACKING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      }).catch(err => {
        console.error('Failed to send error to tracking service:', err);
      });
    } else {
      // Fallback: log to console in production if no endpoint configured
      console.log('📊 Error tracking enabled but no endpoint configured:', errorLog);
    }
  }

  /**
   * Enhanced retry logic with exponential backoff and jitter
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      jitter?: boolean;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = API_CONFIG.RETRY_ATTEMPTS,
      baseDelay = API_CONFIG.RETRY_DELAY,
      maxDelay = API_CONFIG.RETRY_MAX_DELAY,
      jitter = true,
      retryCondition = this.isRetryableError
    } = options;
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry non-retryable errors
        if (!retryCondition(error)) {
          break;
        }
        
        // Calculate delay with exponential backoff and optional jitter
        let delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        
        if (jitter) {
          // Add random jitter to prevent thundering herd
          delay = delay * (0.5 + Math.random() * 0.5);
        }
        
        console.log(`🔄 Retrying operation in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Clear stored authentication tokens (deprecated - use authenticationManager)
   */
  private static clearStoredTokens(): void {
    console.warn('⚠️ clearStoredTokens is deprecated. Use authenticationManager.handleAuthenticationFailure() instead.');
    authenticationManager.handleAuthenticationFailure();
  }

  /**
   * Show toast notification (if toast system is available)
   */
  static showErrorToast(message: string): void {
    // This would integrate with your toast notification system
    // For now, we'll use console.error as a fallback
    console.error('Error:', message);
    
    // Example integration with a toast library:
    // if (typeof window !== 'undefined' && window.toast) {
    //   window.toast.error(message);
    // }
  }
}

// Maintain backward compatibility
export const APIErrorHandler = UnifiedAPIErrorHandler;