/**
 * Unified API Client
 * Enhanced HTTP client with unified authentication, error handling, and data transformation
 */

import { API_CONFIG, initializeConfiguration } from './config';
import { interceptorManager } from './interceptors';
import { DataTransformers } from './transformers';
import { UnifiedAPIErrorHandler } from './errorHandler';
import { authenticationManager } from './authManager';
import type {
  ApiResponse,
  RequestConfig,
  ApiError,
  NetworkError,
  AuthError,
  ServerError
} from './types';

export interface UnifiedApiClient {
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

export interface APILogger {
  logRequest(method: string, url: string, data?: any): void;
  logSuccess(method: string, url: string, status: number, responseTime: number): void;
  logError(method: string, url: string, error: any, responseTime: number): void;
}

class UnifiedAPILogger implements APILogger {
  logRequest(method: string, url: string, data?: any): void {
    if (API_CONFIG.LOG_API_CALLS && (API_CONFIG.DEBUG || API_CONFIG.LOG_LEVEL === 'debug')) {
      console.log(`🚀 [${method}] ${url}`, data ? { data } : '');
    }
  }

  logSuccess(method: string, url: string, status: number, responseTime: number): void {
    if (API_CONFIG.LOG_API_CALLS && (API_CONFIG.DEBUG || ['debug', 'info'].includes(API_CONFIG.LOG_LEVEL))) {
      console.log(`✅ [${method}] ${url} - ${status} (${responseTime}ms)`);
    }
  }

  logError(method: string, url: string, error: any, responseTime: number): void {
    // Always log errors regardless of log level
    console.error(`❌ [${method}] ${url} - ${error.status || 'Network Error'} (${responseTime}ms)`, error);
  }
}

class UnifiedHttpClient implements UnifiedApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private retryConfig: RetryConfig;
  private logger: APILogger;

  constructor() {
    // Initialize and validate configuration
    initializeConfiguration();

    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.retryConfig = {
      maxRetries: API_CONFIG.RETRY_ATTEMPTS,
      backoffMultiplier: 2,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    };
    this.logger = new UnifiedAPILogger();
  }

  private async getDefaultHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use authentication manager for token handling
    try {
      const authHeaders = await authenticationManager.getAuthHeaders();
      console.log('🔍 Auth Headers:', authHeaders);
      console.log('🔍 Auth State:', authenticationManager.getAuthState());
      return { ...headers, ...authHeaders };
    } catch (error) {
      console.error('🚨 Error getting auth headers:', error);
      return headers;
    }
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const timeout = config?.timeout || this.defaultTimeout;

    console.log('🔍 API Request Debug:', {
      method,
      url,
      fullUrl,
      baseURL: this.baseURL,
      timeout,
      hasData: !!data
    });

    const headers = {
      ...(await this.getDefaultHeaders()),
      ...config?.headers,
    };

    console.log('🔍 API Headers:', headers);

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

    // Log request
    this.logger.logRequest(method, fullUrl, data);

    try {
      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const error = await this.createApiError(response);

        // Log error only if suppression is not requested
        if (!config?.suppressErrorLog) {
          this.logger.logError(method, fullUrl, error, responseTime);

          // Log error with context
          UnifiedAPIErrorHandler.logErrorWithContext(error, {
            endpoint: fullUrl,
            method,
            requestData: data,
            timestamp: new Date().toISOString()
          });
        }

        throw error;
      }

      let responseData;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        if (API_CONFIG.DEBUG) {
          console.log('Non-JSON response received:', {
            status: response.status,
            contentType,
            textLength: text.length,
            text: text.substring(0, 200) + (text.length > 200 ? '...' : '')
          });
        }

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

      // Apply unified data transformation based on endpoint
      const transformedData = this.transformResponse<T>(responseData, fullUrl);

      // Execute response interceptors
      interceptorManager.executeResponseInterceptors(transformedData);

      // Log success
      this.logger.logSuccess(method, fullUrl, response.status, responseTime);

