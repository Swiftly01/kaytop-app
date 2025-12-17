/**
 * Export Service
 * Handles data export functionality for various entities
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export interface ExportService {
  exportUsers(filters?: Record<string, any>, format?: 'csv' | 'excel' | 'pdf'): Promise<Blob>;
  exportLoans(filters?: Record<string, any>, format?: 'csv' | 'excel' | 'pdf'): Promise<Blob>;
  exportReports(filters?: Record<string, any>, format?: 'csv' | 'excel' | 'pdf'): Promise<Blob>;
  exportActivityLogs(filters?: Record<string, any>, format?: 'csv' | 'excel' | 'pdf'): Promise<Blob>;
  getExportHistory(): Promise<ExportHistoryItem[]>;
}

export interface ExportHistoryItem {
  id: string;
  entityType: 'users' | 'loans' | 'reports' | 'activity_logs';
  format: 'csv' | 'excel' | 'pdf';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  recordCount: number;
}

class ExportAPIService implements ExportService {
  async exportUsers(filters: Record<string, any> = {}, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const url = `${API_ENDPOINTS.ADMIN.USERS}/export?${params.toString()}`;
      const response = await apiClient.get(url, {
        headers: {
          'Accept': this.getAcceptHeader(format),
        },
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return new Blob([response.data], { type: this.getMimeType(format) });
        }
        // Check if it's direct data format (export data)
        else if (response) {
          return new Blob([response], { type: this.getMimeType(format) });
        }
      }

      throw new Error('Failed to export users - invalid response format');
    } catch (error) {
      console.error('Users export error:', error);
      throw error;
    }
  }

  async exportLoans(filters: Record<string, any> = {}, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const url = `${API_ENDPOINTS.BULK.LOANS}/export?${params.toString()}`;
      const response = await apiClient.get(url, {
        headers: {
          'Accept': this.getAcceptHeader(format),
        },
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return new Blob([response.data], { type: this.getMimeType(format) });
        }
        // Check if it's direct data format (export data)
        else if (response) {
          return new Blob([response], { type: this.getMimeType(format) });
        }
      }

      throw new Error('Failed to export loans - invalid response format');
    } catch (error) {
      console.error('Loans export error:', error);
      throw error;
    }
  }

  async exportReports(filters: Record<string, any> = {}, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const url = `${API_ENDPOINTS.REPORTS.LIST}/export?${params.toString()}`;
      const response = await apiClient.get(url, {
        headers: {
          'Accept': this.getAcceptHeader(format),
        },
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return new Blob([response.data], { type: this.getMimeType(format) });
        }
        // Check if it's direct data format (export data)
        else if (response) {
          return new Blob([response], { type: this.getMimeType(format) });
        }
      }

      throw new Error('Failed to export reports - invalid response format');
    } catch (error) {
      console.error('Reports export error:', error);
      throw error;
    }
  }

  async exportActivityLogs(filters: Record<string, any> = {}, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const url = `${API_ENDPOINTS.ACTIVITY_LOGS.LIST}/export?${params.toString()}`;
      const response = await apiClient.get(url, {
        headers: {
          'Accept': this.getAcceptHeader(format),
        },
      });

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return new Blob([response.data], { type: this.getMimeType(format) });
        }
        // Check if it's direct data format (export data)
        else if (response) {
          return new Blob([response], { type: this.getMimeType(format) });
        }
      }

      throw new Error('Failed to export activity logs - invalid response format');
    } catch (error) {
      console.error('Activity logs export error:', error);
      throw error;
    }
  }

  async getExportHistory(): Promise<ExportHistoryItem[]> {
    try {
      const response = await apiClient.get<ExportHistoryItem[]>('/admin/exports/history');

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (export history list)
        else if (Array.isArray(response)) {
          return response;
        }
      }

      throw new Error('Failed to fetch export history - invalid response format');
    } catch (error) {
      console.error('Export history fetch error:', error);
      throw error;
    }
  }

  private getAcceptHeader(format: 'csv' | 'excel' | 'pdf'): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'text/csv';
    }
  }

  private getMimeType(format: 'csv' | 'excel' | 'pdf'): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'text/csv';
    }
  }
}

// Export singleton instance
export const exportService = new ExportAPIService();