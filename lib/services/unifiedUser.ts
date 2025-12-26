/**
 * Unified User Service
 * Single service that works for all user roles using direct backend endpoints
 */

import { unifiedApiClient } from '../api/client';
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
    
    const response: ApiResponse<PaginatedResponse<User>> = await unifiedApiClient.get(endpoint);
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response: ApiResponse<User> = await unifiedApiClient.get(`/admin/users/${id}`);
    return response.data;
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

    const response: ApiResponse<User> = await unifiedApiClient.put(`/admin/users/${id}`, updateData);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response: ApiResponse<User> = await unifiedApiClient.post('/admin/users', userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await unifiedApiClient.delete(`/admin/users/${id}`);
  }

  async searchUsers(params: UserFilterParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    if (params.branch) queryParams.append('branch', params.branch);
    if (params.state) queryParams.append('state', params.state);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/users/filter${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<User>> = await unifiedApiClient.get(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const unifiedUserService = new UnifiedUserAPIService();