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
      
      const response = await apiClient.get<PaginatedResponse<User>>(url);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch users');
    } catch (error) {
      console.error('Users fetch error:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.ADMIN.USER_BY_ID(id));

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch user');
    } catch (error) {
      console.error('User fetch error:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.ADMIN.USER_BY_EMAIL(email));

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch user');
    } catch (error) {
      console.error('User fetch by email error:', error);
      throw error;
    }
  }

  async createStaffUser(data: CreateStaffData): Promise<User> {
    try {
      const response = await apiClient.post<User>(API_ENDPOINTS.ADMIN.CREATE_STAFF, data);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create staff user');
    } catch (error) {
      console.error('Staff user creation error:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await apiClient.patch<User>(API_ENDPOINTS.ADMIN.UPDATE_USER(id), data);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update user');
    } catch (error) {
      console.error('User update error:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id));

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('User deletion error:', error);
      throw error;
    }
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    try {
      const response = await apiClient.patch<User>(API_ENDPOINTS.ADMIN.UPDATE_ROLE(id), { role });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update user role');
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
      
      const response = await apiClient.get<PaginatedResponse<User>>(url);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch users by branch');
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
      
      const response = await apiClient.get<PaginatedResponse<User>>(url);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch users by state');
    } catch (error) {
      console.error('Users by state fetch error:', error);
      throw error;
    }
  }

  async getMyStaff(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>(API_ENDPOINTS.ADMIN.MY_STAFF);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch staff');
    } catch (error) {
      console.error('Staff fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserAPIService();