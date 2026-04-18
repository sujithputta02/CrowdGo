/**
 * Tests for Server-Side Logger with Cloud Monitoring
 */

// Mock the MonitoringService BEFORE importing logger
jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

import { logger } from '@/lib/logger';
import { MonitoringService } from '@/lib/monitoring';

describe('Server Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
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

    it('should not log debug with context in test', () => {
      logger.debug('Debug with context', { userId: '123' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should not log in test environment', () => {
      logger.info('Info message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle context without logging in test', () => {
      logger.info('Info message', { key: 'value' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('notice', () => {
    it('should not log in test environment', () => {
      logger.notice('Notice message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle context without logging in test', () => {
      logger.notice('Notice message', { event: 'test' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should not log in test environment', () => {
      logger.warn('Warning message');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should handle context without logging in test', () => {
      logger.warn('Warning', { api: 'deprecated' });
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

    it('should handle non-Error objects', () => {
      logger.error('Unknown error', { code: 500 });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle additional context', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error, { userId: '789' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined error', () => {
      logger.error('Error without details');
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
    });

    it('should include context in critical logs', () => {
      logger.critical('Database lost', undefined, { database: 'primary' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('database');
    });

    it('should handle undefined error in critical', () => {
      logger.critical('Critical without error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Logger Methods', () => {
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
