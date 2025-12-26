/**
 * API Error Handler
 * Comprehensive error handling for API interactions
 */

import type { ApiError, AuthError, NetworkError, ServerError } from './types';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  logError?: boolean;
}

export class APIErrorHandler {
  
  /**
   * Handle authentication errors
   */
  static handleAuthenticationError(error: AuthError, options: ErrorHandlerOptions = {}): void {
    const { redirectOnAuth = true, logError = true } = options;
    
    if (logError) {
      console.error('Authentication error:', error);
    }

    if (error.status === 401) {
      // Token expired or invalid
      this.clearStoredTokens();
      
      if (redirectOnAuth && typeof window !== 'undefined') {
        // Only redirect if not already on auth page
        if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login?reason=session_expired';
        }
      }
    } else if (error.status === 403) {
      // Insufficient permissions
      if (typeof window !== 'undefined') {
        // Show permission denied message or redirect to appropriate dashboard
        console.warn('Access denied - insufficient permissions');
      }
    }
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
   * Log error with context for debugging
   */
  static logErrorWithContext(error: any, context: {
    endpoint?: string;
    method?: string;
    requestData?: any;
    userId?: string;
  }): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        status: error.status,
        type: error.type,
        stack: error.stack,
      },
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    };
    
    console.error('API Error Log:', errorLog);
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or your own logging endpoint
  }

  /**
   * Clear stored authentication tokens
   */
  private static clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      
      // Clear cookies as well
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
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

  /**
   * Handle retry logic with exponential backoff
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
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
        if (!this.isRetryableError(error)) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}