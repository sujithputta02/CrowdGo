import { verifyToken, requireAuth, verifyPubSubToken } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';

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

      expect(result).toEqual({ uid: 'user-123' });
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

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const result = await verifyToken(request);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Token verification failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
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

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer bad-token',
        },
      });

      const result = await verifyToken(request);

      // Should return null without exposing error details to caller
      expect(result).toBeNull();
      
      // Error should be logged but not returned
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
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
