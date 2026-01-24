/**
 * Ratings Service
 * Handles branch performance ratings, leaderboard, and calculation operations
 * Uses unified API client infrastructure with proper error handling and retry mechanisms
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import { UnifiedAPIErrorHandler } from '../api/errorHandler';
import { userProfileService } from './userProfile';
import { cacheManager, CacheKeys, CacheTTL } from '../utils/cache';
import type {
  BranchRating,
  RatingCalculationParams,
  RatingCalculationResult,
  LeaderboardFilters,
  RatingPeriod,
  RatingType,
  ApiResponse,
} from '../api/types';

export interface RatingsService {
  calculateRatings(params: RatingCalculationParams): Promise<RatingCalculationResult>;
  getCurrentRatings(period: RatingPeriod): Promise<BranchRating[]>;
  getLeaderboard(filters?: LeaderboardFilters): Promise<BranchRating[]>;
  getBranchRating(branchName: string, period?: RatingPeriod, type?: RatingType): Promise<BranchRating>;
  getRatingHistory(filters: {
    branch?: string;
    type?: RatingType;
    period?: RatingPeriod;
    fromDate?: string;
    toDate?: string;
  }): Promise<BranchRating[]>;
  getCurrentPeriodString(period: RatingPeriod): Promise<string>;
}

class RatingsAPIService implements RatingsService {

  /**
   * Check if user has authorization to access ratings data
   * Only HQ managers and system admins can access ratings
   */
  private async checkRatingsAuthorization(): Promise<void> {
    try {
      const userProfile = await userProfileService.getUserProfile();

      // Only HQ managers and system admins can access ratings
      if (userProfile.role !== 'hq_manager' && userProfile.role !== 'system_admin') {
        throw new Error(`Access denied: Role ${userProfile.role} does not have permission to access ratings data`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        throw error;
      }
      // If we can't get user profile, continue with request (backend will handle authorization)
      console.warn('Could not verify user authorization for ratings:', error);
    }
  }

  /**
   * Validate rating period enum
   */
  private validateRatingPeriod(period: string): RatingPeriod | null {
    const validPeriods: RatingPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
    if (validPeriods.includes(period as RatingPeriod)) {
      return period as RatingPeriod;
    }
    console.warn('Invalid rating period:', period);
    return null;
  }

  /**
   * Validate rating type enum
   */
  private validateRatingType(type: string): RatingType | null {
    const validTypes: RatingType[] = ['SAVINGS', 'MONEY_DISBURSED', 'LOAN_REPAYMENT'];
    if (validTypes.includes(type as RatingType)) {
      return type as RatingType;
    }
    console.warn('Invalid rating type:', type);
    return null;
  }

  /**
   * Calculate ratings for a specific period
   * Uses GET /ratings/calculate?period={period}&periodDate={date}
   * Invalidates related cache entries after successful calculation
   */
  async calculateRatings(params: RatingCalculationParams): Promise<RatingCalculationResult> {
    try {
      // Check authorization
      await this.checkRatingsAuthorization();

      // Validate period
      const validPeriod = this.validateRatingPeriod(params.period);
      if (!validPeriod) {
        throw new Error(`Invalid period: ${params.period}. Must be one of: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY`);
      }

      const urlParams = new URLSearchParams();
      urlParams.append('period', validPeriod);
      
      if (params.periodDate) {
        urlParams.append('periodDate', params.periodDate);
      }

      const url = `${API_ENDPOINTS.RATINGS.CALCULATE}?${urlParams.toString()}`;
      console.log('🔄 Calculating ratings:', url);

      const response: ApiResponse<RatingCalculationResult> = await apiClient.get(url);

      // Invalidate related cache entries after successful calculation
      if (response.data.success) {
        console.log('🗑️ Invalidating ratings cache after successful calculation');
        
        // Clear all leaderboard cache entries
        const cacheStats = cacheManager.getStats();
        cacheStats.keys.forEach(key => {
          if (key.startsWith('leaderboard:') || 
              key.startsWith('branch_rating:') || 
              key.startsWith('current_ratings:')) {
            cacheManager.delete(key);
          }
        });
        
        console.log('✅ Cache invalidated successfully');
      }

      console.log('✅ Ratings calculation completed successfully');
      
      // Ensure consistent response structure
      if (response.data && typeof response.data === 'object') {
        // If the response already has a success field, return it as-is
        if ('success' in response.data) {
          return response.data;
        }
        // Otherwise, wrap the response to indicate success
        return {
          success: true,
          ...response.data
        };
      }
      
      // Fallback for unexpected response structure
      return {
        success: true,
        message: 'Ratings calculated successfully'
      };

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Ratings calculation error:', errorMessage);
      
      // Return error result instead of throwing
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get current ratings for a specific period
   * Uses GET /ratings/current?period={period}
   */
  async getCurrentRatings(period: RatingPeriod): Promise<BranchRating[]> {
    try {
      // Check authorization
      await this.checkRatingsAuthorization();

      // Validate period
      const validPeriod = this.validateRatingPeriod(period);
      if (!validPeriod) {
        throw new Error(`Invalid period: ${period}. Must be one of: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY`);
      }

      const url = `${API_ENDPOINTS.RATINGS.CURRENT}?period=${validPeriod}`;
      const response: ApiResponse<BranchRating[]> = await apiClient.get(url);

      return response.data || [];

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Current ratings fetch error:', errorMessage);
      return [];
    }
  }

  /**
   * Get leaderboard with filtering and caching
   * Uses GET /ratings/leaderboard?type={type}&period={period}&limit={limit}
   */
  async getLeaderboard(filters: LeaderboardFilters = {}): Promise<BranchRating[]> {
    try {
      // Check authorization
      await this.checkRatingsAuthorization();

      // Check cache first
      const cacheKey = CacheKeys.LEADERBOARD(filters.type, filters.period, filters.limit);
      const cachedData = cacheManager.get<BranchRating[]>(cacheKey);
      
      if (cachedData) {
        console.log('📦 Returning cached leaderboard data');
        return cachedData;
      }

      const params = new URLSearchParams();

      // Validate and add type filter
      if (filters.type) {
        const validType = this.validateRatingType(filters.type);
        if (validType) {
          params.append('type', validType);
        } else {
          console.warn('Invalid type filter, skipping:', filters.type);
        }
      }

      // Validate and add period filter
      if (filters.period) {
        const validPeriod = this.validateRatingPeriod(filters.period);
        if (validPeriod) {
          params.append('period', validPeriod);
        } else {
          console.warn('Invalid period filter, skipping:', filters.period);
        }
      }

      // Add limit filter
      if (filters.limit && filters.limit > 0) {
        params.append('limit', filters.limit.toString());
      }

      const url = `${API_ENDPOINTS.RATINGS.LEADERBOARD}${params.toString() ? `?${params.toString()}` : ''}`;
      const response: ApiResponse<BranchRating[]> = await apiClient.get(url);

      const data = response.data || [];
      
      // Cache the result
      cacheManager.set(cacheKey, data, CacheTTL.LEADERBOARD);
      console.log('💾 Cached leaderboard data');

      return data;

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Leaderboard fetch error:', errorMessage);
      return [];
    }
  }

  /**
   * Get rating for a specific branch with caching
   * Uses GET /ratings/branch/{branchName} with optional filters
   */
  async getBranchRating(branchName: string, period?: RatingPeriod, type?: RatingType): Promise<BranchRating> {
    try {
      // Check authorization
      await this.checkRatingsAuthorization();

      // Validate branch name
      if (!branchName || branchName.trim().length === 0) {
        throw new Error('Branch name is required');
      }

      // Check cache first
      const cacheKey = CacheKeys.BRANCH_RATING(branchName, period, type);
      const cachedData = cacheManager.get<BranchRating>(cacheKey);
      
      if (cachedData) {
        console.log('📦 Returning cached branch rating data');
        return cachedData;
      }

      const params = new URLSearchParams();

      // Validate and add period filter
      if (period) {
        const validPeriod = this.validateRatingPeriod(period);
        if (validPeriod) {
          params.append('period', validPeriod);
        }
      }

      // Validate and add type filter
      if (type) {
        const validType = this.validateRatingType(type);
        if (validType) {
          params.append('type', validType);
        }
      }

      const url = `${API_ENDPOINTS.RATINGS.BRANCH(branchName.trim())}${params.toString() ? `?${params.toString()}` : ''}`;
      const response: ApiResponse<BranchRating> = await apiClient.get(url);

      // Cache the result
      cacheManager.set(cacheKey, response.data, CacheTTL.RATINGS_DATA);
      console.log('💾 Cached branch rating data');

      return response.data;

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error(`Branch rating fetch error for ${branchName}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Get rating history with filters
   * Uses GET /ratings/history with query parameters
   */
  async getRatingHistory(filters: {
    branch?: string;
    type?: RatingType;
    period?: RatingPeriod;
    fromDate?: string;
    toDate?: string;
  }): Promise<BranchRating[]> {
    try {
      // Check authorization
      await this.checkRatingsAuthorization();

      const params = new URLSearchParams();

      // Add branch filter
      if (filters.branch && filters.branch.trim().length > 0) {
        params.append('branch', filters.branch.trim());
      }

      // Validate and add type filter
      if (filters.type) {
        const validType = this.validateRatingType(filters.type);
        if (validType) {
          params.append('type', validType);
        }
      }

      // Validate and add period filter
      if (filters.period) {
        const validPeriod = this.validateRatingPeriod(filters.period);
        if (validPeriod) {
          params.append('period', validPeriod);
        }
      }

      // Add date filters
      if (filters.fromDate) {
        params.append('fromDate', filters.fromDate);
      }
      if (filters.toDate) {
        params.append('toDate', filters.toDate);
      }

      const url = `${API_ENDPOINTS.RATINGS.HISTORY}${params.toString() ? `?${params.toString()}` : ''}`;
      const response: ApiResponse<BranchRating[]> = await apiClient.get(url);

      return response.data || [];

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Rating history fetch error:', errorMessage);
      return [];
    }
  }

  /**
   * Get current period string for a specific period type
   * Uses GET /ratings/periods/current?period={period}
   */
  async getCurrentPeriodString(period: RatingPeriod): Promise<string> {
    try {
      // Check authorization
      await this.checkRatingsAuthorization();

      // Validate period
      const validPeriod = this.validateRatingPeriod(period);
      if (!validPeriod) {
        throw new Error(`Invalid period: ${period}. Must be one of: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY`);
      }

      const url = `${API_ENDPOINTS.RATINGS.PERIODS_CURRENT}?period=${validPeriod}`;
      const response: ApiResponse<{ currentPeriod: string }> = await apiClient.get(url);

      return response.data.currentPeriod || '';

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Current period fetch error:', errorMessage);
      return '';
    }
  }
}

// Export singleton instance
export const ratingsService = new RatingsAPIService();