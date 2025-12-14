'use client';

import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdate<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
}

export interface UseOptimisticUpdatesConfig {
  rollbackTimeout?: number; // Auto-rollback after timeout
}

export interface UseOptimisticUpdatesResult<T> {
  data: T[];
  pendingUpdates: OptimisticUpdate<T>[];
  
  // Optimistic operations
  optimisticCreate: (item: T, serverUpdate: () => Promise<T>) => Promise<T>;
  optimisticUpdate: (id: string | number, updates: Partial<T>, serverUpdate: () => Promise<T>) => Promise<T>;
  optimisticDelete: (id: string | number, serverUpdate: () => Promise<void>) => Promise<void>;
  
  // Manual control
  applyOptimisticUpdate: (update: OptimisticUpdate<T>) => void;
  rollbackUpdate: (updateId: string) => void;
  rollbackAll: () => void;
  
  // State management
  setBaseData: (data: T[]) => void;
  hasPendingUpdates: boolean;
}

export function useOptimisticUpdates<T extends { id: string | number }>(
  initialData: T[] = [],
  config: UseOptimisticUpdatesConfig = {}
): UseOptimisticUpdatesResult<T> {
  const { rollbackTimeout = 30000 } = config; // 30 seconds default

  const [baseData, setBaseData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<T>[]>([]);
  const rollbackTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Apply pending updates to base data
  const data = baseData.reduce((acc, item) => {
    let currentItem = item;
    
    // Apply all pending updates for this item
    pendingUpdates.forEach(update => {
      if (update.type === 'update' && update.data.id === item.id) {
        currentItem = { ...currentItem, ...update.data };
      } else if (update.type === 'delete' && update.data.id === item.id) {
        return acc; // Skip deleted items
      }
    });
    
    acc.push(currentItem);
    return acc;
  }, [] as T[]).concat(
    // Add optimistically created items
    pendingUpdates
      .filter(update => update.type === 'create')
      .map(update => update.data)
  );

  const generateUpdateId = useCallback(() => {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const applyOptimisticUpdate = useCallback((update: OptimisticUpdate<T>) => {
    setPendingUpdates(prev => [...prev, update]);
    
    // Set rollback timer if configured
    if (rollbackTimeout > 0) {
      const timer = setTimeout(() => {
        rollbackUpdate(update.id);
      }, rollbackTimeout);
      
      rollbackTimers.current.set(update.id, timer);
    }
  }, [rollbackTimeout]);

  const rollbackUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== updateId));
    
    // Clear rollback timer
    const timer = rollbackTimers.current.get(updateId);
    if (timer) {
      clearTimeout(timer);
      rollbackTimers.current.delete(updateId);
    }
  }, []);

  const rollbackAll = useCallback(() => {
    setPendingUpdates([]);
    
    // Clear all rollback timers
    rollbackTimers.current.forEach(timer => clearTimeout(timer));
    rollbackTimers.current.clear();
  }, []);

  const confirmUpdate = useCallback((updateId: string, serverData?: T) => {
    setPendingUpdates(prev => {
      const update = prev.find(u => u.id === updateId);
      if (!update) return prev;

      // If server returned data, update base data
      if (serverData && (update.type === 'create' || update.type === 'update')) {
        setBaseData(prevBase => {
          if (update.type === 'create') {
            return [...prevBase, serverData];
          } else {
            return prevBase.map(item => 
              item.id === serverData.id ? serverData : item
            );
          }
        });
      } else if (update.type === 'delete') {
        setBaseData(prevBase => 
          prevBase.filter(item => item.id !== update.data.id)
        );
      }

      // Remove the pending update
      return prev.filter(u => u.id !== updateId);
    });

    // Clear rollback timer
    const timer = rollbackTimers.current.get(updateId);
    if (timer) {
      clearTimeout(timer);
      rollbackTimers.current.delete(updateId);
    }
  }, []);

  const optimisticCreate = useCallback(async (
    item: T,
    serverUpdate: () => Promise<T>
  ): Promise<T> => {
    const updateId = generateUpdateId();
    const optimisticItem = { ...item, id: item.id || updateId };
    
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'create',
      data: optimisticItem,
      timestamp: Date.now()
    };

    applyOptimisticUpdate(update);

    try {
      const serverResult = await serverUpdate();
      confirmUpdate(updateId, serverResult);
      return serverResult;
    } catch (error) {
      rollbackUpdate(updateId);
      throw error;
    }
  }, [generateUpdateId, applyOptimisticUpdate, confirmUpdate, rollbackUpdate]);

  const optimisticUpdate = useCallback(async (
    id: string | number,
    updates: Partial<T>,
    serverUpdate: () => Promise<T>
  ): Promise<T> => {
    const updateId = generateUpdateId();
    const existingItem = baseData.find(item => item.id === id);
    
    if (!existingItem) {
      throw new Error(`Item with id ${id} not found`);
    }

    const optimisticItem = { ...existingItem, ...updates };
    
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'update',
      data: optimisticItem,
      originalData: existingItem,
      timestamp: Date.now()
    };

    applyOptimisticUpdate(update);

    try {
      const serverResult = await serverUpdate();
      confirmUpdate(updateId, serverResult);
      return serverResult;
    } catch (error) {
      rollbackUpdate(updateId);
      throw error;
    }
  }, [baseData, generateUpdateId, applyOptimisticUpdate, confirmUpdate, rollbackUpdate]);

  const optimisticDelete = useCallback(async (
    id: string | number,
    serverUpdate: () => Promise<void>
  ): Promise<void> => {
    const updateId = generateUpdateId();
    const existingItem = baseData.find(item => item.id === id);
    
    if (!existingItem) {
      throw new Error(`Item with id ${id} not found`);
    }

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'delete',
      data: existingItem,
      originalData: existingItem,
      timestamp: Date.now()
    };

    applyOptimisticUpdate(update);

    try {
      await serverUpdate();
      confirmUpdate(updateId);
    } catch (error) {
      rollbackUpdate(updateId);
      throw error;
    }
  }, [baseData, generateUpdateId, applyOptimisticUpdate, confirmUpdate, rollbackUpdate]);

  const hasPendingUpdates = pendingUpdates.length > 0;

  return {
    data,
    pendingUpdates,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    applyOptimisticUpdate,
    rollbackUpdate,
    rollbackAll,
    setBaseData,
    hasPendingUpdates
  };
}

