'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface CacheConfig {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface UseCacheResult<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, customTtl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  isExpired: (key: string) => boolean;
  size: number;
  keys: () => string[];
}

export function useCache<T>(config: CacheConfig = {}): UseCacheResult<T> {
  const {
    maxSize = 100,
    ttl = 5 * 60 * 1000, // 5 minutes default
    staleWhileRevalidate = false
  } = config;

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [, forceUpdate] = useState({});

  // Force re-render when cache changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Clean up expired entries
  const cleanup = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key);
      }
    }
    
    // If cache is still too large, remove oldest entries
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, cache.size - maxSize);
      toRemove.forEach(([key]) => cache.delete(key));
    }
    
    triggerUpdate();
  }, [maxSize, triggerUpdate]);

  const get = useCallback((key: string): T | null => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    
    if (now > entry.expiresAt) {
      if (!staleWhileRevalidate) {
        cache.delete(key);
        triggerUpdate();
        return null;
      }
      // Return stale data but mark for cleanup
      setTimeout(cleanup, 0);
    }
    
    return entry.data;
  }, [staleWhileRevalidate, cleanup, triggerUpdate]);

  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const cache = cacheRef.current;
    const now = Date.now();
    const entryTtl = customTtl ?? ttl;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + entryTtl
    };
    
    cache.set(key, entry);
    
    // Trigger cleanup if needed
    if (cache.size > maxSize) {
      cleanup();
    } else {
      triggerUpdate();
    }
  }, [ttl, maxSize, cleanup, triggerUpdate]);

  const remove = useCallback((key: string) => {
    const cache = cacheRef.current;
    const deleted = cache.delete(key);
    
    if (deleted) {
      triggerUpdate();
    }
    
    return deleted;
  }, [triggerUpdate]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    triggerUpdate();
  }, [triggerUpdate]);

  const has = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const now = Date.now();
    if (now > entry.expiresAt && !staleWhileRevalidate) {
      cache.delete(key);
      triggerUpdate();
      return false;
    }
    
    return true;
  }, [staleWhileRevalidate, triggerUpdate]);

  const isExpired = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) {
      return true;
    }
    
    return Date.now() > entry.expiresAt;
  }, []);

  const keys = useCallback((): string[] => {
    return Array.from(cacheRef.current.keys());
  }, []);

  const size = cacheRef.current.size;

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(cleanup, ttl);
    return () => clearInterval(interval);
  }, [cleanup, ttl]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    isExpired,
    size,
    keys
  };
}

// Hook for caching API responses
export function useApiCache<T>(config: CacheConfig = {}) {
  const cache = useCache<T>(config);
  
  const getCachedOrFetch = useCallback(async (
    key: string,
    fetchFunction: () => Promise<T>,
    customTtl?: number
  ): Promise<T> => {
    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch and cache
    const data = await fetchFunction();
    cache.set(key, data, customTtl);
    
    return data;
  }, [cache]);

  const invalidate = useCallback((pattern?: string | RegExp) => {
    if (!pattern) {
      cache.clear();
      return;
    }
    
    const keys = cache.keys();
    const keysToRemove = keys.filter(key => {
      if (typeof pattern === 'string') {
        return key.includes(pattern);
      } else {
        return pattern.test(key);
      }
    });
    
    keysToRemove.forEach(key => cache.remove(key));
  }, [cache]);

  return {
    ...cache,
    getCachedOrFetch,
    invalidate
  };
}

// Hook for request deduplication
export function useRequestDeduplication() {
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const deduplicate = useCallback(async <T>(
    key: string,
    requestFunction: () => Promise<T>
  ): Promise<T> => {
    const pending = pendingRequests.current.get(key);
    
    if (pending) {
      return pending;
    }
    
    const request = requestFunction().finally(() => {
      pendingRequests.current.delete(key);
    });
    
    pendingRequests.current.set(key, request);
    
    return request;
  }, []);

  const cancel = useCallback((key: string) => {
    pendingRequests.current.delete(key);
  }, []);

  const cancelAll = useCallback(() => {
    pendingRequests.current.clear();
  }, []);

  return {
    deduplicate,
    cancel,
    cancelAll,
    pendingCount: pendingRequests.current.size
  };
}

// Combined hook for optimized API requests
export function useOptimizedApi<T>(config: CacheConfig = {}) {
  const apiCache = useApiCache<T>(config);
  const deduplication = useRequestDeduplication();

  const optimizedFetch = useCallback(async (
    key: string,
    fetchFunction: () => Promise<T>,
    options: {
      useCache?: boolean;
      deduplicate?: boolean;
      customTtl?: number;
    } = {}
  ): Promise<T> => {
    const {
      useCache = true,
      deduplicate = true,
      customTtl
    } = options;

    const actualFetch = deduplicate 
      ? () => deduplication.deduplicate(key, fetchFunction)
      : fetchFunction;

    if (useCache) {
      return apiCache.getCachedOrFetch(key, actualFetch, customTtl);
    } else {
      return actualFetch();
    }
  }, [apiCache, deduplication]);

  return {
    fetch: optimizedFetch,
    cache: apiCache,
    deduplication
  };
}