'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearch } from './useSearch';
import { useFiltering } from './useFiltering';
import { useSorting, SortConfig } from './useSorting';
import type { PaginatedResponse } from '@/lib/api/types';

export interface DataTableConfig<T, F extends Record<string, any>> {
  // Pagination
  initialPage?: number;
  initialLimit?: number;
  
  // Filtering
  defaultFilters: F;
  
  // Sorting
  initialSort?: SortConfig<T>;
  
  // Search
  searchConfig?: {
    debounceMs?: number;
    minLength?: number;
    searchFields?: (keyof T)[];
  };
  
  // Data fetching
  fetchFunction: (params: {
    page: number;
    limit: number;
    filters: F;
    search?: string;
    sort?: SortConfig<T>;
  }) => Promise<PaginatedResponse<T>>;
}

export interface DataTableResult<T, F extends Record<string, any>> {
  // Data
  data: T[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  goToPage: (page: number) => void;
  changeLimit: (limit: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Filtering
  filters: F;
  setFilter: (key: keyof F, value: F[keyof F]) => void;
  setFilters: (filters: Partial<F>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  applyFilters: (filters: Partial<F>) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  hasSearchQuery: boolean;
  
  // Sorting
  sortConfig: SortConfig<T> | null;
  requestSort: (key: keyof T) => void;
  clearSort: () => void;
  getSortDirection: (key: keyof T) => 'asc' | 'desc' | null;
  
  // Actions
  refresh: () => void;
  reset: () => void;
}

export function useDataTable<T, F extends Record<string, any>>(
  config: DataTableConfig<T, F>
): DataTableResult<T, F> {
  const {
    initialPage = 1,
    initialLimit = 10,
    defaultFilters,
    initialSort,
    searchConfig = {},
    fetchFunction
  } = config;

  // State
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });

  // Hooks
  const search = useSearch(searchConfig);
  const filtering = useFiltering(defaultFilters);
  const sorting = useSorting([], initialSort);

  // Fetch data function
  const fetchData = useCallback(async (params: {
    page: number;
    limit: number;
    filters: F;
    search?: string;
    sort?: SortConfig<T>;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction(params);
      
      setData(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (err) {
      console.error('Data table fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    fetchData({
      page,
      limit: pagination.limit,
      filters: filtering.filters,
      search: search.debouncedQuery || undefined,
      sort: sorting.sortConfig || undefined
    });
  }, [fetchData, pagination.limit, pagination.totalPages, filtering.filters, search.debouncedQuery, sorting.sortConfig]);

  const changeLimit = useCallback((limit: number) => {
    fetchData({
      page: 1, // Reset to first page when changing limit
      limit,
      filters: filtering.filters,
      search: search.debouncedQuery || undefined,
      sort: sorting.sortConfig || undefined
    });
  }, [fetchData, filtering.filters, search.debouncedQuery, sorting.sortConfig]);

  // Filter handlers
  const applyFilters = useCallback((newFilters: Partial<F>) => {
    filtering.setFilters(newFilters);
    
    fetchData({
      page: 1, // Reset to first page when applying filters
      limit: pagination.limit,
      filters: { ...filtering.filters, ...newFilters },
      search: search.debouncedQuery || undefined,
      sort: sorting.sortConfig || undefined
    });
  }, [fetchData, pagination.limit, filtering, search.debouncedQuery, sorting.sortConfig]);

  // Sort handler
  const requestSort = useCallback((key: keyof T) => {
    sorting.requestSort(key);
    
    // The sort will be applied in the effect below
  }, [sorting]);

  // Refresh handler
  const refresh = useCallback(() => {
    fetchData({
      page: pagination.page,
      limit: pagination.limit,
      filters: filtering.filters,
      search: search.debouncedQuery || undefined,
      sort: sorting.sortConfig || undefined
    });
  }, [fetchData, pagination.page, pagination.limit, filtering.filters, search.debouncedQuery, sorting.sortConfig]);

  // Reset handler
  const reset = useCallback(() => {
    filtering.clearFilters();
    search.clearQuery();
    sorting.clearSort();
    
    fetchData({
      page: initialPage,
      limit: initialLimit,
      filters: defaultFilters,
      search: undefined,
      sort: undefined
    });
  }, [fetchData, initialPage, initialLimit, defaultFilters, filtering, search, sorting]);

  // Effect for search changes
  useEffect(() => {
    if (search.debouncedQuery !== search.query) return; // Wait for debounce
    
    fetchData({
      page: 1, // Reset to first page when searching
      limit: pagination.limit,
      filters: filtering.filters,
      search: search.debouncedQuery || undefined,
      sort: sorting.sortConfig || undefined
    });
  }, [search.debouncedQuery, fetchData, pagination.limit, filtering.filters, sorting.sortConfig]);

  // Effect for sort changes
  useEffect(() => {
    if (!sorting.sortConfig) return;
    
    fetchData({
      page: pagination.page,
      limit: pagination.limit,
      filters: filtering.filters,
      search: search.debouncedQuery || undefined,
      sort: sorting.sortConfig
    });
  }, [sorting.sortConfig, fetchData, pagination.page, pagination.limit, filtering.filters, search.debouncedQuery]);

  // Initial fetch
  useEffect(() => {
    fetchData({
      page: initialPage,
      limit: initialLimit,
      filters: defaultFilters,
      search: undefined,
      sort: initialSort || undefined
    });
  }, []); // Only run on mount

  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPreviousPage = pagination.page > 1;

  return {
    // Data
    data,
    loading,
    error,
    
    // Pagination
    pagination,
    goToPage,
    changeLimit,
    hasNextPage,
    hasPreviousPage,
    
    // Filtering
    filters: filtering.filters,
    setFilter: filtering.setFilter,
    setFilters: filtering.setFilters,
    clearFilters: filtering.clearFilters,
    hasActiveFilters: filtering.hasActiveFilters,
    applyFilters,
    
    // Search
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    clearSearch: search.clearQuery,
    isSearching: search.isSearching,
    hasSearchQuery: search.hasQuery,
    
    // Sorting
    sortConfig: sorting.sortConfig,
    requestSort,
    clearSort: sorting.clearSort,
    getSortDirection: sorting.getSortDirection,
    
    // Actions
    refresh,
    reset
  };
}