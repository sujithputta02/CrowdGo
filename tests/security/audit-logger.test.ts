/**
 * Security Audit Logger Tests
 */

import {
  logSecurityEvent,
  logAuthAttempt,
  logAuthorizationCheck,
  logRateLimitEvent,
  logSecretAccess,
  logAdminAction,
  logSuspiciousActivity,
  logDataAccess,
} from '@/lib/security/audit-logger';

// Mock the logger and monitoring service
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Security Audit Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logSecurityEvent', () => {
    it('should log a successful security event', async () => {
      await logSecurityEvent({
        type: 'AUTH_SUCCESS',
        userId: 'user-123',
        ip: '192.168.1.1',
        success: true,
      });

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: AUTH_SUCCESS',
        expect.objectContaining({
          type: 'SECURITY_EVENT',
          event: 'AUTH_SUCCESS',
          userId: 'user-123',
          ip: '192.168.1.1',
          success: true,
        })
      );
    });

    it('should log a failed security event as warning', async () => {
      await logSecurityEvent({
        type: 'AUTH_FAILURE',
        userId: 'user-123',
        ip: '192.168.1.1',
        success: false,
        reason: 'Invalid credentials',
      });

      const { logger } = require('@/lib/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: AUTH_FAILURE',
        expect.objectContaining({
          type: 'SECURITY_EVENT',
          event: 'AUTH_FAILURE',
          success: false,
          reason: 'Invalid credentials',
        })
      );
    });

    it('should include metadata in log entry', async () => {
      await logSecurityEvent({
        type: 'ADMIN_ACTION',
        userId: 'admin-123',
        success: true,
        metadata: {
          action: 'delete_user',
          targetUserId: 'user-456',
        },
      });

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: ADMIN_ACTION',
        expect.objectContaining({
          action: 'delete_user',
          targetUserId: 'user-456',
        })
      );
    });
  });

  describe('logAuthAttempt', () => {
    it('should log successful authentication', async () => {
      await logAuthAttempt('user-123', '192.168.1.1', true);

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: AUTH_SUCCESS',
        expect.objectContaining({
          event: 'AUTH_SUCCESS',
          userId: 'user-123',
          ip: '192.168.1.1',
          success: true,
        })
      );
    });

    it('should log failed authentication', async () => {
      await logAuthAttempt('user-123', '192.168.1.1', false, 'Invalid password');

      const { logger } = require('@/lib/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: AUTH_FAILURE',
        expect.objectContaining({
          event: 'AUTH_FAILURE',
          userId: 'user-123',
          success: false,
          reason: 'Invalid password',
        })
      );
    });
  });

  describe('logAuthorizationCheck', () => {
    it('should log granted authorization', async () => {
      await logAuthorizationCheck('user-123', '/api/data', 'read', true);

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: AUTHORIZATION_DENIED',
        expect.objectContaining({
          userId: 'user-123',
          resource: '/api/data',
          action: 'read',
          success: true,
        })
      );
    });

    it('should log denied authorization', async () => {
      await logAuthorizationCheck(
        'user-123',
        '/api/admin',
        'write',
        false,
        'Insufficient permissions'
      );

      const { logger } = require('@/lib/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: AUTHORIZATION_DENIED',
        expect.objectContaining({
          success: false,
          reason: 'Insufficient permissions',
        })
      );
    });
  });

  describe('logRateLimitEvent', () => {
    it('should log rate limit exceeded', async () => {
      await logRateLimitEvent('192.168.1.1', '/api/endpoint', true);

      const { logger } = require('@/lib/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: RATE_LIMIT_EXCEEDED',
        expect.objectContaining({
          ip: '192.168.1.1',
          path: '/api/endpoint',
          success: false,
          reason: 'Rate limit exceeded',
        })
      );
    });
  });

  describe('logSecretAccess', () => {
    it('should log successful secret access', async () => {
      await logSecretAccess('API_KEY', true, 'user-123');

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: SECRET_ACCESS',
        expect.objectContaining({
          event: 'SECRET_ACCESS',
          resource: 'API_KEY',
          userId: 'user-123',
          success: true,
        })
      );
    });

    it('should log failed secret access', async () => {
      await logSecretAccess('API_KEY', false);

      const { logger } = require('@/lib/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: SECRET_ACCESS_FAILED',
        expect.objectContaining({
          event: 'SECRET_ACCESS_FAILED',
          success: false,
        })
      );
    });
  });

  describe('logAdminAction', () => {
    it('should log admin action with metadata', async () => {
      await logAdminAction('admin-123', 'delete_user', 'user-456', {
        reason: 'Terms violation',
      });

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: ADMIN_ACTION',
        expect.objectContaining({
          userId: 'admin-123',
          action: 'delete_user',
          resource: 'user-456',
          reason: 'Terms violation',
        })
      );
    });
  });

  describe('logSuspiciousActivity', () => {
    it('should log suspicious activity', async () => {
      await logSuspiciousActivity('192.168.1.1', 'Multiple failed login attempts', {
        attempts: 5,
      });

      const { logger } = require('@/lib/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: SUSPICIOUS_ACTIVITY',
        expect.objectContaining({
          ip: '192.168.1.1',
          reason: 'Multiple failed login attempts',
          attempts: 5,
        })
      );
    });
  });

  describe('logDataAccess', () => {
    it('should log data read access', async () => {
      await logDataAccess('user-123', 'user-profile', 'read', true);

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: DATA_ACCESS',
        expect.objectContaining({
          event: 'DATA_ACCESS',
          userId: 'user-123',
          resource: 'user-profile',
          action: 'read',
          success: true,
        })
      );
    });

    it('should log data write access', async () => {
      await logDataAccess('user-123', 'user-profile', 'write', true);

      const { logger } = require('@/lib/logger');
      expect(logger.info).toHaveBeenCalledWith(
        'Security Event: DATA_MODIFICATION',
        expect.objectContaining({
          event: 'DATA_MODIFICATION',
          action: 'write',
        })
      );
    });
  });
});
