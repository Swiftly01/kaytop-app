'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortConfig } from './useSorting';

export interface UrlSyncConfig<F extends Record<string, any>> {
  // Which parameters to sync
  syncPagination?: boolean;
  syncFilters?: boolean;
  syncSearch?: boolean;
  syncSort?: boolean;
  
  // Parameter names
  pageParam?: string;
  limitParam?: string;
  searchParam?: string;
  sortKeyParam?: string;
  sortDirectionParam?: string;
  
  // Filter parameter mapping
  filterParams?: Partial<Record<keyof F, string>>;
  
  // Debounce URL updates
  debounceMs?: number;
}

export interface UrlSyncState<T, F extends Record<string, any>> {
  page: number;
  limit: number;
  search: string;
  filters: Partial<F>;
  sort: SortConfig<T> | null;
}

export function useUrlSync<T, F extends Record<string, any>>(
  state: {
    pagination: { page: number; limit: number };
    searchQuery: string;
    filters: F;
    sortConfig: SortConfig<T> | null;
  },
  config: UrlSyncConfig<F> = {}
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    syncPagination = true,
    syncFilters = true,
    syncSearch = true,
    syncSort = true,
    pageParam = 'page',
    limitParam = 'limit',
    searchParam = 'search',
    sortKeyParam = 'sortKey',
    sortDirectionParam = 'sortDir',
    filterParams = {},
    debounceMs = 300
  } = config;

  // Update URL when state changes
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Pagination
    if (syncPagination) {
      if (state.pagination.page > 1) {
        params.set(pageParam, state.pagination.page.toString());
      } else {
        params.delete(pageParam);
      }
      
      if (state.pagination.limit !== 10) { // Default limit
        params.set(limitParam, state.pagination.limit.toString());
      } else {
        params.delete(limitParam);
      }
    }
    
    // Search
    if (syncSearch) {
      if (state.searchQuery.trim()) {
        params.set(searchParam, state.searchQuery);
      } else {
        params.delete(searchParam);
      }
    }
    
    // Filters
    if (syncFilters) {
      Object.entries(state.filters).forEach(([key, value]) => {
        const paramName = (filterParams as any)[key] || key;
        
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(paramName, value.join(','));
            } else {
              params.delete(paramName);
            }
          } else {
            params.set(paramName, String(value));
          }
        } else {
          params.delete(paramName);
        }
      });
    }
    
    // Sort
    if (syncSort && state.sortConfig) {
      params.set(sortKeyParam, String(state.sortConfig.key));
      params.set(sortDirectionParam, state.sortConfig.direction);
    } else if (syncSort) {
      params.delete(sortKeyParam);
      params.delete(sortDirectionParam);
    }
    
    // Update URL without causing navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (newUrl !== window.location.href) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    router,
    searchParams,
    state,
    syncPagination,
    syncFilters,
    syncSearch,
    syncSort,
    pageParam,
    limitParam,
    searchParam,
    sortKeyParam,
    sortDirectionParam,
    filterParams
  ]);

  // Debounced URL update
  useEffect(() => {
    const timeoutId = setTimeout(updateUrl, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [updateUrl, debounceMs]);

  // Parse initial state from URL
  const parseFromUrl = useCallback((): Partial<UrlSyncState<T, F>> => {
    const result: Partial<UrlSyncState<T, F>> = {};
    
    // Pagination
    if (syncPagination) {
      const page = searchParams.get(pageParam);
      const limit = searchParams.get(limitParam);
      
      if (page) {
        const pageNum = parseInt(page, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          result.page = pageNum;
        }
      }
      
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          result.limit = limitNum;
        }
      }
    }
    
    // Search
    if (syncSearch) {
      const search = searchParams.get(searchParam);
      if (search) {
        result.search = search;
      }
    }
    
    // Filters
    if (syncFilters) {
      const filters: Partial<F> = {};
      
      Object.entries(filterParams).forEach(([filterKey, paramName]) => {
        const value = searchParams.get(paramName);
        if (value) {
          // Try to parse as array first
          if (value.includes(',')) {
            filters[filterKey as keyof F] = value.split(',') as F[keyof F];
          } else {
            filters[filterKey as keyof F] = value as F[keyof F];
          }
        }
      });
      
      if (Object.keys(filters).length > 0) {
        result.filters = filters;
      }
    }
    
    // Sort
    if (syncSort) {
      const sortKey = searchParams.get(sortKeyParam);
      const sortDirection = searchParams.get(sortDirectionParam);
      
      if (sortKey && (sortDirection === 'asc' || sortDirection === 'desc')) {
        result.sort = {
          key: sortKey as keyof T,
          direction: sortDirection
        };
      }
    }
    
    return result;
  }, [
    searchParams,
    syncPagination,
    syncFilters,
    syncSearch,
    syncSort,
    pageParam,
    limitParam,
    searchParam,
    sortKeyParam,
    sortDirectionParam,
    filterParams
  ]);

  return {
    parseFromUrl,
    updateUrl
  };
}

// Hook for initializing state from URL
export function useInitialStateFromUrl<T, F extends Record<string, any>>(
  defaultState: {
    page: number;
    limit: number;
    search: string;
    filters: F;
    sort: SortConfig<T> | null;
  },
  config: UrlSyncConfig<F> = {}
): Partial<UrlSyncState<T, F>> {
  const searchParams = useSearchParams();
  
  const {
    syncPagination = true,
    syncFilters = true,
    syncSearch = true,
    syncSort = true,
    pageParam = 'page',
    limitParam = 'limit',
    searchParam = 'search',
    sortKeyParam = 'sortKey',
    sortDirectionParam = 'sortDir',
    filterParams = {}
  } = config;

  const parseFromUrl = useCallback((): Partial<UrlSyncState<T, F>> => {
    const result: Partial<UrlSyncState<T, F>> = {};
    
    // Pagination
    if (syncPagination) {
      const page = searchParams.get(pageParam);
      const limit = searchParams.get(limitParam);
      
      if (page) {
        const pageNum = parseInt(page, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          result.page = pageNum;
        }
      }
      
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          result.limit = limitNum;
        }
      }
    }
    
    // Search
    if (syncSearch) {
      const search = searchParams.get(searchParam);
      if (search) {
        result.search = search;
      }
    }
    
    // Filters
    if (syncFilters) {
      const filters: Partial<F> = {};
      
      Object.entries(filterParams).forEach(([filterKey, paramName]) => {
        const value = searchParams.get(paramName);
        if (value) {
          // Try to parse as array first
          if (value.includes(',')) {
            filters[filterKey as keyof F] = value.split(',') as F[keyof F];
          } else {
            filters[filterKey as keyof F] = value as F[keyof F];
          }
        }
      });
      
      if (Object.keys(filters).length > 0) {
        result.filters = filters;
      }
    }
    
    // Sort
    if (syncSort) {
      const sortKey = searchParams.get(sortKeyParam);
      const sortDirection = searchParams.get(sortDirectionParam);
      
      if (sortKey && (sortDirection === 'asc' || sortDirection === 'desc')) {
        result.sort = {
          key: sortKey as keyof T,
          direction: sortDirection
        };
      }
    }
    
    return result;
  }, [
    searchParams,
    syncPagination,
    syncFilters,
    syncSearch,
    syncSort,
    pageParam,
    limitParam,
    searchParam,
    sortKeyParam,
    sortDirectionParam,
    filterParams
  ]);

  return parseFromUrl();
}