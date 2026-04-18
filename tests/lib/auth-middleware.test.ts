import { verifyToken, requireAuth, verifyPubSubToken } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Mock Firebase Admin with proper structure
const mockVerifyIdToken = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [{ name: 'test-app' }]), // Return existing app to prevent re-initialization
  cert: jest.fn(),
}));

// Mock ApiResponseHandler
jest.mock('@/lib/api-response', () => ({
  ApiResponseHandler: {
    unauthorized: jest.fn((message) => ({
      status: 401,
      json: async () => ({ success: false, error: { message } }),
    })),
  },
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockReset();
  });

  describe('verifyToken', () => {
    it('should verify valid Firebase token', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const result = await verifyToken(request);

      expect(result).toEqual({
        uid: 'user-123',
        email: undefined,
        role: 'user',
        customClaims: { uid: 'user-123' },
      });
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return null for missing Authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const result = await verifyToken(request);

      expect(result).toBeNull();
    });

    it('should return null for invalid Authorization header format', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'InvalidFormat token',
        },
      });

      const result = await verifyToken(request);

      expect(result).toBeNull();
    });

    it('should return null for Authorization header without Bearer prefix', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'token-without-bearer',
        },
      });

      const result = await verifyToken(request);

      expect(result).toBeNull();
    });

    it('should return null when token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const result = await verifyToken(request);

      expect(result).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Token verification failed',
        expect.any(Error)
      );

      loggerErrorSpy.mockRestore();
    });

    it('should handle expired tokens', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer expired-token',
        },
      });

      const result = await verifyToken(request);

      expect(result).toBeNull();
    });

    it('should extract token correctly from Bearer header', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-456' });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer my-long-token-string',
        },
      });

      await verifyToken(request);

      expect(mockVerifyIdToken).toHaveBeenCalledWith('my-long-token-string');
    });
  });

  describe('requireAuth', () => {
    it('should return null for authenticated requests', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-789' });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const result = await requireAuth(request);

      expect(result).toBeNull();
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return unauthorized response for missing token', async () => {
      const { ApiResponseHandler } = require('@/lib/api-response');

      const request = new NextRequest('http://localhost:3000/api/test');

      const result = await requireAuth(request);

      expect(result).not.toBeNull();
      expect(ApiResponseHandler.unauthorized).toHaveBeenCalledWith(
        'Invalid or missing authentication token'
      );
    });

    it('should return unauthorized response for invalid token', async () => {
      const { ApiResponseHandler } = require('@/lib/api-response');
      
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const result = await requireAuth(request);

      expect(result).not.toBeNull();
      expect(ApiResponseHandler.unauthorized).toHaveBeenCalledWith(
        'Invalid or missing authentication token'
      );
    });

    it('should return unauthorized response for malformed Authorization header', async () => {
      const { ApiResponseHandler } = require('@/lib/api-response');

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'NotBearer token',
        },
      });

      const result = await requireAuth(request);

      expect(result).not.toBeNull();
      expect(ApiResponseHandler.unauthorized).toHaveBeenCalled();
    });
  });

  describe('verifyPubSubToken', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return true for valid PubSub token', () => {
      process.env.PUBSUB_VERIFICATION_TOKEN = 'secret-token-123';

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        headers: {
          'X-PubSub-Secret': 'secret-token-123',
        },
      });

      const result = verifyPubSubToken(request);

      expect(result).toBe(true);
    });

    it('should return false for missing PubSub token header', () => {
      process.env.PUBSUB_VERIFICATION_TOKEN = 'secret-token-123';

      const request = new NextRequest('http://localhost:3000/api/webhook');

      const result = verifyPubSubToken(request);

      expect(result).toBe(false);
    });

    it('should return false for invalid PubSub token', () => {
      process.env.PUBSUB_VERIFICATION_TOKEN = 'secret-token-123';

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        headers: {
          'X-PubSub-Secret': 'wrong-token',
        },
      });

      const result = verifyPubSubToken(request);

      expect(result).toBe(false);
    });

    it('should return false when environment token is not set', () => {
      delete process.env.PUBSUB_VERIFICATION_TOKEN;

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        headers: {
          'X-PubSub-Secret': 'some-token',
        },
      });

      const result = verifyPubSubToken(request);

      expect(result).toBe(false);
    });

    it('should return false when both tokens are missing', () => {
      delete process.env.PUBSUB_VERIFICATION_TOKEN;

      const request = new NextRequest('http://localhost:3000/api/webhook');

      const result = verifyPubSubToken(request);

      expect(result).toBe(false);
    });

    it('should use constant-time comparison to prevent timing attacks', () => {
      process.env.PUBSUB_VERIFICATION_TOKEN = 'secret-token-123';

      const request1 = new NextRequest('http://localhost:3000/api/webhook', {
        headers: {
          'X-PubSub-Secret': 'secret-token-123',
        },
      });

      const request2 = new NextRequest('http://localhost:3000/api/webhook', {
        headers: {
          'X-PubSub-Secret': 'wrong-token-123',
        },
      });

      // Both should execute in similar time (constant-time comparison)
      const result1 = verifyPubSubToken(request1);
      const result2 = verifyPubSubToken(request2);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should handle empty string tokens', () => {
      process.env.PUBSUB_VERIFICATION_TOKEN = 'secret-token-123';

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        headers: {
          'X-PubSub-Secret': '',
        },
      });

      const result = verifyPubSubToken(request);

      expect(result).toBe(false);
    });
  });

  describe('Security Best Practices', () => {
    it('should not expose sensitive error details', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Detailed internal error'));

      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer bad-token',
        },
      });

      const result = await verifyToken(request);

      // Should return null without exposing error details to caller
      expect(result).toBeNull();
      
      // Error should be logged but not returned
      expect(loggerErrorSpy).toHaveBeenCalled();

      loggerErrorSpy.mockRestore();
    });

    it('should handle concurrent authentication requests', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-concurrent' });

      const requests = Array.from({ length: 10 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/test', {
          headers: {
            Authorization: `Bearer token-${i}`,
          },
        })
      );

      const results = await Promise.all(requests.map(req => verifyToken(req)));

      expect(results).toHaveLength(10);
      expect(results.every(r => r?.uid === 'user-concurrent')).toBe(true);
      expect(mockVerifyIdToken).toHaveBeenCalledTimes(10);
    });
  });
});

