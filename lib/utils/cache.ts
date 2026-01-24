/**
 * Caching Utilities for HQ Dashboard Enhancements
 * Provides in-memory caching for ratings data and performance metrics
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Set a cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Get a cache entry if it's still valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const isExpired = (now - entry.timestamp) > entry.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton cache manager
export const cacheManager = new CacheManager();

// Cache key generators
export const CacheKeys = {
  // Ratings cache keys
  LEADERBOARD: (type?: string, period?: string, limit?: number) => 
    `leaderboard:${type || 'all'}:${period || 'monthly'}:${limit || 10}`,
  
  BRANCH_RATING: (branchName: string, period?: string, type?: string) =>
    `branch_rating:${branchName}:${period || 'monthly'}:${type || 'all'}`,
  
  CURRENT_RATINGS: (period: string) =>
    `current_ratings:${period}`,
  
  RATING_CALCULATION: (period: string, date: string) =>
    `rating_calculation:${period}:${date}`,

  // Reports cache keys
  BRANCH_AGGREGATES: (filters?: Record<string, any>) =>
    `branch_aggregates:${JSON.stringify(filters || {})}`,
  
  REPORT_STATISTICS: (filters?: Record<string, any>) =>
    `report_statistics:${JSON.stringify(filters || {})}`,

  // Dashboard cache keys
  DASHBOARD_KPIS: () => 'dashboard_kpis',
  
  PERFORMANCE_STATS: () => 'performance_stats'
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  RATINGS_DATA: 60000,      // 1 minute for ratings data
  LEADERBOARD: 60000,       // 1 minute for leaderboard
  BRANCH_AGGREGATES: 30000, // 30 seconds for branch aggregates
  DASHBOARD_KPIS: 300000,   // 5 minutes for dashboard KPIs
  PERFORMANCE_STATS: 300000 // 5 minutes for performance statistics
};

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  cacheManager.clearExpired();
}, 300000);