'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/lib/services/reports';
import type { Report, ReportApprovalData } from '@/lib/api/types';

export interface OptimisticUpdate {
  id: string;
  type: 'approve' | 'decline' | 'update' | 'delete';
  timestamp: number;
  originalData?: Report;
  optimisticData?: Partial<Report>;
  promise?: Promise<any>;
}

export interface ConflictResolutionStrategy {
  onConflict: (
    localUpdate: OptimisticUpdate,
    serverData: Report,
    conflictType: 'version' | 'status' | 'data'
  ) => 'use_server' | 'use_local' | 'merge' | 'prompt_user';
  onResolution?: (resolution: string, finalData: Report) => void;
}

export interface UseOptimisticReportsUpdatesConfig {
  conflictResolution?: ConflictResolutionStrategy;
  maxRetries?: number;
  retryDelay?: number;
  enableOptimisticUpdates?: boolean;
}

const DEFAULT_CONFIG: Required<UseOptimisticReportsUpdatesConfig> = {
  conflictResolution: {
    onConflict: () => 'use_server', // Default to server wins
  },
  maxRetries: 3,
  retryDelay: 1000,
  enableOptimisticUpdates: true,
};

/**
 * Hook for managing optimistic updates and concurrent update conflicts
 * Provides graceful handling of simultaneous report modifications
 */
