/**
 * System Settings Service
 * Handles system configuration management
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS, API_CONFIG } from '../api/config';
import { logAuthDebugInfo, testAuthentication } from '../debug/authDebug';
import { authenticationManager } from '../api/authManager';
import { autoFixAuthentication } from '../utils/authFix';
import type { SystemSettings } from '../api/types';

export interface SystemSettingsService {
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}

class SystemSettingsAPIService implements SystemSettingsService {
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      console.log('🔍 System Settings Request Debug:', {
        endpoint: API_ENDPOINTS.SYSTEM_SETTINGS.GET,
        baseUrl: API_CONFIG.BASE_URL,
        timestamp: new Date().toISOString()
      });

      // Enhanced authentication debugging
      console.log('🔍 Running comprehensive auth debug...');
      logAuthDebugInfo();

      // Check if user is authenticated
      const authState = authenticationManager.getAuthState();
      if (!authState.isAuthenticated || !authState.tokens?.accessToken) {
        console.error('❌ User not authenticated for System Settings request');
        console.log('🔧 Attempting to auto-fix authentication...');

        const fixResult = await autoFixAuthentication();
        if (fixResult.success) {
          console.log('✅ Authentication fixed, retrying request...');
          // Continue with the request after fixing auth
        } else {
          console.error('❌ Failed to fix authentication:', fixResult.message);
          console.error('💡 TROUBLESHOOTING: User needs to log in manually');
          console.log('🔄 Returning default system settings to prevent UI crash');
          return this.getDefaultSystemSettings();
        }
      }

      // Test authentication directly
      const authTest = await testAuthentication();
      console.log('🔍 Direct auth test result:', authTest);

      const response = await apiClient.get<SystemSettings>(
        API_ENDPOINTS.SYSTEM_SETTINGS.GET,
        { suppressErrorLog: true }
      );

      console.log('✅ System settings response received:', {
        responseType: typeof response,
        hasData: !!response,
        keys: response ? Object.keys(response) : []
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has settings fields)
        else if ((response as any).id || (response as any).appName || (response as any).version) {
          return response as unknown as SystemSettings;
        }
        // Handle empty response
        else if (Object.keys(response).length === 0) {
          console.log('📝 Empty response received, returning default system settings');
          return this.getDefaultSystemSettings();
        }
      }

      throw new Error('Failed to fetch system settings - invalid response format');
    } catch (error: any) {
      // If it's a 404 error, provide helpful guidance and return default settings
      if (error?.status === 404) {
        console.warn('⚠️ System Settings endpoint not found (404). Returning default system settings.');

        // Return default settings instead of throwing to prevent UI crash
        return this.getDefaultSystemSettings();
      }

      console.error('❌ System settings fetch error:', {
        error: error instanceof Error ? error.message : error,
        status: (error as any)?.status,
        details: (error as any)?.details,
        endpoint: API_ENDPOINTS.SYSTEM_SETTINGS.GET,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorKeys: error ? Object.keys(error) : [],
        rawError: error
      });

      throw error;
    }
  }

  /**
   * Returns default system settings when endpoint is not available
   */
  private getDefaultSystemSettings(): SystemSettings {
    return {
      id: 'default',
      globalDefaults: {
        interestRate: 15.0, // 15% default interest rate
        loanDuration: 12, // 12 months default
        maxLoanAmount: 1000000, // ₦1,000,000 max loan
        minSavingsBalance: 5000, // ₦5,000 minimum savings
      },
      reportTemplate: {
        requiredFields: ['collections', 'savings', 'customers'],
        customParameters: [],
        submissionDeadline: 'monthly',
      },
      alertRules: {
        missedPayments: true,
        missedReports: true,
        dailyEmailSummary: false,
        customAlerts: [],
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
      },
      security: {
        sessionTimeout: 3600, // 1 hour
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          requireUppercase: true,
        },
        twoFactorAuth: {
          enabled: false,
          methods: [],
        },
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    } as SystemSettings;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      console.log('🔍 System Settings Update Debug:', {
        endpoint: API_ENDPOINTS.SYSTEM_SETTINGS.UPDATE,
        settings,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.put<SystemSettings>(
        API_ENDPOINTS.SYSTEM_SETTINGS.UPDATE,
        settings
      );

      console.log('✅ System settings update response received:', {
        responseType: typeof response,
        hasData: !!response,
        keys: response ? Object.keys(response) : []
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has settings fields)
        else if ((response as any).id || (response as any).globalDefaults) {
          return response as unknown as SystemSettings;
        }
      }

      throw new Error('Failed to update system settings - invalid response format');
    } catch (error) {
      console.error('❌ System settings update error:', {
        error: error instanceof Error ? error.message : error,
        status: (error as any)?.status,
        details: (error as any)?.details,
        endpoint: API_ENDPOINTS.SYSTEM_SETTINGS.UPDATE
      });

      // If it's a 404 error, provide helpful guidance
      if ((error as any)?.status === 404) {
        console.error('🚨 SYSTEM SETTINGS UPDATE 404 ERROR DETECTED');
        console.error('💡 TROUBLESHOOTING STEPS:');
        console.error('1. Check if backend endpoint /admin/system-settings exists');
        console.error('2. Verify authentication token is valid');
        console.error('3. Check API base URL configuration');
        console.error('4. Verify user has admin permissions');

        // Return merged settings with defaults to prevent UI crash
        console.log('🔄 Returning merged settings with defaults to prevent UI crash');
        const defaultSettings = this.getDefaultSystemSettings();
        return {
          ...defaultSettings,
          ...settings,
          updatedAt: new Date().toISOString(),
        };
      }

      throw error;
    }
  }
}

// Export singleton instance
export const systemSettingsService = new SystemSettingsAPIService();