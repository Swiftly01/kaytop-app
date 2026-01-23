/**
 * Unified User Service
 * Uses /admin/staff/my-staff as primary endpoint since it returns proper role field
 * with performance optimizations including request deduplication and caching
 */

import apiClient from '@/lib/apiClient';
import { DataTransformers } from '../api/transformers';
import type {
  User,
  UserFilterParams,
  PaginatedResponse,
  CreateStaffData,
} from '../api/types';

export interface CreateUserRequest extends CreateStaffData {
  // Inherits all properties from CreateStaffData
  // This interface can be extended with additional user creation fields if needed
}

// Request deduplication map
const pendingUserRequests = new Map<string, Promise<unknown>>();

// Simple cache for user requests (5 minute TTL)
interface UserCacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
  expiresAt: number;
}

const userCache = new Map<string, UserCacheEntry>();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface UnifiedUserService {
  getUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>>;
  getAllUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  createUser(userData: CreateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
  searchUsers(params: UserFilterParams): Promise<PaginatedResponse<User>>;
  clearCache(): void;
}

class UnifiedUserAPIService implements UnifiedUserService {
  
  /**
   * Clear user cache
   */
  clearCache(): void {
    const cacheSize = userCache.size;
    const pendingSize = pendingUserRequests.size;
    const cacheKeys = Array.from(userCache.keys());
    
    userCache.clear();
    pendingUserRequests.clear();
    
    console.log(`🧹 User service cache cleared - removed ${cacheSize} cached entries and ${pendingSize} pending requests`);
    console.log('🧹 Cache keys that were cleared:', cacheKeys);
  }

  /**
   * Generate cache key for user requests
   */
  private getCacheKey(endpoint: string, params?: UserFilterParams): string {
    if (!params) return endpoint;
    
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${endpoint}:${paramStr}`;
  }

  /**
   * Get cached data or fetch if expired
   */
  private async getCachedUserData<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = userCache.get(key);
    
    // Return cached data if still valid
    if (cached && now < cached.expiresAt) {
      console.log(`📦 User cache hit for ${key} (expires in ${Math.round((cached.expiresAt - now) / 1000)}s)`);
      return cached.data;
    } else if (cached) {
      console.log(`⏰ User cache expired for ${key}, fetching fresh data`);
    } else {
      console.log(`🆕 No cache entry for ${key}, fetching fresh data`);
    }

    // Check if request is already pending
    if (pendingUserRequests.has(key)) {
      console.log(`⏳ Waiting for pending user request: ${key}`);
      return await pendingUserRequests.get(key)!;
    }

    // Create new request
    const requestPromise = fetchFn();
    pendingUserRequests.set(key, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the result
      userCache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + USER_CACHE_TTL
      });
      
      console.log(`💾 Cached user data for ${key} at ${new Date().toISOString()}`);
      return data;
    } finally {
      // Remove from pending requests
      pendingUserRequests.delete(key);
    }
  }

  /**
   * Get all users from /admin/users endpoint with server-side pagination
   * This is the recommended endpoint for customer pages
   */
  async getAllUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>> {
    const cacheKey = this.getCacheKey('admin-users', params);
    
    console.log(`🔍 [UnifiedUserService] Fetching users from /admin/users with server-side pagination`);
    if (params?.role) {
      console.log(`🎭 [UnifiedUserService] Will filter by role: ${params.role}`);
    }
    
    return await this.getCachedUserData(cacheKey, async () => {
      try {
        // Build query parameters (note: /admin/users doesn't support role filtering)
        const queryParams = new URLSearchParams();
        
        if (params?.page) {
          queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
          queryParams.append('limit', params.limit.toString());
        }
        // Note: role filtering will be done client-side as /admin/users doesn't support it
        if (params?.branch) {
          queryParams.append('branch', params.branch);
        }
        if (params?.state) {
          queryParams.append('state', params.state);
        }

        const queryString = queryParams.toString();
        const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
        
        console.log(`🔄 [UnifiedUserService] Fetching from ${endpoint}`);
        const response = await apiClient.get(endpoint);
        
        // Log the complete raw response before any processing
        console.log(`🔍 [UnifiedUserService] RAW API RESPONSE from /admin/users:`, JSON.stringify(response.data, null, 2));
        
        const responseData = response.data || response;
        
        // Handle different response formats
        let users: Record<string, unknown>[] = [];
        let pagination = {
          page: parseInt(params?.page?.toString() || '1'),
          limit: parseInt(params?.limit?.toString() || '10'),
          total: 0,
          totalPages: 0
        };

        if (responseData.users && Array.isArray(responseData.users)) {
          // Response format: { users: [...], pagination: {...} }
          users = responseData.users;
          if (responseData.pagination) {
            pagination = {
              page: responseData.pagination.page || pagination.page,
              limit: responseData.pagination.limit || pagination.limit,
              total: responseData.pagination.total || users.length,
              totalPages: responseData.pagination.totalPages || Math.ceil(users.length / pagination.limit)
            };
          } else {
            pagination.total = users.length;
            pagination.totalPages = Math.ceil(users.length / pagination.limit);
          }
        } else if (Array.isArray(responseData)) {
          // Response format: [user1, user2, ...]
          users = responseData;
          pagination.total = users.length;
          pagination.totalPages = Math.ceil(users.length / pagination.limit);
        } else {
          console.warn(`⚠️ [UnifiedUserService] Unexpected response format from /admin/users`);
          throw new Error('Invalid response format from /admin/users');
        }

        console.log(`✅ [UnifiedUserService] Got ${users.length} users from /admin/users`);
        
        // Log role distribution
        const roleDistribution: Record<string, number> = {};
        users.forEach((user: Record<string, unknown>) => {
          const role = (user.role as string) || 'undefined';
          roleDistribution[role] = (roleDistribution[role] || 0) + 1;
        });
        console.log(`🎭 [UnifiedUserService] Role distribution:`, roleDistribution);
        
        // Apply role filtering client-side since /admin/users doesn't support role query parameter
        let filteredUsers = users;
        if (params?.role) {
          const requestedRole = params.role.toLowerCase();
          
          filteredUsers = users.filter(user => {
            const userRole = (user.role as string)?.toLowerCase() || '';
            
            // Exact match first
            if (userRole === requestedRole) return true;
            
            // For credit officer roles, try multiple variations
            if (requestedRole.includes('credit') && requestedRole.includes('officer')) {
              return userRole === 'credit_officer' || 
                     userRole === 'creditofficer' || 
                     userRole === 'credit officer' ||
                     userRole === 'co';
            }
            
            // For branch manager roles
            if (requestedRole.includes('branch') && requestedRole.includes('manager')) {
              return userRole === 'branch_manager' || 
                     userRole === 'branchmanager' || 
                     userRole === 'branch manager' ||
                     userRole === 'bm';
            }
            
            // For hq manager roles
            if (requestedRole.includes('hq') && requestedRole.includes('manager')) {
              return userRole === 'hq_manager' || 
                     userRole === 'hqmanager' || 
                     userRole === 'hq manager' ||
                     userRole === 'hm';
            }
            
            // For system admin roles
            if (requestedRole.includes('system') && requestedRole.includes('admin')) {
              return userRole === 'system_admin' || 
                     userRole === 'systemadmin' || 
                     userRole === 'system admin' ||
                     userRole === 'sa';
            }
            
            // For customer role
            if (requestedRole === 'customer') {
              return userRole === 'customer';
            }
            
            return false;
          });
          
          console.log(`🔍 [UnifiedUserService] Client-side filtered for "${params.role}": ${filteredUsers.length} users found`);
          
          if (filteredUsers.length === 0) {
            console.warn(`⚠️ [UnifiedUserService] No users found with role "${params.role}". Available roles:`, Object.keys(roleDistribution));
          }
        }
        
        // Show sample users with their roles
        if (users.length > 0) {
          console.log(`👥 [UnifiedUserService] Sample users:`, 
            users.slice(0, 3).map((u: Record<string, unknown>) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              email: u.email,
              role: u.role,
              branch: u.branch
            }))
          );
        }

        // Transform users through DataTransformers
        const transformedUsers = filteredUsers.map((user: Record<string, unknown>) => DataTransformers.transformUser(user));

        // Recalculate pagination based on filtered results
        const filteredTotal = transformedUsers.length;
        const recalculatedPagination = {
          page: pagination.page,
          limit: pagination.limit,
          total: filteredTotal,
          totalPages: Math.ceil(filteredTotal / pagination.limit)
        };

        // Apply client-side pagination to filtered results
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedUsers = transformedUsers.slice(startIndex, endIndex);

        return {
          data: paginatedUsers,
          pagination: recalculatedPagination
        };
        
      } catch (error) {
        console.error(`❌ [UnifiedUserService] Error fetching users from /admin/users:`, error);
        throw error;
      }
    });
  }

  /**
   * Get users from /admin/staff/my-staff endpoint which returns proper role field
   */
  async getUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>> {
    const cacheKey = this.getCacheKey('staff-users', params);
    
    console.log(`🔍 [UnifiedUserService] Fetching users with proper roles from /admin/staff/my-staff`);
    if (params?.role) {
      console.log(`🎭 [UnifiedUserService] Will filter by role: ${params.role}`);
    }
    
    return await this.getCachedUserData(cacheKey, async () => {
      try {
        // Fetch from /admin/staff/my-staff (primary source with proper roles)
        console.log(`🔄 [UnifiedUserService] Fetching from /admin/staff/my-staff`);
        const staffResponse = await apiClient.get('/admin/staff/my-staff');
        
        // Log the complete raw response before any processing
        console.log(`🔍 [UnifiedUserService] RAW API RESPONSE:`, JSON.stringify(staffResponse.data, null, 2));
        
        const staffData = staffResponse.data || staffResponse;
        
        console.log(`� [UnifiedUserService] Staff response:`, { 
          totalStaff: Array.isArray(staffData) ? staffData.length : 0,
          hasData: !!staffData,
          responseType: Array.isArray(staffData) ? 'array' : typeof staffData,
          sampleStaff: Array.isArray(staffData) && staffData.length > 0 ? {
            id: staffData[0].id,
            firstName: staffData[0].firstName,
            lastName: staffData[0].lastName,
            email: staffData[0].email,
            role: staffData[0].role,
            branch: staffData[0].branch,
            hasRole: !!staffData[0].role
          } : null
        });
        
        if (!Array.isArray(staffData)) {
          console.warn(`⚠️ [UnifiedUserService] Unexpected response format from /admin/staff/my-staff`);
          throw new Error('Invalid response format from /admin/staff/my-staff');
        }

        const allUsers = [...staffData];
        console.log(`✅ [UnifiedUserService] Got ${staffData.length} staff members with roles from /admin/staff/my-staff`);
        
        // Log role distribution
        const roleDistribution: Record<string, number> = {};
        staffData.forEach((user: Record<string, unknown>) => {
          const role = (user.role as string) || 'undefined';
          roleDistribution[role] = (roleDistribution[role] || 0) + 1;
        });
        console.log(`🎭 [UnifiedUserService] Role distribution:`, roleDistribution);
        
        // Show sample users with their roles
        if (staffData.length > 0) {
          console.log(`👥 [UnifiedUserService] Sample users:`, 
            staffData.slice(0, 3).map((u: Record<string, unknown>) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              email: u.email,
              role: u.role,
              branch: u.branch
            }))
          );
        }

        // Debug: Show which users would be filtered as credit officers
        const potentialCreditOfficers = staffData.filter((user: Record<string, unknown>) => {
          const userRole = (user.role as string)?.toLowerCase() || '';
          return userRole === 'credit_officer' || 
                 userRole === 'creditofficer' || 
                 userRole === 'credit officer' ||
                 userRole === 'co' ||
                 userRole.includes('credit');
        });
        
        console.log(`💼 [UnifiedUserService] Users that match credit officer filter: ${potentialCreditOfficers.length}`);
        if (potentialCreditOfficers.length > 0) {
          console.log(`👔 [UnifiedUserService] Credit officers found:`, 
            potentialCreditOfficers.map((u: Record<string, unknown>) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              role: u.role,
              email: u.email
            }))
          );
        }

        // Apply role filtering if requested
        let filteredUsers = allUsers;
        if (params?.role) {
          const requestedRole = params.role.toLowerCase();
          
          filteredUsers = allUsers.filter(user => {
            const userRole = (user.role as string)?.toLowerCase() || '';
            
            // Exact match first
            if (userRole === requestedRole) return true;
            
            // For credit officer roles, try multiple variations
            if (requestedRole.includes('credit') && requestedRole.includes('officer')) {
              return userRole === 'credit_officer' || 
                     userRole === 'creditofficer' || 
                     userRole === 'credit officer' ||
                     userRole === 'co';
            }
            
            // For branch manager roles
            if (requestedRole.includes('branch') && requestedRole.includes('manager')) {
              return userRole === 'branch_manager' || 
                     userRole === 'branchmanager' || 
                     userRole === 'branch manager' ||
                     userRole === 'bm';
            }
            
            // For hq manager roles
            if (requestedRole.includes('hq') && requestedRole.includes('manager')) {
              return userRole === 'hq_manager' || 
                     userRole === 'hqmanager' || 
                     userRole === 'hq manager' ||
                     userRole === 'hm';
            }
            
            // For system admin roles
            if (requestedRole.includes('system') && requestedRole.includes('admin')) {
              return userRole === 'system_admin' || 
                     userRole === 'systemadmin' || 
                     userRole === 'system admin' ||
                     userRole === 'sa';
            }
            
            return false;
          });
          
          console.log(`🔍 [UnifiedUserService] Filtered for "${params.role}": ${filteredUsers.length} users found`);
          
          if (filteredUsers.length === 0) {
            console.warn(`⚠️ [UnifiedUserService] No users found with role "${params.role}". Available roles:`, Object.keys(roleDistribution));
          }
        }

        // Apply other filters
        if (params?.branch) {
          const originalCount = filteredUsers.length;
          filteredUsers = filteredUsers.filter(user => 
            (user.branch as string)?.toLowerCase().includes(params.branch!.toLowerCase())
          );
          console.log(`🏢 [UnifiedUserService] Filtered by branch "${params.branch}": ${filteredUsers.length}/${originalCount} users`);
        }

        if (params?.state) {
          const originalCount = filteredUsers.length;
          filteredUsers = filteredUsers.filter(user => 
            (user.state as string)?.toLowerCase().includes(params.state!.toLowerCase())
          );
          console.log(`🗺️ [UnifiedUserService] Filtered by state "${params.state}": ${filteredUsers.length}/${originalCount} users`);
        }

        // Transform users through DataTransformers (though they should already have proper roles)
        const transformedUsers = filteredUsers.map((user: Record<string, unknown>) => DataTransformers.transformUser(user));
        
        // Apply pagination
        const page = parseInt(params?.page?.toString() || '1');
        const limit = parseInt(params?.limit?.toString() || '1000');
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = transformedUsers.slice(startIndex, endIndex);

        return {
          data: paginatedUsers,
          pagination: {
            page,
            limit,
            total: transformedUsers.length,
            totalPages: Math.ceil(transformedUsers.length / limit)
          }
        };
        
      } catch (error) {
        console.error(`❌ [UnifiedUserService] Error fetching users from /admin/staff/my-staff:`, error);
        throw error;
      }
    });
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
    console.log(`🔄 [UnifiedUserService] Updating user ${id} with input data:`, data);
    
    // Try multiple approaches to update the user
    const approaches = [
      // Approach 1: Standard admin update with all field variations
      async () => {
        const updateData: Record<string, unknown> = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          branch: data.branch,
          state: data.state,
        };

        // Handle phone number field - try multiple variations
        if (data.mobileNumber) {
          updateData.mobileNumber = data.mobileNumber;
          updateData.phone = data.mobileNumber;
          updateData.mobile_number = data.mobileNumber;
        }

        // Remove undefined/null/empty values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
            delete updateData[key];
          }
        });

        console.log(`📤 [Approach 1] Standard admin update to /admin/users/${id}:`, JSON.stringify(updateData, null, 2));
        return await apiClient.patch(`/admin/users/${id}`, updateData);
      },

      // Approach 2: Minimal update with only changed fields
      async () => {
        const updateData: Record<string, unknown> = {};
        
        if (data.firstName) updateData.firstName = data.firstName;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.email) updateData.email = data.email;
        if (data.mobileNumber) updateData.mobileNumber = data.mobileNumber;

        console.log(`📤 [Approach 2] Minimal update to /admin/users/${id}:`, JSON.stringify(updateData, null, 2));
        return await apiClient.patch(`/admin/users/${id}`, updateData);
      },

      // Approach 3: Try with phone field instead of mobileNumber
      async () => {
        const updateData: Record<string, unknown> = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        };

        if (data.mobileNumber) {
          updateData.phone = data.mobileNumber; // Use phone instead of mobileNumber
        }

        console.log(`📤 [Approach 3] Phone field update to /admin/users/${id}:`, JSON.stringify(updateData, null, 2));
        return await apiClient.patch(`/admin/users/${id}`, updateData);
      }
    ];

    let lastError: unknown = null;

    // Try each approach
    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`🔄 [UnifiedUserService] Trying approach ${i + 1}...`);
        const response = await approaches[i]();
        
        console.log(`✅ [UnifiedUserService] Approach ${i + 1} successful! Response status: ${response.status}`);
        console.log(`✅ [UnifiedUserService] Response data:`, response.data);
        
        // Clear cache after successful update to ensure fresh data on next fetch
        const clearTime = new Date().toISOString();
        console.log(`🧹 [UnifiedUserService] Clearing cache after successful user update at ${clearTime}`);
        this.clearCache();
        
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
        
      } catch (error) {
        console.error(`❌ [UnifiedUserService] Approach ${i + 1} failed:`, error);
        lastError = error;
        
        // If it's an Axios error, log the response details
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown } };
          console.error(`HTTP Status: ${axiosError.response?.status}`);
          console.error(`Response data:`, axiosError.response?.data);
          
          // If it's not a 500 error, don't try other approaches
          if (axiosError.response?.status !== 500) {
            break;
          }
        }
        
        // Continue to next approach if this one failed with 500
        continue;
      }
    }

    // All approaches failed, throw the last error with enhanced details
    console.error(`❌ [UnifiedUserService] All update approaches failed for user ${id}`);
    
    if (lastError && typeof lastError === 'object' && 'response' in lastError) {
      const axiosError = lastError as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
          headers?: unknown;
        };
        config?: {
          url?: string;
          method?: string;
          data?: unknown;
          headers?: unknown;
        };
      };
      console.error(`Final error - HTTP Status: ${axiosError.response?.status}`);
      console.error(`Final error - Response data:`, axiosError.response?.data);
      console.error(`Final error - Response headers:`, axiosError.response?.headers);
      console.error(`Final error - Request URL: ${axiosError.config?.url}`);
      console.error(`Final error - Request method: ${axiosError.config?.method}`);
      console.error(`Final error - Request data:`, axiosError.config?.data);
      console.error(`Final error - Request headers:`, axiosError.config?.headers);
      
      // Provide specific error messages based on status code
      if (axiosError.response?.status === 500) {
        const errorMessage = axiosError.response?.data?.message || 
                            axiosError.response?.data?.error || 
                            'The backend encountered an internal error. This might be due to missing required fields, validation issues, or server configuration problems.';
        throw new Error(`Server error (500): ${errorMessage}`);
      }
      
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Bad request - invalid data format';
        throw new Error(`Validation error (400): ${errorMessage}`);
      }
      
      if (axiosError.response?.status === 401) {
        throw new Error(`Authentication error (401): Please log in again`);
      }
      
      if (axiosError.response?.status === 403) {
        throw new Error(`Permission error (403): You don't have permission to update this user`);
      }
      
      if (axiosError.response?.status === 404) {
        throw new Error(`User not found (404): User with ID ${id} does not exist`);
      }
    }
    
    throw lastError || new Error('Unknown error occurred while updating user');
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
    // Use the same getUsers method since /admin/staff/my-staff provides all the data we need
    return this.getUsers(params);
  }
}

// Export singleton instance
export const unifiedUserService = new UnifiedUserAPIService();