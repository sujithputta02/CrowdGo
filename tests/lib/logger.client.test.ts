/**
 * Tests for Client-Side Logger
 */

import { logger } from '@/lib/logger.client';

// Note: Since the logger checks NODE_ENV at initialization time,
// we need to test it in the current environment (test mode)
// For production/development behavior, we test the logic paths

describe('Client Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('debug', () => {
    it('should not log debug messages in test environment', () => {
      logger.debug('Debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log debug messages with context in test', () => {
      logger.debug('Debug with context', { userId: '123', action: 'test' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should not log in test environment', () => {
      logger.info('Info message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log with context in test', () => {
      logger.info('User action', { userId: '456', action: 'login' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('notice', () => {
    it('should not log in test environment', () => {
      logger.notice('Notice message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log with context in test', () => {
      logger.notice('Important event', { event: 'deployment', version: '1.0.0' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should not log in test environment', () => {
      logger.warn('Warning message');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log with context in test', () => {
      logger.warn('Deprecated API', { api: '/old-endpoint', replacement: '/new-endpoint' });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should not log in test environment', () => {
      logger.error('Error message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle Error objects without logging in test', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects without logging in test', () => {
      logger.error('Unknown error', { code: 500, message: 'Server error' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle additional context without logging in test', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error, { userId: '789', operation: 'save' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('critical', () => {
    it('should log critical errors even in test environment', () => {
      logger.critical('Critical error');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('[ERROR]');
      expect(logCall).toContain('CRITICAL');
      expect(logCall).toContain('Critical error');
    });

    it('should handle Error objects in critical logs', () => {
      const error = new Error('Critical failure');
      logger.critical('System down', error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('Critical failure');
      expect(logCall).toContain('CRITICAL');
    });

    it('should include context in critical logs', () => {
      logger.critical('Database connection lost', undefined, { database: 'primary', retries: 3 });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('database');
      expect(logCall).toContain('primary');
      expect(logCall).toContain('retries');
    });
  });

  describe('Log Formatting', () => {
    it('should format critical logs with timestamp', () => {
      logger.critical('Test message');
      
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should format critical logs with log level', () => {
      logger.critical('Test message');
      
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('[ERROR]');
      expect(logCall).toContain('CRITICAL');
    });

    it('should format critical logs with message', () => {
      logger.critical('Test message');
      
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('Test message');
    });

    it('should format context as JSON', () => {
      logger.critical('Test', undefined, { key: 'value', number: 123 });
      
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('"key":"value"');
      expect(logCall).toContain('"number":123');
    });
  });

  describe('Logger Methods Exist', () => {
    it('should have all required methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.notice).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.critical).toBe('function');
    });

    it('should not throw when called with various inputs', () => {
      expect(() => logger.debug('test')).not.toThrow();
      expect(() => logger.info('test', { key: 'value' })).not.toThrow();
      expect(() => logger.notice('test')).not.toThrow();
      expect(() => logger.warn('test')).not.toThrow();
      expect(() => logger.error('test', new Error('test'))).not.toThrow();
      expect(() => logger.critical('test')).not.toThrow();
    });
  });
});
