/**
 * Cache Manager Utility
 * Provides centralized cache management for all services
 */

import { unifiedUserService } from '../services/unifiedUser';
import { accurateDashboardService } from '../services/accurateDashboard';

export class CacheManager {
  /**
   * Clear all service caches
   */
  static clearAllCaches(): void {
    
    try {
      unifiedUserService.clearCache();
      accurateDashboardService.clearCache();
      
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
    }
  }

  /**
   * Clear user-related caches only
   */
  static clearUserCaches(): void {
    
    try {
      unifiedUserService.clearCache();
    } catch (error) {
      console.error('❌ Error clearing user caches:', error);
    }
  }

  /**
   * Clear dashboard-related caches only
   */
  static clearDashboardCaches(): void {
    
    try {
      accurateDashboardService.clearCache();
    } catch (error) {
      console.error('❌ Error clearing dashboard caches:', error);
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { message: string } {
    // This is a simple implementation - in a real app you might want more detailed stats
    return {
      message: 'Cache statistics: Services have individual cache management. Use clearAllCaches() to reset.'
    };
  }
}

// Export the CacheManager class
export { CacheManager };