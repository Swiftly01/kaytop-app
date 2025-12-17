/**
 * User Management Service
 * Handles user CRUD operations, filtering, and staff management
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  User,
  UserFilterParams,
  PaginatedResponse,
  CreateStaffData,
  UpdateUserData,
  PaginationParams,
} from '../api/types';

export interface UserService {
  getAllUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  createStaffUser(data: CreateStaffData): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserRole(id: string, role: string): Promise<User>;
  getUsersByBranch(branch: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  getUsersByState(state: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  getMyStaff(): Promise<User[]>;
}

class UserAPIService implements UserService {
  // Helper function to create paginated response structure
  private createPaginatedResponse<T>(data: T[], total: number, params?: { page?: number; limit?: number }): PaginatedResponse<T> {
    const page = parseInt(params?.page?.toString() || '1');
    const limit = parseInt(params?.limit?.toString() || '1000');
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.branch) {
        queryParams.append('branch', params.branch);
      }
      
      if (params?.state) {
        queryParams.append('state', params.state);
      }
      
      if (params?.role) {
        queryParams.append('role', params.role);
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.ADMIN.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (users list)
        else if (Array.isArray(response)) {
          // Backend returns direct array, create paginated response structure
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response;
        }
      }

      throw new Error('Failed to fetch users - invalid response format');
    } catch (error) {
      console.error('Users fetch error:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.ADMIN.USER_BY_ID(id));

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has user fields)
        else if (response.id || response.email || response.firstName) {
          return response as User;
        }
      }

      throw new Error('Failed to fetch user - invalid response format');
    } catch (error) {
      console.error('User fetch error:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.ADMIN.USER_BY_EMAIL(email));

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has user fields)
        else if (response.id || response.email || response.firstName) {
          return response as User;
        }
      }

      throw new Error('Failed to fetch user - invalid response format');
    } catch (error) {
      console.error('User fetch by email error:', error);
      throw error;
    }
  }

  async createStaffUser(data: CreateStaffData): Promise<User> {
    try {
      const response = await apiClient.post<User>(API_ENDPOINTS.ADMIN.CREATE_STAFF, data);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has user fields)
        else if (response.id || response.email || response.firstName) {
          return response as User;
        }
      }

      throw new Error('Failed to create staff user - invalid response format');
    } catch (error) {
      console.error('Staff user creation error:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await apiClient.patch<User>(API_ENDPOINTS.ADMIN.UPDATE_USER(id), data);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has user fields)
        else if (response.id || response.email || response.firstName) {
          return response as User;
        }
      }

      throw new Error('Failed to update user - invalid response format');
    } catch (error) {
      console.error('User update error:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id));

      // Backend may return direct success format or wrapped format
      if (response && typeof response === 'object') {
        // Check if it's wrapped format with success field
        if (response.success === false) {
          throw new Error(response.message || 'Failed to delete user');
        }
        // If response exists and no explicit failure, consider it successful
        return;
      }

      // If response is truthy (not null/undefined), consider it successful
      if (response) {
        return;
      }

      throw new Error('Failed to delete user - no response');
    } catch (error) {
      console.error('User deletion error:', error);
      throw error;
    }
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    try {
      const response = await apiClient.patch<User>(API_ENDPOINTS.ADMIN.UPDATE_ROLE(id), { role });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has user fields)
        else if (response.id || response.email || response.firstName) {
          return response as User;
        }
      }

      throw new Error('Failed to update user role - invalid response format');
    } catch (error) {
      console.error('User role update error:', error);
      throw error;
    }
  }

  async getUsersByBranch(branch: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.ADMIN.USERS_BY_BRANCH(branch)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (users list)
        else if (Array.isArray(response)) {
          // Backend returns direct array, create paginated response structure
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response;
        }
        // Check if it has users array (branch-specific format)
        else if (response.users && Array.isArray(response.users)) {
          return this.createPaginatedResponse(response.users, response.total || response.users.length, params);
        }
      }

      throw new Error('Failed to fetch users by branch - invalid response format');
    } catch (error) {
      console.error('Users by branch fetch error:', error);
      throw error;
    }
  }

  async getUsersByState(state: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.ADMIN.USERS_BY_STATE(state)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (users list)
        else if (Array.isArray(response)) {
          // Backend returns direct array, create paginated response structure
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response;
        }
        // Check if it has users array (state-specific format)
        else if (response.users && Array.isArray(response.users)) {
          return this.createPaginatedResponse(response.users, response.total || response.users.length, params);
        }
      }

      throw new Error('Failed to fetch users by state - invalid response format');
    } catch (error) {
      console.error('Users by state fetch error:', error);
      throw error;
    }
  }

  async getMyStaff(): Promise<User[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN.MY_STAFF);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (staff list)
        else if (Array.isArray(response)) {
          return response;
        }
      }

      throw new Error('Failed to fetch staff - invalid response format');
    } catch (error) {
      console.error('Staff fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserAPIService();