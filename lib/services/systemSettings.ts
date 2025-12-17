/**
 * System Settings Service
 * Handles system configuration management
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type { SystemSettings } from '../api/types';

export interface SystemSettingsService {
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}

class SystemSettingsAPIService implements SystemSettingsService {
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.get<SystemSettings>(
        API_ENDPOINTS.SYSTEM_SETTINGS.GET
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has settings fields)
        else if (response.id || response.appName || response.version) {
          return response as SystemSettings;
        }
      }

      throw new Error('Failed to fetch system settings - invalid response format');
    } catch (error) {
      console.error('System settings fetch error:', error);
      throw error;
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await apiClient.put<SystemSettings>(
        API_ENDPOINTS.SYSTEM_SETTINGS.UPDATE,
        settings
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has settings fields)
        else if (response.id || response.appName || response.version) {
          return response as SystemSettings;
        }
      }

      throw new Error('Failed to update system settings - invalid response format');
    } catch (error) {
      console.error('System settings update error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const systemSettingsService = new SystemSettingsAPIService();