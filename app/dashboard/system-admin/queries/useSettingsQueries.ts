"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemSettingsService } from "@/lib/services/systemSettings";
import { userProfileService } from "@/lib/services/userProfile";
import { activityLogsService } from "@/lib/services/activityLogs";
import type { 
  SystemSettings, 
  ActivityLog, 
  ActivityLogFilters 
} from "@/lib/api/types";
import type { 
  UserProfileData, 
  UpdateProfileData, 
  ChangePasswordData 
} from "@/lib/services/userProfile";
import { AxiosError } from "axios";

/**
 * Hook for fetching user profile data
 */
export function useUserProfile() {
  return useQuery<UserProfileData, AxiosError>({
    queryKey: ["user-profile"],
    queryFn: () => userProfileService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation<UserProfileData, AxiosError, UpdateProfileData>({
    mutationFn: (data: UpdateProfileData) => userProfileService.updateUserProfile(data),
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(["user-profile"], data);
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation<void, AxiosError, ChangePasswordData>({
    mutationFn: (data: ChangePasswordData) => userProfileService.changePassword(data),
  });
}

/**
 * Hook for updating profile picture
 */
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation<UserProfileData, AxiosError, File>({
    mutationFn: (file: File) => userProfileService.updateProfilePicture(file),
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(["user-profile"], data);
    },
  });
}

/**
 * Hook for fetching system settings
 */
export function useSystemSettings() {
  return useQuery<SystemSettings, AxiosError>({
    queryKey: ["system-settings"],
    queryFn: async () => {
      console.log('🔄 useSystemSettings query executing');
      
      try {
        const result = await systemSettingsService.getSystemSettings();
        console.log('✅ useSystemSettings query successful:', {
          appName: result.appName,
          version: result.version,
          hasId: !!result.id
        });
        return result;
      } catch (error) {
        console.error('❌ useSystemSettings query failed:', error);
        
        // Log additional debugging info
        console.error('🔍 System Settings Query Debug Info:', {
          timestamp: new Date().toISOString(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });
        
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint doesn't exist)
      if ((error as any)?.status === 404) {
        console.log('🚫 Not retrying 404 error for system settings');
        return false;
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    
    // Add error handling
    onError: (error) => {
      console.error('🚨 System Settings Query Error:', {
        message: error.message,
        status: (error as any)?.status,
        details: (error as any)?.details
      });
    },
    
    // Add success logging
    onSuccess: (data) => {
      console.log('🎉 System Settings Query Success:', {
        appName: data.appName,
        version: data.version,
        maintenanceMode: data.maintenanceMode
      });
    }
  });
}

/**
 * Hook for updating system settings
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  
  return useMutation<SystemSettings, AxiosError, Partial<SystemSettings>>({
    mutationFn: async (settings: Partial<SystemSettings>) => {
      console.log('🔄 useUpdateSystemSettings mutation executing with settings:', settings);
      
      try {
        const result = await systemSettingsService.updateSystemSettings(settings);
        console.log('✅ useUpdateSystemSettings mutation successful:', {
          hasId: !!result.id,
          updatedAt: result.updatedAt
        });
        return result;
      } catch (error) {
        console.error('❌ useUpdateSystemSettings mutation failed:', error);
        
        // Log additional debugging info
        console.error('🔍 System Settings Update Mutation Debug Info:', {
          settings,
          timestamp: new Date().toISOString(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });
        
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update the cached settings data
      queryClient.setQueryData(["system-settings"], data);
      console.log('🎉 System Settings Update Mutation Success:', {
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy
      });
    },
    onError: (error) => {
      console.error('🚨 System Settings Update Mutation Error:', {
        message: error.message,
        status: (error as any)?.status,
        details: (error as any)?.details
      });
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint doesn't exist)
      if ((error as any)?.status === 404) {
        console.log('🚫 Not retrying 404 error for system settings update');
        return false;
      }
      
      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
  });
}

/**
 * Hook for fetching activity logs with filters
 */
export function useActivityLogs(filters: ActivityLogFilters) {
  return useQuery<{ data: ActivityLog[]; pagination: any }, AxiosError>({
    queryKey: ["activity-logs", filters],
    queryFn: async () => {
      console.log('🔄 useActivityLogs query executing with filters:', filters);
      
      try {
        const result = await activityLogsService.getActivityLogs(filters);
        console.log('✅ useActivityLogs query successful:', {
          dataLength: result.data?.length || 0,
          pagination: result.pagination
        });
        return result;
      } catch (error) {
        console.error('❌ useActivityLogs query failed:', error);
        
        // Log additional debugging info
        console.error('🔍 Query Debug Info:', {
          filters,
          timestamp: new Date().toISOString(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });
        
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint not implemented)
      if (error?.status === 404) {
        console.log('🚫 Not retrying 404 error for activity logs');
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    enabled: !!filters, // Only run query when filters are provided
    // Enhanced error handling
    onError: (error) => {
      console.error('🚨 Activity Logs Query Error:', {
        message: error.message,
        status: (error as any)?.status,
        details: (error as any)?.details
      });
    },
    // Add success logging
    onSuccess: (data) => {
      console.log('🎉 Activity Logs Query Success:', {
        recordCount: data.data?.length || 0,
        pagination: data.pagination
      });
    }
  });
}