/**
 * Error Logging Service
 * Centralized error logging for debugging and monitoring
 */

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorLoggingConfig {
  maxLogs: number;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
}

class ErrorLoggingService {
  private config: ErrorLoggingConfig;
  private logs: ErrorLog[] = [];
  private sessionId: string;

  constructor(config: Partial<ErrorLoggingConfig> = {}) {
    this.config = {
      maxLogs: 100,
      enableConsoleLogging: true,
      enableLocalStorage: true,
      enableRemoteLogging: false,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.loadLogsFromStorage();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadLogsFromStorage(): void {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') {
      return;
    }

    try {
      const storedLogs = localStorage.getItem('error-logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load error logs from storage:', error);
    }
  }

  private saveLogsToStorage(): void {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('error-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save error logs to storage:', error);
    }
  }

  private async sendToRemote(log: ErrorLog): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.warn('Failed to send error log to remote endpoint:', error);
    }
  }

  private createLog(
    level: ErrorLog['level'],
    message: string,
    context?: string,
    error?: Error,
    additionalData?: Record<string, any>
  ): ErrorLog {
    const log: ErrorLog = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      message,
      context,
      stack: error?.stack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.sessionId,
      additionalData
    };

    // Add user ID if available
    try {
      const userData = typeof window !== 'undefined' ? localStorage.getItem('auth-user') : null;
      if (userData) {
        const user = JSON.parse(userData);
        log.userId = user.id;
      }
    } catch {
      // Ignore errors when getting user data
    }

    return log;
  }

  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // Maintain max logs limit
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      const logMethod = log.level === 'error' ? console.error : 
                       log.level === 'warning' ? console.warn : console.info;
      
      logMethod(`[${log.level.toUpperCase()}] ${log.message}`, {
        context: log.context,
        timestamp: log.timestamp,
        additionalData: log.additionalData
      });
    }

    // Save to local storage
    this.saveLogsToStorage();

    // Send to remote endpoint
    this.sendToRemote(log);
  }

  logError(message: string, error?: Error, context?: string, additionalData?: Record<string, any>): void {
    const log = this.createLog('error', message, context, error, additionalData);
    this.addLog(log);
  }

  logWarning(message: string, context?: string, additionalData?: Record<string, any>): void {
    const log = this.createLog('warning', message, context, undefined, additionalData);
    this.addLog(log);
  }

  logInfo(message: string, context?: string, additionalData?: Record<string, any>): void {
    const log = this.createLog('info', message, context, undefined, additionalData);
    this.addLog(log);
  }

  // API-specific logging methods
  logApiError(error: any, endpoint: string, method: string): void {
    this.logError(
      `API ${method} ${endpoint} failed`,
      error,
      'API',
      {
        endpoint,
        method,
        status: error.status,
        details: error.details
      }
    );
  }

  logAuthError(error: any, action: string): void {
    this.logError(
      `Authentication ${action} failed`,
      error,
      'Authentication',
      {
        action,
        status: error.status
      }
    );
  }

  logNetworkError(error: any): void {
    this.logError(
      'Network error occurred',
      error,
      'Network',
      {
        type: error.type,
        code: error.code
      }
    );
  }

  // Utility methods
  getLogs(level?: ErrorLog['level']): ErrorLog[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  getRecentLogs(minutes: number = 60): ErrorLog[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff);
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogsToStorage();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getErrorSummary(): { total: number; byLevel: Record<string, number>; recent: number } {
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recent = this.getRecentLogs(60).length;

    return {
      total: this.logs.length,
      byLevel,
      recent
    };
  }
}

// Export singleton instance
export const errorLogger = new ErrorLoggingService({
  maxLogs: 100,
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  enableRemoteLogging: false, // Enable when you have a remote logging endpoint
});