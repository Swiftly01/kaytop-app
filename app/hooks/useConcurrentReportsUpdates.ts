'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOptimisticReportsUpdates } from './useOptimisticReportsUpdates';
import { useReportsPolling } from './useReportsPolling';
import type { Report, ReportFilters, ReportApprovalData } from '@/lib/api/types';

export interface ConcurrentUpdateConfig {
  enableOptimisticUpdates?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
  conflictResolution?: 'server_wins' | 'client_wins' | 'merge' | 'prompt_user';
  maxConcurrentUpdates?: number;
  updateTimeout?: number;
}

export interface UpdateQueue {
  id: string;
  type: 'approve' | 'decline' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const DEFAULT_CONFIG: Required<ConcurrentUpdateConfig> = {
  enableOptimisticUpdates: true,
  enablePolling: true,
  pollingInterval: 30000,
  conflictResolution: 'server_wins',
  maxConcurrentUpdates: 5,
  updateTimeout: 10000,
};

/**
 * Comprehensive hook for managing concurrent report updates
 * Combines optimistic updates, polling, and conflict resolution
 */
export function useConcurrentReportsUpdates(
  filters: ReportFilters = {},
  config: ConcurrentUpdateConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const queryClient = useQueryClient();
  
  // State for managing update queue and conflicts
  const [updateQueue, setUpdateQueue] = useState<UpdateQueue[]>([]);
  const [processingUpdates, setProcessingUpdates] = useState<Set<string>>(new Set());
  const [updateErrors, setUpdateErrors] = useState<Map<string, Error>>(new Map());
  
  const updateTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastServerSync = useRef<Date>(new Date());

  // Initialize polling and optimistic updates
  const pollingResult = useReportsPolling(filters, {
    enabled: finalConfig.enablePolling,
    pollingInterval: finalConfig.pollingInterval,
  });

  const optimisticUpdates = useOptimisticReportsUpdates({
    enableOptimisticUpdates: finalConfig.enableOptimisticUpdates,
    conflictResolution: {
      onConflict: (localUpdate, serverData, conflictType) => {
        switch (finalConfig.conflictResolution) {
          case 'server_wins':
            return 'use_server';
          case 'client_wins':
            return 'use_local';
          case 'merge':
            return 'merge';
          case 'prompt_user':
            return 'prompt_user';
          default:
            return 'use_server';
        }
      },
      onResolution: (resolution, finalData) => {
        console.log(`Conflict resolved using ${resolution}:`, finalData);
      },
    },
  });

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      updateTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  /**
   * Add update to queue with concurrency control
   */
  const queueUpdate = useCallback((
    reportId: string,
    type: UpdateQueue['type'],
    data: any
  ): string => {
    const updateId = `${type}_${reportId}_${Date.now()}`;
    
    const queueItem: UpdateQueue = {
      id: updateId,
      type,
      data: { reportId, ...data },
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    setUpdateQueue(prev => [...prev, queueItem]);
    
    // Process queue if under concurrency limit
    if (processingUpdates.size < finalConfig.maxConcurrentUpdates) {
      processNextUpdate();
    }

    return updateId;
  }, [finalConfig.maxConcurrentUpdates, processingUpdates.size]);

  /**
   * Process next update in queue
   */
  const processNextUpdate = useCallback(async () => {
    const nextUpdate = updateQueue.find(update => 
      update.status === 'pending' && !processingUpdates.has(update.id)
    );

    if (!nextUpdate) return;

    // Mark as processing
    setProcessingUpdates(prev => new Set(prev).add(nextUpdate.id));
    setUpdateQueue(prev => 
      prev.map(update => 
        update.id === nextUpdate.id 
          ? { ...update, status: 'processing' as const }
          : update
      )
    );

    // Set timeout for update
    const timeoutId = setTimeout(() => {
      handleUpdateTimeout(nextUpdate.id);
    }, finalConfig.updateTimeout);
    
    updateTimeouts.current.set(nextUpdate.id, timeoutId);

    try {
      await executeUpdate(nextUpdate);
      
      // Mark as completed
      setUpdateQueue(prev => 
        prev.map(update => 
          update.id === nextUpdate.id 
            ? { ...update, status: 'completed' as const }
            : update
        )
      );

    } catch (error) {
      console.error(`Update ${nextUpdate.id} failed:`, error);
      
      // Handle retry logic
      if (nextUpdate.retryCount < 3) {
        setUpdateQueue(prev => 
          prev.map(update => 
            update.id === nextUpdate.id 
              ? { 
                  ...update, 
                  status: 'pending' as const,
                  retryCount: update.retryCount + 1 
                }
              : update
          )
        );
      } else {
        // Max retries reached
        setUpdateQueue(prev => 
          prev.map(update => 
            update.id === nextUpdate.id 
              ? { ...update, status: 'failed' as const }
              : update
          )
        );
        
        setUpdateErrors(prev => new Map(prev).set(nextUpdate.id, error as Error));
      }
    } finally {
      // Clear timeout and processing status
      const timeout = updateTimeouts.current.get(nextUpdate.id);
      if (timeout) {
        clearTimeout(timeout);
        updateTimeouts.current.delete(nextUpdate.id);
      }
      
      setProcessingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(nextUpdate.id);
        return newSet;
      });

      // Process next update in queue
      setTimeout(processNextUpdate, 100);
    }
  }, [updateQueue, processingUpdates, finalConfig.updateTimeout]);

