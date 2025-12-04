/**
 * Logger Utility
 * Provides structured logging with different log levels
 * Integrates with error reporting services in production
 */

import { env } from '@/lib/config/env';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  stack?: string;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  /**
   * Format log entry with timestamp and metadata
   */
  private formatLog(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack: data instanceof Error ? data.stack : undefined,
    };
  }

  /**
   * Send logs to external service (e.g., Sentry, LogRocket)
   * Override this method to integrate with your logging service
   */
  private sendToExternalService(_entry: LogEntry): void {
    // TODO: Integrate with external logging service
    // Example: Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.data });
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;

    const entry = this.formatLog(LogLevel.DEBUG, message, data);
    console.debug(`[DEBUG] ${entry.timestamp}:`, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: unknown): void {
    const entry = this.formatLog(LogLevel.INFO, message, data);

    if (this.isDevelopment) {
      console.info(`[INFO] ${entry.timestamp}:`, message, data);
    } else {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    const entry = this.formatLog(LogLevel.WARN, message, data);

    if (this.isDevelopment) {
      console.warn(`[WARN] ${entry.timestamp}:`, message, data);
    }

    this.sendToExternalService(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown): void {
    const entry = this.formatLog(LogLevel.ERROR, message, error);

    if (this.isDevelopment) {
      console.error(`[ERROR] ${entry.timestamp}:`, message, error);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    this.sendToExternalService(entry);
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, data?: unknown): void {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  /**
   * Log API response
   */
  logResponse(method: string, url: string, status: number, data?: unknown): void {
    this.debug(`API Response: ${method} ${url} - Status: ${status}`, data);
  }

  /**
   * Log API error
   */
  logApiError(method: string, url: string, error: unknown): void {
    this.error(`API Error: ${method} ${url}`, error);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * API Logger for request/response logging
 */
export const apiLogger = {
  /**
   * Log HTTP request
   */
  request(method: string, url: string, data?: unknown): void {
    logger.logRequest(method, url, data);
  },

  /**
   * Log successful HTTP response
   */
  response(method: string, url: string, status: number, data?: unknown): void {
    logger.logResponse(method, url, status, data);
  },

  /**
   * Log HTTP error
   */
  error(method: string, url: string, error: unknown): void {
    logger.logApiError(method, url, error);
  },
};

export default logger;
