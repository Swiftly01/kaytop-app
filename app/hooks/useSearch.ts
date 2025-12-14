'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface SearchConfig {
  debounceMs?: number;
  minLength?: number;
  placeholder?: string;
}

export interface UseSearchResult {
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  isSearching: boolean;
  hasQuery: boolean;
}

export function useSearch(config: SearchConfig = {}): UseSearchResult {
  const {
    debounceMs = 300,
    minLength = 1
  } = config;

  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set searching state if query meets minimum length
    if (newQuery.length >= minLength) {
      setIsSearching(true);
    }

    // Debounce the query update
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(newQuery);
      setIsSearching(false);
    }, debounceMs);
  }, [debounceMs, minLength]);

  const clearQuery = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setIsSearching(false);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasQuery = debouncedQuery.length >= minLength;

  return {
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    isSearching,
    hasQuery
  };
}

// Search input component
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  isSearching?: boolean;
  className?: string;
}