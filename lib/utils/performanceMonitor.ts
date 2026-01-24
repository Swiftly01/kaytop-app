/**
 * Performance Monitor Utility
 * Tracks API call performance and caching effectiveness
 */

interface PerformanceMetrics {
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  totalRequestTime: number;
  averageRequestTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalRequestTime: 0,
    averageRequestTime: 0
  };

  private requestTimers = new Map<string, number>();

  /**
   * Start timing a request
   */
  startRequest(requestId: string): void {
    this.requestTimers.set(requestId, performance.now());
  }

  /**
   * End timing a request and record metrics
   */
  endRequest(requestId: string, wasFromCache: boolean = false): void {
    const startTime = this.requestTimers.get(requestId);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.requestTimers.delete(requestId);

    this.metrics.apiCalls++;
    this.metrics.totalRequestTime += duration;
    this.metrics.averageRequestTime = this.metrics.totalRequestTime / this.metrics.apiCalls;

    if (wasFromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics & { cacheHitRate: number } {
    const cacheHitRate = this.metrics.apiCalls > 0 
      ? (this.metrics.cacheHits / this.metrics.apiCalls) * 100 
      : 0;

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalRequestTime: 0,
      averageRequestTime: 0
    };
    this.requestTimers.clear();
  }

  /**
   * Log current performance summary
   */
  logSummary(): void {
    this.getMetrics();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

if (typeof window !== 'undefined') {
  (window as Window & { performanceMonitor?: typeof performanceMonitor }).performanceMonitor = performanceMonitor;
}