export function useOptimisticReportsUpdates(
  config: UseOptimisticReportsUpdatesConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const queryClient = useQueryClient();
  
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate>>(new Map());
  const [conflicts, setConflicts] = useState<Array<{
    update: OptimisticUpdate;
    serverData: Report;
    conflictType: 'version' | 'status' | 'data';
  }>>([]);
  
  const updateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      updateTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  /**
   * Apply optimistic update to query cache
   */
  const applyOptimisticUpdate = useCallback((
    reportId: string,
    updateType: OptimisticUpdate['type'],
    optimisticData: Partial<Report>
  ) => {
    if (!finalConfig.enableOptimisticUpdates) return;

    // Update all relevant query caches
    queryClient.setQueriesData(
      { queryKey: ['reports'] },
      (oldData: unknown) => {
        if (!oldData) return oldData;

        const data = oldData as { data?: Report[]; [key: string]: unknown };
        // Handle paginated response
        if (data.data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map((report: Report) =>
              report.id === reportId
                ? { ...report, ...optimisticData }
                : report
            ),
          };
        }

        // Handle single report
        if (oldData.id === reportId) {
          return { ...oldData, ...optimisticData };
        }

        return oldData;
      }
    );

    // Update statistics if status changed
    if (optimisticData.status) {
      queryClient.invalidateQueries({ queryKey: ['reports', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  }, [queryClient, finalConfig.enableOptimisticUpdates]);

  /**
   * Revert optimistic update
   */
  const revertOptimisticUpdate = useCallback((reportId: string, originalData: Report) => {
    queryClient.setQueriesData(
      { queryKey: ['reports'] },
      (oldData: unknown) => {
        if (!oldData) return oldData;

        const data = oldData as { data?: Report[]; id?: string; [key: string]: unknown };
        // Handle paginated response
        if (data.data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map((report: Report) =>
              report.id === reportId ? originalData : report
            ),
          };
        }

        // Handle single report
        if (data.id === reportId) {
          return originalData;
        }

        return oldData;
      }
    );

    // Refresh statistics
    queryClient.invalidateQueries({ queryKey: ['reports', 'statistics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  /**
   * Detect and handle conflicts
   */
  const handleConflict = useCallback(async (
    update: OptimisticUpdate,
    serverData: Report
  ) => {
    const conflictType = detectConflictType(update, serverData);
    
    if (!conflictType) return serverData; // No conflict

    const resolution = finalConfig.conflictResolution.onConflict(
      update,
      serverData,
      conflictType
    );

    let finalData: Report;

    switch (resolution) {
      case 'use_server':
        finalData = serverData;
        break;
      case 'use_local':
        finalData = { ...serverData, ...update.optimisticData };
        break;
      case 'merge':
        finalData = mergeReportData(serverData, update.optimisticData || {});
        break;
      case 'prompt_user':
        // Add to conflicts list for user resolution
        setConflicts(prev => [...prev, { update, serverData, conflictType }]);
        return serverData; // Use server data temporarily
      default:
        finalData = serverData;
    }

    finalConfig.conflictResolution.onResolution?.(resolution, finalData);
    return finalData;
  }, [finalConfig.conflictResolution]);

  /**
   * Execute optimistic update with conflict handling
   */
  const executeOptimisticUpdate = useCallback(async <T>(
    reportId: string,
    updateType: OptimisticUpdate['type'],
    updateFunction: () => Promise<T>,
    optimisticData: Partial<Report>
  ): Promise<T> => {
    // Get current data for potential rollback
    const currentData = queryClient.getQueryData(['reports', 'list']) as any;
    const originalReport = currentData?.data?.find((r: Report) => r.id === reportId) ||
                          queryClient.getQueryData(['reports', reportId]);

    if (!originalReport) {
      throw new Error('Report not found in cache');
    }

    const update: OptimisticUpdate = {
      id: reportId,
      type: updateType,
      timestamp: Date.now(),
      originalData: originalReport,
      optimisticData,
    };

    try {
      // Add to pending updates
      setPendingUpdates(prev => new Map(prev).set(reportId, update));

      // Apply optimistic update
      applyOptimisticUpdate(reportId, updateType, optimisticData);

      // Execute actual update
      const promise = updateFunction();
      update.promise = promise;

      const result = await promise;

      // Success - remove from pending updates
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(reportId);
        return newMap;
      });

      // Refresh data to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['reports'] });

      return result;

    } catch (error) {
      console.error(`Optimistic update failed for report ${reportId}:`, error);

      // Handle retry logic
      const retryCount = retryCountRef.current.get(reportId) || 0;
      
      if (retryCount < finalConfig.maxRetries) {
        retryCountRef.current.set(reportId, retryCount + 1);
        
        // Schedule retry with exponential backoff
        const delay = finalConfig.retryDelay * Math.pow(2, retryCount);
        const timeoutId = setTimeout(() => {
          executeOptimisticUpdate(reportId, updateType, updateFunction, optimisticData);
        }, delay);
        
        updateTimeoutRef.current.set(reportId, timeoutId);
        
        throw error; // Re-throw for immediate error handling
      }

      // Max retries reached - revert optimistic update
      revertOptimisticUpdate(reportId, originalReport);
      
      // Remove from pending updates
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(reportId);
        return newMap;
      });

      // Reset retry count
      retryCountRef.current.delete(reportId);

      throw error;
    }
  }, [
    queryClient,
    applyOptimisticUpdate,
    revertOptimisticUpdate,
    finalConfig.maxRetries,
    finalConfig.retryDelay,
  ]);

  /**
   * Optimistic approve report
   */
  const approveReportOptimistic = useCallback(async (
    reportId: string,
    approvalData: ReportApprovalData
  ) => {
    return executeOptimisticUpdate(
      reportId,
      'approve',
      () => reportsService.approveReport(reportId, approvalData),
      {
        status: 'approved',
        approvedBy: approvalData.approvedBy,
        approvedAt: new Date().toISOString(),
      }
    );
  }, [executeOptimisticUpdate]);

  /**
   * Optimistic decline report
   */
  const declineReportOptimistic = useCallback(async (
    reportId: string,
    declineData: ReportApprovalData
  ) => {
    return executeOptimisticUpdate(
      reportId,
      'decline',
      () => reportsService.declineReport(reportId, declineData),
      {
        status: 'declined',
        declineReason: declineData.comments,
        approvedBy: declineData.approvedBy,
        approvedAt: new Date().toISOString(),
      }
    );
  }, [executeOptimisticUpdate]);

  /**
   * Optimistic update report
   */
  const updateReportOptimistic = useCallback(async (
    reportId: string,
    updateData: Partial<Report>
  ) => {
    return executeOptimisticUpdate(
      reportId,
      'update',
      () => reportsService.updateReport(reportId, updateData),
      {
        ...updateData,
        updatedAt: new Date().toISOString(),
      }
    );
  }, [executeOptimisticUpdate]);

  /**
   * Optimistic delete report
   */
  const deleteReportOptimistic = useCallback(async (reportId: string) => {
    // For delete, we remove from cache optimistically
    queryClient.setQueriesData(
      { queryKey: ['reports'] },
      (oldData: unknown) => {
        if (!oldData) return oldData;

        const data = oldData as { 
          data?: Report[]; 
          pagination?: { total: number; [key: string]: unknown }; 
          [key: string]: unknown 
        };
        if (data.data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.filter((report: Report) => report.id !== reportId),
            pagination: {
              ...data.pagination,
              total: (data.pagination?.total || 0) - 1,
            },
          };
        }

        return oldData;
      }
    );

    try {
      await reportsService.deleteReport(reportId);
      // Success - refresh to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error) {
      // Revert by refreshing data
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      throw error;
    }
  }, [queryClient]);

  /**
   * Resolve user conflicts
   */
  const resolveConflict = useCallback((
    conflictIndex: number,
    resolution: 'use_server' | 'use_local' | 'merge'
  ) => {
    const conflict = conflicts[conflictIndex];
    if (!conflict) return;

    let finalData: Report;

    switch (resolution) {
      case 'use_server':
        finalData = conflict.serverData;
        break;
      case 'use_local':
        finalData = { ...conflict.serverData, ...conflict.update.optimisticData };
        break;
      case 'merge':
        finalData = mergeReportData(conflict.serverData, conflict.update.optimisticData || {});
        break;
    }

    // Update cache with resolved data
    queryClient.setQueryData(['reports', conflict.update.id], finalData);
    queryClient.invalidateQueries({ queryKey: ['reports'] });

    // Remove from conflicts
    setConflicts(prev => prev.filter((_, index) => index !== conflictIndex));

    finalConfig.conflictResolution.onResolution?.(resolution, finalData);
  }, [conflicts, queryClient, finalConfig.conflictResolution]);

  return {
    // Optimistic update functions
    approveReportOptimistic,
    declineReportOptimistic,
    updateReportOptimistic,
    deleteReportOptimistic,
    
    // State
    pendingUpdates: Array.from(pendingUpdates.values()),
    conflicts,
    hasPendingUpdates: pendingUpdates.size > 0,
    hasConflicts: conflicts.length > 0,
    
    // Conflict resolution
    resolveConflict,
    
    // Manual refresh to resolve conflicts
    refreshData: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  };
}

/**
 * Detect type of conflict between optimistic update and server data
 */
function detectConflictType(
  update: OptimisticUpdate,
  serverData: Report
): 'version' | 'status' | 'data' | null {
  if (!update.originalData) return null;

  // Check if server data has been modified since our optimistic update
  const serverUpdatedAt = new Date(serverData.updatedAt).getTime();
  const updateTimestamp = update.timestamp;

  if (serverUpdatedAt > updateTimestamp) {
    // Server has newer data
    if (update.originalData.status !== serverData.status) {
      return 'status';
    }
    if (update.originalData.updatedAt !== serverData.updatedAt) {
      return 'version';
    }
    return 'data';
  }

  return null;
}

/**
 * Merge report data intelligently
 */
function mergeReportData(serverData: Report, localChanges: Partial<Report>): Report {
  // Simple merge strategy - prefer local changes for user-editable fields
  // and server data for system-managed fields
  return {
    ...serverData,
    // User-editable fields - prefer local
    loansDispursed: localChanges.loansDispursed ?? serverData.loansDispursed,
    loansValueDispursed: localChanges.loansValueDispursed ?? serverData.loansValueDispursed,
    savingsCollected: localChanges.savingsCollected ?? serverData.savingsCollected,
    repaymentsCollected: localChanges.repaymentsCollected ?? serverData.repaymentsCollected,
    // System fields - prefer server
    status: serverData.status,
    approvedBy: serverData.approvedBy,
    approvedAt: serverData.approvedAt,
    updatedAt: serverData.updatedAt,
  };
}