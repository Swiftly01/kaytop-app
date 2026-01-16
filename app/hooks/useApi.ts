/**
 * Custom hook for API calls with authentication and state management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export interface UseApiOptions {
  immediate?: boolean; // Whether to call the API immediately on mount
  dependencies?: any[]; // Dependencies that trigger a refetch
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = false, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logOut } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeApiCall = useCallback(async (): Promise<void> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setData(result);
      }
    } catch (err: any) {
      // Only handle error if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        console.error('API call failed:', err);
        
        // Handle authentication errors
        if (err.status === 401 || err.type === 'auth') {
          logOut();
          setError('Session expired. Please login again.');
        } else {
          setError(err.message || 'An error occurred');
        }
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apiCall, logOut]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Execute API call on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      executeApiCall();
    }
  }, [immediate, executeApiCall]);

  // Execute API call when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      executeApiCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: executeApiCall,
    reset,
  };
}

// Hook for paginated API calls
export interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginatedApiResult<T> extends UseApiResult<T[]> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePaginatedApi<T>(
  fetchFunction: (page: number, limit: number) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<T> {
  const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const apiCall = useCallback(
    () => fetchFunction(currentPage, limit),
    [fetchFunction, currentPage, limit]
  );

  const { data: response, loading, error, refetch, reset } = useApi(
    apiCall,
    {
      ...apiOptions,
      dependencies: [currentPage, limit, ...(apiOptions.dependencies || [])],
    }
  );

  // Update pagination info when response changes
  useEffect(() => {
    if (response?.pagination) {
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    }
  }, [response]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const setLimitAndReset = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  return {
    data: response?.data || null,
    loading,
    error,
    refetch,
    reset,
    currentPage,
    totalPages,
    totalItems,
    limit,
    goToPage,
    setLimit: setLimitAndReset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}