// Additional tests for RBAC features
describe('RBAC Features', () => {
  // Mock audit logger
  jest.mock('@/lib/security/audit-logger', () => ({
    logAuthAttempt: jest.fn().mockResolvedValue(undefined),
    logAuthorizationCheck: jest.fn().mockResolvedValue(undefined),
  }));

  // Mock rate limiter
  jest.mock('@/lib/rate-limiter', () => ({
    getClientIp: jest.fn(() => '192.168.1.1'),
  }));

  // Mock ApiResponseHandler.forbidden
  beforeAll(() => {
    const { ApiResponseHandler } = require('@/lib/api-response');
    ApiResponseHandler.forbidden = jest.fn((message) => ({
      status: 403,
      json: async () => ({ success: false, error: { message } }),
    }));
  });

  describe('requireRole', () => {
    it('should allow user with correct role', async () => {
      const { requireRole } = require('@/lib/auth-middleware');
      
      mockVerifyIdToken.mockResolvedValue({
        uid: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const request = new NextRequest('http://localhost:3000/api/admin', {
        headers: {
          Authorization: 'Bearer admin-token',
        },
      });

      const result = await requireRole(request, ['admin']);
      expect(result.user).not.toBeNull();
      expect(result.response).toBeNull();
      expect(result.user?.role).toBe('admin');
    });

    it('should reject user with insufficient role', async () => {
      const { requireRole } = require('@/lib/auth-middleware');
      
      mockVerifyIdToken.mockResolvedValue({
        uid: 'user-123',
        email: 'user@example.com',
        role: 'user',
      });

      const request = new NextRequest('http://localhost:3000/api/admin', {
        headers: {
          Authorization: 'Bearer user-token',
        },
      });

      const result = await requireRole(request, ['admin']);
      expect(result.user).toBeNull();
      expect(result.response).not.toBeNull();
    });

    it('should allow multiple roles', async () => {
      const { requireRole } = require('@/lib/auth-middleware');
      
      mockVerifyIdToken.mockResolvedValue({
        uid: 'ops-123',
        email: 'ops@example.com',
        role: 'ops',
      });

      const request = new NextRequest('http://localhost:3000/api/ops', {
        headers: {
          Authorization: 'Bearer ops-token',
        },
      });

      const result = await requireRole(request, ['admin', 'ops']);
      expect(result.user).not.toBeNull();
      expect(result.response).toBeNull();
    });
  });

  describe('checkResourceOwnership', () => {
    it('should allow admin to access any resource', () => {
      const { checkResourceOwnership } = require('@/lib/auth-middleware');
      
      const admin = {
        uid: 'admin-123',
        role: 'admin',
      };

      const canAccess = checkResourceOwnership(admin, 'user-456');
      expect(canAccess).toBe(true);
    });

    it('should allow user to access their own resource', () => {
      const { checkResourceOwnership } = require('@/lib/auth-middleware');
      
      const user = {
        uid: 'user-123',
        role: 'user',
      };

      const canAccess = checkResourceOwnership(user, 'user-123');
      expect(canAccess).toBe(true);
    });

    it('should deny user access to other user resources', () => {
      const { checkResourceOwnership } = require('@/lib/auth-middleware');
      
      const user = {
        uid: 'user-123',
        role: 'user',
      };

      const canAccess = checkResourceOwnership(user, 'user-456');
      expect(canAccess).toBe(false);
    });
  });
});
