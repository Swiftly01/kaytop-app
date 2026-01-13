/**
 * API Interceptors
 * Request and response interceptors for logging and debugging
 */

import type { RequestConfig, ApiResponse } from './types';
import { errorLogger } from '../services/errorLogging';

export interface RequestInterceptor {
  onRequest?: (url: string, config?: RequestConfig) => void;
  onRequestError?: (error: any) => void;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => void;
  onResponseError?: (error: any) => void;
}

class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  executeRequestInterceptors(url: string, config?: RequestConfig): void {
    this.requestInterceptors.forEach(interceptor => {
      try {
        interceptor.onRequest?.(url, config);
      } catch (error) {
        interceptor.onRequestError?.(error);
      }
    });
  }

  executeResponseInterceptors<T>(response: ApiResponse<T>): void {
    this.responseInterceptors.forEach(interceptor => {
      try {
        interceptor.onResponse?.(response);
      } catch (error) {
        interceptor.onResponseError?.(error);
      }
    });
  }

  executeResponseErrorInterceptors(error: any): void {
    this.responseInterceptors.forEach(interceptor => {
      try {
        interceptor.onResponseError?.(error);
      } catch (interceptorError) {
        console.error('Response error interceptor failed:', interceptorError);
      }
    });
  }
}

// Create singleton instance
export const interceptorManager = new InterceptorManager();

// Default logging interceptor
const loggingInterceptor: RequestInterceptor & ResponseInterceptor = {
  onRequest: (url: string, config?: RequestConfig) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${url}`, config);
    }
  },
  onResponse: <T>(response: ApiResponse<T>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Response]', response);
    }
  },
  onRequestError: (error: any) => {
    console.error('[API Request Error]', error);
  },
  onResponseError: (error: any) => {
    // Check if error logging is suppressed
    if (error?.suppressLog) {
      return;
    }

    console.error('[API Response Error]', error);

    // Log error using error logging service
    errorLogger.logApiError(error, error.url || 'unknown', error.method || 'unknown');

    // Emit custom event for global error handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: error }));
    }
  },
};

// Add default interceptors
interceptorManager.addRequestInterceptor(loggingInterceptor);
interceptorManager.addResponseInterceptor(loggingInterceptor);