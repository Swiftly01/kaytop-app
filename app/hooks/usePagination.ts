'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaginatedResponse } from '@/lib/api/types';

export interface PaginationConfig {
  initialPage?: number;
  initialLimit?: number;
  maxLimit?: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationResult<T> {
  data: T[];
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  changeLimit: (limit: number) => void;
  refresh: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination<T>(
  fetchFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  config: PaginationConfig = {}
): UsePaginationResult<T> {
  const {
    initialPage = 1,
    initialLimit = 10,
    maxLimit = 100
  } = config;

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page: number, limit: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction(page, limit);
      
      setData(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (err) {
      console.error('Pagination fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page, pagination.limit);
  }, [fetchData, pagination.limit, pagination.totalPages]);

  const changeLimit = useCallback((limit: number) => {
    const clampedLimit = Math.min(Math.max(1, limit), maxLimit);
    // Reset to page 1 when changing limit
    fetchData(1, clampedLimit);
  }, [fetchData, maxLimit]);

  const refresh = useCallback(() => {
    fetchData(pagination.page, pagination.limit);
  }, [fetchData, pagination.page, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchData(initialPage, initialLimit);
  }, [fetchData, initialPage, initialLimit]);

  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPreviousPage = pagination.page > 1;

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    changeLimit,
    refresh,
    hasNextPage,
    hasPreviousPage
  };
}