// Hook for optimistic updates with automatic retry
export function useOptimisticUpdatesWithRetry<T extends { id: string | number }>(
  initialData: T[] = [],
  config: UseOptimisticUpdatesConfig & {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, ...optimisticConfig } = config;
  const optimistic = useOptimisticUpdates(initialData, optimisticConfig);

  const withRetry = useCallback(async <R>(
    operation: () => Promise<R>,
    retries = maxRetries
  ): Promise<R> => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return withRetry(operation, retries - 1);
      }
      throw error;
    }
  }, [maxRetries, retryDelay]);

  const optimisticCreateWithRetry = useCallback(async (
    item: T,
    serverUpdate: () => Promise<T>
  ): Promise<T> => {
    return optimistic.optimisticCreate(item, () => withRetry(serverUpdate));
  }, [optimistic, withRetry]);

  const optimisticUpdateWithRetry = useCallback(async (
    id: string | number,
    updates: Partial<T>,
    serverUpdate: () => Promise<T>
  ): Promise<T> => {
    return optimistic.optimisticUpdate(id, updates, () => withRetry(serverUpdate));
  }, [optimistic, withRetry]);

  const optimisticDeleteWithRetry = useCallback(async (
    id: string | number,
    serverUpdate: () => Promise<void>
  ): Promise<void> => {
    return optimistic.optimisticDelete(id, () => withRetry(serverUpdate));
  }, [optimistic, withRetry]);

  return {
    ...optimistic,
    optimisticCreate: optimisticCreateWithRetry,
    optimisticUpdate: optimisticUpdateWithRetry,
    optimisticDelete: optimisticDeleteWithRetry
  };
}