      return transformedData;
    } catch (error) {
      // Execute error interceptors
      interceptorManager.executeResponseErrorInterceptors(error);
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const shouldSuppress = (requestOptions as any)?.suppressErrorLog;

      if (!shouldSuppress) {
        console.error('🚨 API Request Failed:', {
          method,
          url: fullUrl,
          message: error instanceof Error ? error.message : 'Unknown error',
          status: (error as any)?.status,
          name: error instanceof Error ? error.name : 'Unknown',
          responseText: (error as any)?.responseText, // Often helpful in fetch errors
          responseTime
        });
      }

      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = this.createNetworkError('Request timeout', 408);
        this.logger.logError(method, fullUrl, timeoutError, responseTime);
        throw timeoutError;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = this.createNetworkError(`Network error: ${error.message}`, 0);
        this.logger.logError(method, fullUrl, networkError, responseTime);
        throw networkError;
      }

      this.logger.logError(method, fullUrl, error, responseTime);

      // Log error with context
      UnifiedAPIErrorHandler.logErrorWithContext(error, {
        endpoint: fullUrl,
        method,
        requestData: data,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  private transformResponse<T>(responseData: any, url: string): ApiResponse<T> {
    console.log('🔄 Transforming API response for:', url);

    // Apply endpoint-specific transformations using the unified transformer
    if (url.includes('/dashboard/kpi')) {
      const transformedData = DataTransformers.transformDashboardKPIs(responseData.data || responseData);
      return {
        success: true,
        data: transformedData as T,
        message: responseData.message
      };
    }

    // User management endpoints
    if (url.includes('/admin/users') || url.includes('/users/filter') || url.includes('/admin/staff/my-staff')) {
      if (Array.isArray(responseData.data) || Array.isArray(responseData)) {
        const transformedData = DataTransformers.transformPaginatedResponse(
          responseData,
          DataTransformers.transformUser
        );
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      } else if (responseData.data?.id || responseData.id) {
        const transformedData = DataTransformers.transformUser(responseData.data || responseData);
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
    }

    // Profile endpoints
    if (url.includes('/users/profile')) {
      const transformedData = DataTransformers.transformUser(responseData.data || responseData);
      return {
        success: true,
        data: transformedData as T,
        message: responseData.message
      };
    }

    // Loan management endpoints
    if (url.includes('/loans/')) {
      // Handle paginated loan responses (like /loans/disbursed)
      if (responseData.data && responseData.meta) {
        const transformedData = DataTransformers.transformPaginatedResponse(
          responseData,
          DataTransformers.transformLoan
        );
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
      // Handle direct array responses
      else if (Array.isArray(responseData.data) || Array.isArray(responseData)) {
        const transformedData = DataTransformers.transformPaginatedResponse(
          responseData,
          DataTransformers.transformLoan
        );
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
      // Handle single loan responses
      else if (responseData.data?.id || responseData.id || (Array.isArray(responseData) && responseData.length > 0)) {
        // Handle customer loans endpoint which returns array directly
        if (Array.isArray(responseData)) {
          const transformedData = responseData.map(DataTransformers.transformLoan);
          return {
            success: true,
            data: transformedData as T,
            message: 'Success'
          };
        } else {
          const transformedData = DataTransformers.transformLoan(responseData.data || responseData);
          return {
            success: true,
            data: transformedData as T,
            message: responseData.message
          };
        }
      }
    }

    // Savings management endpoints
    if (url.includes('/savings/')) {
      // Handle savings transactions
      if (url.includes('/transactions/all')) {
        if (Array.isArray(responseData.data) || Array.isArray(responseData)) {
          const transformedData = DataTransformers.transformPaginatedResponse(
            responseData,
            DataTransformers.transformTransaction
          );
          return {
            success: true,
            data: transformedData as T,
            message: responseData.message
          };
        }
      }
      // Handle savings accounts
      else if (Array.isArray(responseData.data) || Array.isArray(responseData)) {
        const transformedData = DataTransformers.transformPaginatedResponse(
          responseData,
          DataTransformers.transformSavingsAccount
        );
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
      // Handle single savings account (customer savings)
      else if (responseData.data?.id || responseData.id) {
        const transformedData = DataTransformers.transformSavingsAccount(responseData.data || responseData);
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
    }

    // Reports management endpoints
    if (url.includes('/reports')) {
      // Handle reports statistics
      if (url.includes('/statistics') || url.includes('/dashboard/stats')) {
        const transformedData = DataTransformers.transformReportStatistics(responseData.data || responseData);
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
      // Handle paginated reports responses
      else if (responseData.data && responseData.meta) {
        const transformedData = DataTransformers.transformPaginatedResponse(
          responseData,
          DataTransformers.transformReport
        );
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
      // Handle direct array responses
      else if (Array.isArray(responseData.data) || Array.isArray(responseData)) {
        const transformedData = DataTransformers.transformPaginatedResponse(
          responseData,
          DataTransformers.transformReport
        );
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
      // Handle single report responses (get by ID, approve, decline)
      else if (responseData.data?.id || responseData.id || (responseData.data?.reportId || responseData.reportId)) {
        const transformedData = DataTransformers.transformReport(responseData.data || responseData);
        return {
          success: true,
          data: transformedData as T,
          message: responseData.message
        };
      }
    }

    // Default transformation for unknown endpoints
    return {
      success: responseData.success !== false,
      data: responseData.data || responseData,
      message: responseData.message
    };
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

    // Classify error type and handle authentication errors
    if (response.status === 401 || response.status === 403) {
      (error as AuthError).type = 'auth';
      // Use authentication manager for handling auth failures
      authenticationManager.handleAuthenticationFailure();
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
        if (API_CONFIG.DEBUG) {
          console.log(`🔄 Retrying request in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})`);
        }
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

// Export singleton instance with unified capabilities
export const apiClient = new UnifiedHttpClient();

// Maintain backward compatibility
export const unifiedApiClient = apiClient;