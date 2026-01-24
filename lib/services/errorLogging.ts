/**
 * Error Logging Service
 * Handles error tracking, logging, and reporting
 */

import { API_CONFIG } from '../api/config';

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
}

export interface ErrorLogger {
  logError(error: Error, context?: Record<string, unknown>): void;
  logWarning(message: string, context?: Record<string, unknown>): void;
  logInfo(message: string, context?: Record<string, unknown>): void;
  logDebug(message: string, context?: Record<string, unknown>): void;
  getErrorLogs(limit?: number): ErrorLogEntry[];
  clearErrorLogs(): void;
}

class ErrorLoggingService implements ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: ErrorLogEntry['level'],
    message: string,
    stack?: string,
    context?: Record<string, unknown>
  ): ErrorLogEntry {
    const entry: ErrorLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      stack,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Add user ID if available
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('auth_user');
        if (authData) {
          const user = JSON.parse(authData);
          entry.userId = user.id?.toString();
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    return entry;
  }

  private addLog(entry: ErrorLogEntry): void {
    this.logs.unshift(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console logging based on configuration
    if (entry.level === 'error') {
      console.error(entry.message, entry);
    } else if (entry.level === 'warn') {
      console.warn(entry.message, entry);
    }

    // Send to external error tracking service if configured
    if (API_CONFIG.ENABLE_ERROR_TRACKING && API_CONFIG.ERROR_TRACKING_ENDPOINT) {
      this.sendToExternalService(entry).catch(err => {
        console.warn('Failed to send error to tracking service:', err);
      });
    }
  }

  private async sendToExternalService(entry: ErrorLogEntry): Promise<void> {
    if (!API_CONFIG.ERROR_TRACKING_ENDPOINT) return;

    try {
      await fetch(API_CONFIG.ERROR_TRACKING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't throw errors from error logging to avoid infinite loops
      console.warn('Error tracking service unavailable:', error);
    }
  }

  logError(error: Error, context?: Record<string, any>): void {
    // Check if error logging is suppressed for this error
    if ((error as any).suppressLog) {
      return;
    }

    const entry = this.createLogEntry(
      'error',
      error.message,
      error.stack,
      {
        ...context,
        errorName: error.name,
        errorConstructor: error.constructor.name,
      }
    );
    this.addLog(entry);
  }

  logWarning(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, undefined, context);
    this.addLog(entry);
  }

  logInfo(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, undefined, context);
    this.addLog(entry);
  }

  logDebug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, undefined, context);
    this.addLog(entry);
  }

  getErrorLogs(limit?: number): ErrorLogEntry[] {
    return limit ? this.logs.slice(0, limit) : [...this.logs];
  }

  clearErrorLogs(): void {
    this.logs = [];
  }

  // Additional utility methods
  logApiError(endpoint: string, error: Error, requestData?: unknown): void {
    this.logError(error, {
      type: 'api_error',
      endpoint,
      requestData,
    });
  }

  logComponentError(componentName: string, error: Error, props?: unknown): void {
    this.logError(error, {
      type: 'component_error',
      component: componentName,
      props,
    });
  }

  logNavigationError(route: string, error: Error): void {
    this.logError(error, {
      type: 'navigation_error',
      route,
    });
  }

  logValidationError(field: string, value: unknown, rule: string): void {
    this.logWarning(`Validation failed for field: ${field}`, {
      type: 'validation_error',
      field,
      value,
      rule,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: Record<string, any>): void {
    const level = duration > 1000 ? 'warn' : 'info'; // Warn if operation takes more than 1 second
    const message = `Performance: ${operation} took ${duration}ms`;

    if (level === 'warn') {
      this.logWarning(message, { ...context, type: 'performance', operation, duration });
    } else {
      this.logInfo(message, { ...context, type: 'performance', operation, duration });
    }
  }

  // User action logging
  logUserAction(action: string, context?: Record<string, any>): void {
    this.logInfo(`User action: ${action}`, {
      ...context,
      type: 'user_action',
      action,
    });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLoggingService();
