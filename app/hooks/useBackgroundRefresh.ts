'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export interface BackgroundRefreshConfig {
  interval?: number; // Refresh interval in milliseconds
  enabled?: boolean; // Whether background refresh is enabled
  refreshOnFocus?: boolean; // Refresh when window gains focus
  refreshOnReconnect?: boolean; // Refresh when network reconnects
  refreshOnMount?: boolean; // Refresh on component mount
  staleTime?: number; // Consider data stale after this time
}

export interface UseBackgroundRefreshResult {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
  enable: () => void;
  disable: () => void;
  isEnabled: boolean;
}

export function useBackgroundRefresh(
  refreshFunction: () => Promise<void>,
  config: BackgroundRefreshConfig = {}
): UseBackgroundRefreshResult {
  const {
    interval = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refreshOnFocus = true,
    refreshOnReconnect = true,
    refreshOnMount = true,
    staleTime = 30 * 1000 // 30 seconds default
  } = config;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const refreshFunctionRef = useRef(refreshFunction);
  const isRefreshingRef = useRef(false);

  // Update ref when function changes
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  const refresh = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshingRef.current) {
      return;
    }

    try {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      
      await refreshFunctionRef.current();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Background refresh failed:', error);
      throw error;
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  const shouldRefresh = useCallback(() => {
    if (!isEnabled || isRefreshingRef.current) {
      return false;
    }

    if (!lastRefresh) {
      return true;
    }

    const now = Date.now();
    const lastRefreshTime = lastRefresh.getTime();
    
    return (now - lastRefreshTime) > staleTime;
  }, [isEnabled, lastRefresh, staleTime]);

  const conditionalRefresh = useCallback(async () => {
    if (shouldRefresh()) {
      await refresh();
    }
  }, [shouldRefresh, refresh]);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Set up interval refresh
  useEffect(() => {
    if (!isEnabled || interval <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      conditionalRefresh();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, interval, conditionalRefresh]);

  // Refresh on mount
  useEffect(() => {
    if (refreshOnMount && isEnabled) {
      refresh();
    }
  }, [refreshOnMount, isEnabled, refresh]);

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnFocus) {
      return;
    }

    const handleFocus = () => {
      conditionalRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnFocus, conditionalRefresh]);

  // Refresh on network reconnect
  useEffect(() => {
    if (!refreshOnReconnect) {
      return;
    }

    const handleOnline = () => {
      conditionalRefresh();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refreshOnReconnect, conditionalRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRefreshing,
    lastRefresh,
    refresh,
    enable,
    disable,
    isEnabled
  };
}

// Hook for background refresh with exponential backoff on errors
export function useBackgroundRefreshWithBackoff(
  refreshFunction: () => Promise<void>,
  config: BackgroundRefreshConfig & {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    ...refreshConfig
  } = config;

  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const refreshWithBackoff = useCallback(async () => {
    try {
      await refreshFunction();
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Refresh failed:', error);
      
      if (retryCount < maxRetries) {
        const delay = Math.min(
          baseDelay * Math.pow(2, retryCount),
          maxDelay
        );
        
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          refreshWithBackoff();
        }, delay);
      } else {
        console.error('Max retries reached for background refresh');
        setRetryCount(0); // Reset for next attempt
      }
    }
  }, [refreshFunction, retryCount, maxRetries, baseDelay, maxDelay]);

  const backgroundRefresh = useBackgroundRefresh(refreshWithBackoff, refreshConfig);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...backgroundRefresh,
    retryCount
  };
}

// Hook for coordinated background refresh across multiple data sources
export function useCoordinatedBackgroundRefresh(
  refreshFunctions: Record<string, () => Promise<void>>,
  config: BackgroundRefreshConfig & {
    refreshOrder?: string[]; // Order to refresh data sources
    parallelRefresh?: boolean; // Whether to refresh in parallel or sequence
  } = {}
) {
  const {
    refreshOrder = Object.keys(refreshFunctions),
    parallelRefresh = false,
    ...refreshConfig
  } = config;

  const [refreshStatus, setRefreshStatus] = useState<Record<string, {
    isRefreshing: boolean;
    lastRefresh: Date | null;
    error: Error | null;
  }>>({});

  const coordinatedRefresh = useCallback(async () => {
    const orderedFunctions = refreshOrder.map(key => ({
      key,
      fn: refreshFunctions[key]
    })).filter(({ fn }) => fn);

    if (parallelRefresh) {
      // Refresh all in parallel
      const results = await Promise.allSettled(
        orderedFunctions.map(async ({ key, fn }) => {
          setRefreshStatus(prev => ({
            ...prev,
            [key]: { ...prev[key], isRefreshing: true, error: null }
          }));
          
          try {
            await fn();
            setRefreshStatus(prev => ({
              ...prev,
              [key]: { 
                isRefreshing: false, 
                lastRefresh: new Date(), 
                error: null 
              }
            }));
          } catch (error) {
            setRefreshStatus(prev => ({
              ...prev,
              [key]: { 
                isRefreshing: false, 
                lastRefresh: prev[key]?.lastRefresh || null, 
                error: error as Error 
              }
            }));
            throw error;
          }
        })
      );

      // Check if any failed
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`${failures.length} refresh operations failed`);
      }
    } else {
      // Refresh in sequence
      for (const { key, fn } of orderedFunctions) {
        setRefreshStatus(prev => ({
          ...prev,
          [key]: { ...prev[key], isRefreshing: true, error: null }
        }));
        
        try {
          await fn();
          setRefreshStatus(prev => ({
            ...prev,
            [key]: { 
              isRefreshing: false, 
              lastRefresh: new Date(), 
              error: null 
            }
          }));
        } catch (error) {
          setRefreshStatus(prev => ({
            ...prev,
            [key]: { 
              isRefreshing: false, 
              lastRefresh: prev[key]?.lastRefresh || null, 
              error: error as Error 
            }
          }));
          throw error;
        }
      }
    }
  }, [refreshFunctions, refreshOrder, parallelRefresh]);

  const backgroundRefresh = useBackgroundRefresh(coordinatedRefresh, refreshConfig);

  const refreshSingle = useCallback(async (key: string) => {
    const fn = refreshFunctions[key];
    if (!fn) {
      throw new Error(`No refresh function found for key: ${key}`);
    }

    setRefreshStatus(prev => ({
      ...prev,
      [key]: { ...prev[key], isRefreshing: true, error: null }
    }));
    
    try {
      await fn();
      setRefreshStatus(prev => ({
        ...prev,
        [key]: { 
          isRefreshing: false, 
          lastRefresh: new Date(), 
          error: null 
        }
      }));
    } catch (error) {
      setRefreshStatus(prev => ({
        ...prev,
        [key]: { 
          isRefreshing: false, 
          lastRefresh: prev[key]?.lastRefresh || null, 
          error: error as Error 
        }
      }));
      throw error;
    }
  }, [refreshFunctions]);

  return {
    ...backgroundRefresh,
    refreshStatus,
    refreshSingle
  };
}