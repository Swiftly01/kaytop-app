'use client';

import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface UseSortingResult<T> {
  sortConfig: SortConfig<T> | null;
  sortedData: T[];
  requestSort: (key: keyof T) => void;
  clearSort: () => void;
  getSortDirection: (key: keyof T) => SortDirection | null;
}

export function useSorting<T>(
  data: T[],
  initialSort?: SortConfig<T>
): UseSortingResult<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort || null);

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Handle boolean values
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        const comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const requestSort = useCallback((key: keyof T) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        // Toggle direction if same key
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // New key, default to ascending
        return {
          key,
          direction: 'asc'
        };
      }
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  const getSortDirection = useCallback((key: keyof T): SortDirection | null => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction;
    }
    return null;
  }, [sortConfig]);

  return {
    sortConfig,
    sortedData,
    requestSort,
    clearSort,
    getSortDirection
  };
}

// Sortable table header component
export interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: SortConfig<any> | null;
  onSort: (key: string) => void;
  className?: string;
}