  /**
   * Execute individual update
   */
  const executeUpdate = useCallback(async (update: UpdateQueue) => {
    const { reportId, ...updateData } = update.data;

    switch (update.type) {
      case 'approve':
        return optimisticUpdates.approveReportOptimistic(reportId, updateData);
      case 'decline':
        return optimisticUpdates.declineReportOptimistic(reportId, updateData);
      case 'update':
        return optimisticUpdates.updateReportOptimistic(reportId, updateData);
      case 'delete':
        return optimisticUpdates.deleteReportOptimistic(reportId);
      default:
        throw new Error(`Unknown update type: ${update.type}`);
    }
  }, [optimisticUpdates]);

  /**
   * Handle update timeout
   */
  const handleUpdateTimeout = useCallback((updateId: string) => {
    console.warn(`Update ${updateId} timed out`);
    
    setUpdateQueue(prev => 
      prev.map(update => 
        update.id === updateId 
          ? { ...update, status: 'failed' as const }
          : update
      )
    );
    
    setUpdateErrors(prev => 
      new Map(prev).set(updateId, new Error('Update timed out'))
    );
    
    setProcessingUpdates(prev => {
      const newSet = new Set(prev);
      newSet.delete(updateId);
      return newSet;
    });
  }, []);

  /**
   * Detect and handle data conflicts from polling
   */
  const handlePollingConflicts = useCallback(() => {
    if (!pollingResult.reports || !pollingResult.lastUpdate) return;

    const serverUpdateTime = pollingResult.lastUpdate.getTime();
    const lastSyncTime = lastServerSync.current.getTime();

    // Check if server data is newer than our last sync
    if (serverUpdateTime > lastSyncTime) {
      // Check for conflicts with pending updates
      const conflictingUpdates = updateQueue.filter(update => {
        const reportExists = pollingResult.reports?.data.some(
          report => report.id === update.data.reportId
        );
        return update.status === 'pending' && reportExists;
      });

      if (conflictingUpdates.length > 0) {
        console.log(`Detected ${conflictingUpdates.length} potential conflicts from server updates`);
        
        // Handle conflicts based on strategy
        if (finalConfig.conflictResolution === 'server_wins') {
          // Cancel conflicting updates
          setUpdateQueue(prev => 
            prev.filter(update => !conflictingUpdates.includes(update))
          );
        }
        // Other strategies handled by optimistic updates hook
      }

      lastServerSync.current = new Date(serverUpdateTime);
    }
  }, [pollingResult.reports, pollingResult.lastUpdate, updateQueue, finalConfig.conflictResolution]);

  // Monitor polling for conflicts
  useEffect(() => {
    handlePollingConflicts();
  }, [handlePollingConflicts]);

  // Process queue when new updates are added
  useEffect(() => {
    const pendingUpdates = updateQueue.filter(update => update.status === 'pending');
    if (pendingUpdates.length > 0 && processingUpdates.size < finalConfig.maxConcurrentUpdates) {
      processNextUpdate();
    }
  }, [updateQueue, processingUpdates.size, finalConfig.maxConcurrentUpdates, processNextUpdate]);

  /**
   * Public API methods
   */
  const approveReport = useCallback(async (reportId: string, approvalData: ReportApprovalData) => {
    return queueUpdate(reportId, 'approve', approvalData);
  }, [queueUpdate]);

  const declineReport = useCallback(async (reportId: string, declineData: ReportApprovalData) => {
    return queueUpdate(reportId, 'decline', declineData);
  }, [queueUpdate]);

  const updateReport = useCallback(async (reportId: string, updateData: Partial<Report>) => {
    return queueUpdate(reportId, 'update', updateData);
  }, [queueUpdate]);

  const deleteReport = useCallback(async (reportId: string) => {
    return queueUpdate(reportId, 'delete', {});
  }, [queueUpdate]);

  const clearQueue = useCallback(() => {
    setUpdateQueue([]);
    setProcessingUpdates(new Set());
    setUpdateErrors(new Map());
    updateTimeouts.current.forEach(timeout => clearTimeout(timeout));
    updateTimeouts.current.clear();
  }, []);

  const retryFailedUpdate = useCallback((updateId: string) => {
    setUpdateQueue(prev => 
      prev.map(update => 
        update.id === updateId && update.status === 'failed'
          ? { ...update, status: 'pending' as const, retryCount: 0 }
          : update
      )
    );
    
    setUpdateErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });
  }, []);

  return {
    // Data from polling
    reports: pollingResult.reports?.data || [],
    statistics: pollingResult.statistics,
    isPolling: pollingResult.isPolling,
    lastUpdate: pollingResult.lastUpdate,
    
    // Loading states
    loading: pollingResult.reportsLoading,
    statisticsLoading: pollingResult.statisticsLoading,
    
    // Error states
    pollingError: pollingResult.reportsError,
    
    // Update operations
    approveReport,
    declineReport,
    updateReport,
    deleteReport,
    
    // Queue management
    updateQueue,
    processingUpdates: Array.from(processingUpdates),
    updateErrors,
    clearQueue,
    retryFailedUpdate,
    
    // Optimistic updates state
    pendingOptimisticUpdates: optimisticUpdates.pendingUpdates,
    conflicts: optimisticUpdates.conflicts,
    resolveConflict: optimisticUpdates.resolveConflict,
    
    // Status
    hasPendingUpdates: updateQueue.some(u => u.status === 'pending') || optimisticUpdates.hasPendingUpdates,
    hasFailedUpdates: updateQueue.some(u => u.status === 'failed'),
    hasConflicts: optimisticUpdates.hasConflicts,
    
    // Manual refresh
    refresh: pollingResult.refresh,
  };
}