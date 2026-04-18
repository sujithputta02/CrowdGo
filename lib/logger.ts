/**
 * Centralized Logger Utility
 * Server-side logger with Cloud Monitoring integration
 * For client-side logging, use lib/logger.client.ts instead
 */

import { MonitoringService } from './monitoring';

type LogLevel = 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Formats a log message with context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  /**
   * Logs a debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  /**
   * Logs an informational message
   */
  info(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.log(this.formatMessage('INFO', message, context));
    }
    
    // Send to Cloud Logging in production (server-side only)
    if (!this.isDevelopment) {
      Promise.resolve(MonitoringService.log(message, 'INFO', context || {})).catch(() => {
        // Silently fail if Cloud Logging is unavailable
      });
    }
  }

  /**
   * Logs a notice message (important but not an error)
   */
  notice(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.log(this.formatMessage('NOTICE', message, context));
    }
    
    if (!this.isDevelopment) {
      Promise.resolve(MonitoringService.log(message, 'NOTICE', context || {})).catch(() => {});
    }
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.warn(this.formatMessage('WARNING', message, context));
    }
    
    if (!this.isDevelopment) {
      Promise.resolve(MonitoringService.log(message, 'WARNING', context || {})).catch(() => {});
    }
  }

  /**
   * Logs an error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    if (!this.isTest) {
      console.error(this.formatMessage('ERROR', message, errorContext));
    }
    
    if (!this.isDevelopment) {
      Promise.resolve(MonitoringService.log(message, 'ERROR', errorContext)).catch(() => {});
    }
  }

  /**
   * Logs a critical error that requires immediate attention
   */
  critical(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    console.error(this.formatMessage('ERROR', `CRITICAL: ${message}`, errorContext));
    
    if (!this.isDevelopment) {
      Promise.resolve(MonitoringService.log(`CRITICAL: ${message}`, 'ERROR', errorContext)).catch(() => {});
    }
  }
}

// Export singleton instance
export const logger = new Logger();
