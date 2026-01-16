/**
 * Unified User Service
 * Single service that works for all user roles using direct backend endpoints
 */

import apiClient from '@/lib/apiClient';
import { DataTransformers } from '../api/transformers';
import type {
  User,
  UserFilterParams,
  PaginatedResponse,
  ApiResponse,
  CreateStaffData,
  UpdateUserData,
} from '../api/types';

export interface CreateUserRequest extends CreateStaffData {}

export interface UnifiedUserService {
  getUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  createUser(userData: CreateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
  searchUsers(params: UserFilterParams): Promise<PaginatedResponse<User>>;
}

class UnifiedUserAPIService implements UnifiedUserService {
  /**
   * Get users directly from backend with filtering
   */
  async getUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    if (params?.branch) queryParams.append('branch', params.branch);
    if (params?.state) queryParams.append('state', params.state);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    // Extract data from Axios response
    const data = response.data || response;
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // Check if it's already a paginated response
      if (data.data && Array.isArray(data.data)) {
        // Transform each user through DataTransformers
        const transformedUsers = data.data.map((user: any) => DataTransformers.transformUser(user));
        
        return {
          ...data,
          data: transformedUsers
        } as PaginatedResponse<User>;
      }
      // Check if it's a direct array
      else if (Array.isArray(data)) {
        // Transform each user through DataTransformers
        const transformedUsers = data.map((user: any) => DataTransformers.transformUser(user));
        
        return {
          data: transformedUsers,
          pagination: {
            page: parseInt(params?.page?.toString() || '1'),
            limit: parseInt(params?.limit?.toString() || '1000'),
            total: transformedUsers.length,
            totalPages: 1
          }
        };
      }
    }
    
    throw new Error('Invalid response format from getUsers');
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/admin/users/${id}`);
    // Extract data from Axios response
    const data = response.data || response;
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // Check if it's wrapped in a success/data format
      if (data.success && data.data) {
        return DataTransformers.transformUser(data.data);
      }
      // Check if it's direct user data (has user fields)
      else if (data.id || data.email || data.firstName) {
        return DataTransformers.transformUser(data);
      }
    }
    
    throw new Error('Invalid response format from getUserById');
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const updateData: UpdateUserData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      branch: data.branch,
      state: data.state,
    };

    const response = await apiClient.patch(`/admin/users/${id}`, updateData);
    // Extract data from Axios response
    const responseData = response.data || response;
    
    // Handle different response formats
    if (responseData && typeof responseData === 'object') {
      // Check if it's wrapped in a success/data format
      if (responseData.success && responseData.data) {
        return DataTransformers.transformUser(responseData.data);
      }
      // Check if it's direct user data
      else if (responseData.id || responseData.email || responseData.firstName) {
        return DataTransformers.transformUser(responseData);
      }
    }
    
    throw new Error('Invalid response format from updateUser');
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post('/admin/users', userData);
    // Extract data from Axios response
    const data = response.data || response;
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // Check if it's wrapped in a success/data format
      if (data.success && data.data) {
        return DataTransformers.transformUser(data.data);
      }
      // Check if it's direct user data
      else if (data.id || data.email || data.firstName) {
        return DataTransformers.transformUser(data);
      }
    }
    
    throw new Error('Invalid response format from createUser');
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  }

  async searchUsers(params: UserFilterParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    if (params.branch) queryParams.append('branch', params.branch);
    if (params.state) queryParams.append('state', params.state);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/users/filter${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    // Extract data from Axios response
    const data = response.data || response;
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // Check if it's already a paginated response
      if (data.data && Array.isArray(data.data)) {
        // Transform each user through DataTransformers
        const transformedUsers = data.data.map((user: any) => DataTransformers.transformUser(user));
        
        return {
          ...data,
          data: transformedUsers
        } as PaginatedResponse<User>;
      }
      // Check if it's a direct array
      else if (Array.isArray(data)) {
        // Transform each user through DataTransformers
        const transformedUsers = data.map((user: any) => DataTransformers.transformUser(user));
        
        return {
          data: transformedUsers,
          pagination: {
            page: parseInt(params?.page?.toString() || '1'),
            limit: parseInt(params?.limit?.toString() || '1000'),
            total: transformedUsers.length,
            totalPages: 1
          }
        };
      }
    }
    
    throw new Error('Invalid response format from searchUsers');
  }
}

// Export singleton instance
export const unifiedUserService = new UnifiedUserAPIService();
