'use client';

import { useState, useCallback, useMemo } from 'react';

export interface FilterConfig<T> {
  initialFilters?: Partial<T>;
  debounceMs?: number;
}

export interface UseFilteringResult<T> {
  filters: T;
  setFilter: (key: keyof T, value: T[keyof T]) => void;
  setFilters: (filters: Partial<T>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  getQueryParams: () => URLSearchParams;
  setFromQueryParams: (params: URLSearchParams) => void;
}

export function useFiltering<T extends Record<string, any>>(
  defaultFilters: T,
  config: FilterConfig<T> = {}
): UseFilteringResult<T> {
  const { initialFilters = {}, debounceMs = 300 } = config;

  const [filters, setFiltersState] = useState<T>({
    ...defaultFilters,
    ...initialFilters
  });

  const setFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, [defaultFilters]);

  const resetFilters = useCallback(() => {
    setFiltersState({
      ...defaultFilters,
      ...initialFilters
    });
  }, [defaultFilters, initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const filterValue = filters[key];
      const defaultValue = defaultFilters[key];
      
      // Handle different types of values
      if (Array.isArray(filterValue)) {
        return filterValue.length > 0;
      }
      
      if (typeof filterValue === 'string') {
        return filterValue.trim() !== '' && filterValue !== defaultValue;
      }
      
      return filterValue !== defaultValue;
    });
  }, [filters, defaultFilters]);

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    return params;
  }, [filters]);

  const setFromQueryParams = useCallback((params: URLSearchParams) => {
    const newFilters: Partial<T> = {};
    
    params.forEach((value, key) => {
      if (key in defaultFilters) {
        const defaultValue = defaultFilters[key as keyof T];
        
        if (Array.isArray(defaultValue)) {
          newFilters[key as keyof T] = value.split(',') as T[keyof T];
        } else if (typeof defaultValue === 'number') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            newFilters[key as keyof T] = numValue as T[keyof T];
          }
        } else if (typeof defaultValue === 'boolean') {
          newFilters[key as keyof T] = (value === 'true') as T[keyof T];
        } else {
          newFilters[key as keyof T] = value as T[keyof T];
        }
      }
    });
    
    setFilters(newFilters);
  }, [defaultFilters, setFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    getQueryParams,
    setFromQueryParams
  };
}

// Utility hook for combining filtering with pagination
export function useFilteredPagination<T, F extends Record<string, any>>(
  fetchFunction: (page: number, limit: number, filters: F) => Promise<any>,
  defaultFilters: F,
  config: FilterConfig<F> & { initialPage?: number; initialLimit?: number } = {}
) {
  const { initialPage = 1, initialLimit = 10, ...filterConfig } = config;
  
  const filtering = useFiltering(defaultFilters, filterConfig);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page: number, limit: number, filters: F) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction(page, limit, filters);
      
      setData(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (err) {
      console.error('Filtered pagination fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page, pagination.limit, filtering.filters);
  }, [fetchData, pagination.limit, pagination.totalPages, filtering.filters]);

  const changeLimit = useCallback((limit: number) => {
    // Reset to page 1 when changing limit
    fetchData(1, limit, filtering.filters);
  }, [fetchData, filtering.filters]);

  const applyFilters = useCallback((newFilters: Partial<F>) => {
    filtering.setFilters(newFilters);
    // Reset to page 1 when applying filters
    fetchData(1, pagination.limit, { ...filtering.filters, ...newFilters });
  }, [fetchData, pagination.limit, filtering]);

  const refresh = useCallback(() => {
    fetchData(pagination.page, pagination.limit, filtering.filters);
  }, [fetchData, pagination.page, pagination.limit, filtering.filters]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    changeLimit,
    refresh,
    applyFilters,
    ...filtering
  };
}