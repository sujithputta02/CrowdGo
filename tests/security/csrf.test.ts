/**
 * CSRF Protection Tests
 */

import { generateCSRFToken, verifyCSRFToken, revokeCSRFToken, extractCSRFToken, validateCSRF } from '@/lib/security/csrf';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

jest.mock('@/lib/logger');

describe('CSRF Protection', () => {
  const sessionId = 'test-session-123';

  afterEach(() => {
    // Clean up tokens after each test
    revokeCSRFToken(sessionId);
    jest.clearAllMocks();
  });

  describe('generateCSRFToken', () => {
    it('should generate a valid token', () => {
      const token = generateCSRFToken(sessionId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken('session-1');
      const token2 = generateCSRFToken('session-2');
      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens for same session on multiple calls', () => {
      revokeCSRFToken('session-1');
      const token1 = generateCSRFToken('session-1');
      revokeCSRFToken('session-1');
      const token2 = generateCSRFToken('session-1');
      expect(token1).not.toBe(token2);
    });

    it('should store token with expiry', () => {
      const token = generateCSRFToken(sessionId);
      expect(verifyCSRFToken(sessionId, token)).toBe(true);
    });
  });

  describe('verifyCSRFToken', () => {
    it('should verify a valid token', () => {
      const token = generateCSRFToken(sessionId);
      const isValid = verifyCSRFToken(sessionId, token);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid token', () => {
      generateCSRFToken(sessionId);
      const isValid = verifyCSRFToken(sessionId, 'invalid-token');
      expect(isValid).toBe(false);
    });

    it('should reject a token for wrong session', () => {
      const token = generateCSRFToken('session-1');
      const isValid = verifyCSRFToken('session-2', token);
      expect(isValid).toBe(false);
    });

    it('should reject a token that does not exist', () => {
      const isValid = verifyCSRFToken('non-existent-session', 'some-token');
      expect(isValid).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('CSRF token not found', expect.any(Object));
    });

    it('should log warning when token not found', () => {
      verifyCSRFToken('non-existent', 'token');
      expect(logger.warn).toHaveBeenCalledWith('CSRF token not found', { sessionId: 'non-existent' });
    });

    it('should reject an expired token', () => {
      const token = generateCSRFToken(sessionId);
      
      // Manually expire the token by manipulating time
      jest.useFakeTimers();
      jest.advanceTimersByTime(61 * 60 * 1000); // Advance 61 minutes
      
      const isValid = verifyCSRFToken(sessionId, token);
      expect(isValid).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('CSRF token expired', { sessionId });
      
      jest.useRealTimers();
    });

    it('should log warning when token expired', () => {
      const token = generateCSRFToken(sessionId);
      
      jest.useFakeTimers();
      jest.advanceTimersByTime(61 * 60 * 1000);
      
      verifyCSRFToken(sessionId, token);
      expect(logger.warn).toHaveBeenCalledWith('CSRF token expired', { sessionId });
      
      jest.useRealTimers();
    });
  });

  describe('extractCSRFToken', () => {
    it('should extract token from X-CSRF-Token header', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'test-token-123',
        },
      });

      const token = extractCSRFToken(request);
      expect(token).toBe('test-token-123');
    });

    it('should return null when no token in headers', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
      });

      const token = extractCSRFToken(request);
      expect(token).toBeNull();
    });

    it('should prioritize X-CSRF-Token header', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'header-token',
        },
      });

      const token = extractCSRFToken(request);
      expect(token).toBe('header-token');
    });
  });

  describe('validateCSRF', () => {
    it('should skip validation for GET requests', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should skip validation for HEAD requests', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'HEAD',
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should skip validation for OPTIONS requests', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should validate POST requests', () => {
      const token = generateCSRFToken(sessionId);
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
        },
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should validate PUT requests', () => {
      const token = generateCSRFToken(sessionId);
      const request = new NextRequest('http://localhost/api/test', {
        method: 'PUT',
        headers: {
          'X-CSRF-Token': token,
        },
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should validate PATCH requests', () => {
      const token = generateCSRFToken(sessionId);
      const request = new NextRequest('http://localhost/api/test', {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': token,
        },
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should validate DELETE requests', () => {
      const token = generateCSRFToken(sessionId);
      const request = new NextRequest('http://localhost/api/test', {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': token,
        },
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(true);
    });

    it('should reject POST without token', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('CSRF token missing', expect.any(Object));
    });

    it('should reject POST with invalid token', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'invalid-token',
        },
      });

      const isValid = validateCSRF(request, sessionId);
      expect(isValid).toBe(false);
    });

    it('should log warning when token missing', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
      });

      validateCSRF(request, sessionId);
      expect(logger.warn).toHaveBeenCalledWith('CSRF token missing', {
        method: 'POST',
        path: '/api/test',
      });
    });
  });

  describe('revokeCSRFToken', () => {
    it('should revoke a token', () => {
      const token = generateCSRFToken(sessionId);
      expect(verifyCSRFToken(sessionId, token)).toBe(true);
      
      revokeCSRFToken(sessionId);
      expect(verifyCSRFToken(sessionId, token)).toBe(false);
    });

    it('should not throw when revoking non-existent token', () => {
      expect(() => revokeCSRFToken('non-existent')).not.toThrow();
    });

    it('should allow regenerating token after revocation', () => {
      const token1 = generateCSRFToken(sessionId);
      revokeCSRFToken(sessionId);
      const token2 = generateCSRFToken(sessionId);
      
      expect(verifyCSRFToken(sessionId, token1)).toBe(false);
      expect(verifyCSRFToken(sessionId, token2)).toBe(true);
    });
  });

  describe('Token Security', () => {
    it('should use constant-time comparison', () => {
      const token = generateCSRFToken(sessionId);
      
      // Verify with correct token
      const start1 = Date.now();
      verifyCSRFToken(sessionId, token);
      const time1 = Date.now() - start1;
      
      // Verify with incorrect token of same length
      const wrongToken = 'a'.repeat(token.length);
      const start2 = Date.now();
      verifyCSRFToken(sessionId, wrongToken);
      const time2 = Date.now() - start2;
      
      // Times should be similar (within 10ms)
      // This is a basic check; true constant-time is harder to test
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });

    it('should reject tokens with different lengths', () => {
      const token = generateCSRFToken(sessionId);
      const shortToken = token.substring(0, 10);
      
      const isValid = verifyCSRFToken(sessionId, shortToken);
      expect(isValid).toBe(false);
    });

    it('should generate cryptographically secure tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        const token = generateCSRFToken(`session-${i}`);
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('Token Cleanup', () => {
    it('should cleanup expired tokens periodically', async () => {
      const token = generateCSRFToken(sessionId);
      expect(verifyCSRFToken(sessionId, token)).toBe(true);
      
      jest.useFakeTimers();
      jest.advanceTimersByTime(61 * 60 * 1000); // Advance 61 minutes
      
      // Trigger cleanup by advancing past cleanup interval
      jest.advanceTimersByTime(11 * 60 * 1000); // Advance 11 minutes
      
      // Token should be expired and cleaned up
      expect(verifyCSRFToken(sessionId, token)).toBe(false);
      
      jest.useRealTimers();
    });
  });
});
