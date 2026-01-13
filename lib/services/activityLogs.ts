/**
 * Activity Logs Service
 * Handles activity logging, search, and filtering
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS, API_CONFIG } from '../api/config';
import type {
  ActivityLog,
  ActivityLogFilters,
  PaginatedResponse,
} from '../api/types';

export interface ActivityLogsService {
  getActivityLogs(filters?: ActivityLogFilters): Promise<PaginatedResponse<ActivityLog>>;
  getUserActivityLogs(userId: string, filters?: Omit<ActivityLogFilters, 'userId'>): Promise<PaginatedResponse<ActivityLog>>;
}

class ActivityLogsAPIService implements ActivityLogsService {
  async getActivityLogs(filters: ActivityLogFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.userRole) params.append('userRole', filters.userRole);
      if (filters.actionType) params.append('actionType', filters.actionType);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const url = `${API_ENDPOINTS.ACTIVITY_LOGS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;

      console.log('🔍 Activity Logs Request:', {
        url,
        endpoint: API_ENDPOINTS.ACTIVITY_LOGS.LIST,
        params: Object.fromEntries(params.entries()),
        baseUrl: API_CONFIG.BASE_URL,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.get<any>(url, { suppressErrorLog: true });

      console.log('✅ Activity logs response received:', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: !!response?.data,
        keys: response ? Object.keys(response) : []
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (activity logs list)
        else if (Array.isArray(response)) {
          // Backend returns direct array, create paginated response structure
          return {
            data: response,
            pagination: {
              total: response.length,
              page: parseInt(filters.page?.toString() || '1'),
              limit: parseInt(filters.limit?.toString() || '50'),
              totalPages: Math.ceil(response.length / parseInt(filters.limit?.toString() || '50'))
            }
          };
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<ActivityLog>;
        }
      }

      throw new Error('Failed to fetch activity logs - invalid response format');
    } catch (error: any) {
      // If it's a 404 error, provide helpful guidance and return empty data
      // Relaxed check: 404 status OR "Cannot GET" message (common express 404 body)
      if (error?.status === 404 || error?.message?.includes('Cannot GET')) {
        console.warn('⚠️ Activity Logs endpoint not found (404). Returning empty data.');

        // Return empty data instead of throwing to prevent UI crash
        return {
          data: [],
          pagination: {
            total: 0,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: 0
          }
        };
      }

      console.error('❌ Activity logs fetch error:', {
        error: error instanceof Error ? error.message : error,
        status: error?.status,
        details: error?.details,
        url: `${API_ENDPOINTS.ACTIVITY_LOGS.LIST}`,
        filters,
        timestamp: new Date().toISOString(),
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorKeys: error ? Object.keys(error) : [],
        rawError: error
      });

      // Return empty data instead of throwing to prevent UI crash
      console.log('🔄 Returning empty activity logs to prevent UI crash');
      return {
        data: [],
        pagination: {
          total: 0,
          page: parseInt(filters.page?.toString() || '1'),
          limit: parseInt(filters.limit?.toString() || '50'),
          totalPages: 0
        }
      };
    }
  }

  async getUserActivityLogs(userId: string, filters: Omit<ActivityLogFilters, 'userId'> = {}): Promise<PaginatedResponse<ActivityLog>> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters (excluding userId since it's in the URL)
      if (filters.userRole) params.append('userRole', filters.userRole);
      if (filters.actionType) params.append('actionType', filters.actionType);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const url = `${API_ENDPOINTS.ACTIVITY_LOGS.BY_USER(userId)}${params.toString() ? `?${params.toString()}` : ''}`;

      console.log('🔍 User Activity Logs Request:', {
        url,
        userId,
        endpoint: API_ENDPOINTS.ACTIVITY_LOGS.BY_USER(userId),
        params: Object.fromEntries(params.entries())
      });

      const response = await apiClient.get<any>(url, { suppressErrorLog: true });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (activity logs list)
        else if (Array.isArray(response)) {
          // Backend returns direct array, create paginated response structure
          return {
            data: response,
            pagination: {
              total: response.length,
              page: parseInt(filters.page?.toString() || '1'),
              limit: parseInt(filters.limit?.toString() || '50'),
              totalPages: Math.ceil(response.length / parseInt(filters.limit?.toString() || '50'))
            }
          };
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<ActivityLog>;
        }
      }

      throw new Error('Failed to fetch user activity logs - invalid response format');
    } catch (error: any) {
      console.error('User activity logs fetch error:', {
        error: error.message,
        status: error.status,
        userId,
        endpoint: API_ENDPOINTS.ACTIVITY_LOGS.BY_USER(userId),
        filters
      });

      // If endpoint returns 404, it might not be implemented yet
      if (error.status === 404) {
        console.warn(`⚠️ User activity logs endpoint not found (404) for user ${userId}. Returning empty result.`);
        return {
          data: [],
          pagination: {
            total: 0,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: 0
          }
        };
      }

      throw error;
    }
  }
}

// Export singleton instance
export const activityLogsService = new ActivityLogsAPIService();