/**
 * Base HTTP Client
 * Centralized HTTP client with error handling, retry mechanisms, and authentication
 */

import { API_CONFIG } from './config';
import { interceptorManager } from './interceptors';
import type { 
  ApiResponse, 
  RequestConfig, 
  ApiError, 
  NetworkError, 
  AuthError, 
  ServerError 
} from './types';

export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

class HttpClient implements ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private retryConfig: RetryConfig;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.retryConfig = {
      maxRetries: API_CONFIG.RETRY_ATTEMPTS,
      backoffMultiplier: 2,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    };
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first
      const token = localStorage.getItem('auth-token');
      if (token) {
        console.log('🔑 Token found in localStorage:', token.substring(0, 20) + '...');
        return token;
      }
      
      // Fallback to cookies if localStorage is empty
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth-token') {
          console.log('🔑 Token found in cookies:', decodeURIComponent(value).substring(0, 20) + '...');
          return decodeURIComponent(value);
        }
      }
      
      console.log('❌ No auth token found in localStorage or cookies');
    }
    return null;
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const timeout = config?.timeout || this.defaultTimeout;
    
    const headers = {
      ...this.getDefaultHeaders(),
      ...config?.headers,
    };

    // Handle FormData - don't set Content-Type for file uploads
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: config?.signal,
    };

    if (data && method !== 'GET') {
      requestOptions.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    // Create timeout signal
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

    // Combine timeout signal with user signal
    if (config?.signal) {
      config.signal.addEventListener('abort', () => timeoutController.abort());
    }

    requestOptions.signal = timeoutController.signal;

    // Execute request interceptors
    interceptorManager.executeRequestInterceptors(fullUrl, config);

    try {
      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createApiError(response);
      }

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.log('Non-JSON response received:', {
          status: response.status,
          contentType,
          textLength: text.length,
          text: text.substring(0, 200) + (text.length > 200 ? '...' : '')
        });
        
        // If response is empty, this indicates a backend issue
        if (!text || text.trim() === '') {
          responseData = {
            success: false,
            data: null,
            message: `Backend returned empty response (Status: ${response.status}). This indicates a backend deployment issue.`
          };
        } else {
          responseData = {
            success: response.ok,
            data: text,
            message: response.ok ? 'Success' : 'Request failed'
          };
        }
      }
      
      // Execute response interceptors
      interceptorManager.executeResponseInterceptors(responseData);
      
      return responseData;
    } catch (error) {
      // Execute error interceptors
      interceptorManager.executeResponseErrorInterceptors(error);
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createNetworkError('Request timeout', 408);
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createNetworkError('Network error', 0);
      }
      
      throw error;
    }
  }

  private async createApiError(response: Response): Promise<ApiError> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, use status text
      errorData = { message: response.statusText };
    }

    const error: ApiError = new Error(errorData.message || 'API Error') as ApiError;
    error.status = response.status;
    error.details = errorData;

    // Classify error type
    if (response.status === 401 || response.status === 403) {
      (error as AuthError).type = 'auth';
      
      // Handle authentication errors by clearing stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        
        // Clear cookies as well
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login if not already on auth page
        if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    } else if (response.status >= 500) {
      (error as ServerError).type = 'server';
    }

    return error;
  }

  private createNetworkError(message: string, status: number): NetworkError {
    const error = new Error(message) as NetworkError;
    error.type = 'network';
    error.status = status;
    return error;
  }

  private isRetryableError(error: any): boolean {
    if (error.type === 'network') return true;
    if (error.status && this.retryConfig.retryableStatusCodes.includes(error.status)) {
      return true;
    }
    return false;
  }

  private async withRetry<T>(
    operation: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Don't retry non-retryable errors
        if (!this.isRetryableError(error)) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(this.retryConfig.backoffMultiplier, attempt) * API_CONFIG.RETRY_DELAY;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.withRetry(() => this.makeRequest<T>('GET', url, undefined, config));
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.withRetry(() => this.makeRequest<T>('POST', url, data, config));
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.withRetry(() => this.makeRequest<T>('PUT', url, data, config));
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.withRetry(() => this.makeRequest<T>('PATCH', url, data, config));
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.withRetry(() => this.makeRequest<T>('DELETE', url, undefined, config));
  }
}

// Export singleton instance
export const apiClient = new HttpClient();