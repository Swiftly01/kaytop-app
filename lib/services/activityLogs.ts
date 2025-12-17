/**
 * Activity Logs Service
 * Handles activity logging, search, and filtering
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
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
      const response = await apiClient.get<any>(url);

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
            total: response.length,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: Math.ceil(response.length / parseInt(filters.limit?.toString() || '50'))
          };
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response;
        }
      }

      throw new Error('Failed to fetch activity logs - invalid response format');
    } catch (error) {
      console.error('Activity logs fetch error:', error);
      throw error;
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
      const response = await apiClient.get<any>(url);

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
            total: response.length,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: Math.ceil(response.length / parseInt(filters.limit?.toString() || '50'))
          };
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response;
        }
      }

      throw new Error('Failed to fetch user activity logs - invalid response format');
    } catch (error) {
      console.error('User activity logs fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const activityLogsService = new ActivityLogsAPIService();