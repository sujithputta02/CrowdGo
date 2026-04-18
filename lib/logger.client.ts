/**
 * Client-Side Logger
 * Lightweight logger for browser environments without server dependencies
 */

type LogLevel = 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR';

interface LogContext {
  [key: string]: unknown;
}

class ClientLogger {
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
  }

  /**
   * Logs a notice message (important but not an error)
   */
  notice(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.log(this.formatMessage('NOTICE', message, context));
    }
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.warn(this.formatMessage('WARNING', message, context));
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
  }
}

// Export singleton instance
export const logger = new ClientLogger();
