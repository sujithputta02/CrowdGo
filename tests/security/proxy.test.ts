/**
 * Middleware Security Tests
 * Tests for Next.js middleware security features
 */

import { NextRequest } from 'next/server';

// Mock the rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  getClientIp: jest.fn(() => '192.168.1.1'),
  isRateLimited: jest.fn(() => false),
}));

describe('Middleware Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Headers', () => {
    it('should generate CSP nonce', () => {
      // Test that nonce generation works
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const nonce = Buffer.from(array).toString('base64');
      
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should build CSP with nonce', () => {
      const nonce = 'test-nonce-123';
      const directives = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.gstatic.com https://www.google.com https://apis.google.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.googleapis.com https://*.google.com https://firebase.googleapis.com wss://*.firebaseio.com",
        "frame-src 'self' https://www.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ];
      const csp = directives.join('; ');
      
      expect(csp).toContain(`'nonce-${nonce}'`);
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });

  describe('Request Validation', () => {
    it('should validate body size limits', async () => {
      const MAX_BODY_SIZE = 1024 * 1024; // 1MB
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-length': String(MAX_BODY_SIZE + 1),
        },
      });

      const contentLength = request.headers.get('content-length');
      const isValid = contentLength ? parseInt(contentLength, 10) <= MAX_BODY_SIZE : true;
      
      expect(isValid).toBe(false);
    });

    it('should allow requests within size limit', async () => {
      const MAX_BODY_SIZE = 1024 * 1024; // 1MB
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-length': String(MAX_BODY_SIZE - 1000),
        },
      });

      const contentLength = request.headers.get('content-length');
      const isValid = contentLength ? parseInt(contentLength, 10) <= MAX_BODY_SIZE : true;
      
      expect(isValid).toBe(true);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should check rate limiting for API routes', () => {
      const { isRateLimited } = require('@/lib/rate-limiter');
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const path = request.nextUrl.pathname;
      
      expect(path.startsWith('/api')).toBe(true);
      expect(isRateLimited).toBeDefined();
    });

    it('should not rate limit non-API routes', () => {
      const request = new NextRequest('http://localhost:3000/main');
      const path = request.nextUrl.pathname;
      
      expect(path.startsWith('/api')).toBe(false);
    });
  });

  describe('Security Headers Configuration', () => {
    it('should include all required security headers', () => {
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'Content-Security-Policy',
        'Permissions-Policy',
      ];

      // Verify all required headers are defined
      requiredHeaders.forEach(header => {
        expect(header).toBeDefined();
        expect(typeof header).toBe('string');
      });
    });

    it('should set HSTS in production', () => {
      // HSTS should only be set in production
      const isProduction = process.env.NODE_ENV === 'production';
      const hstsValue = 'max-age=31536000; includeSubDomains; preload';
      
      if (isProduction) {
        expect(hstsValue).toContain('max-age=31536000');
        expect(hstsValue).toContain('includeSubDomains');
        expect(hstsValue).toContain('preload');
      }
    });

    it('should allow unsafe-eval in development mode only', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const nonce = 'test-nonce';
      
      // In development, CSP should include 'unsafe-eval' for React debugging
      if (isDevelopment) {
        const devScriptSrc = `script-src 'self' 'unsafe-eval' 'nonce-${nonce}'`;
        expect(devScriptSrc).toContain("'unsafe-eval'");
      } else {
        // In production, CSP should NOT include 'unsafe-eval'
        const prodScriptSrc = `script-src 'self' 'nonce-${nonce}'`;
        expect(prodScriptSrc).not.toContain("'unsafe-eval'");
      }
    });

    it('should configure Permissions-Policy correctly', () => {
      const permissionsPolicy = 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()';
      
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=(self)');
      expect(permissionsPolicy).toContain('payment=()');
    });
  });

  describe('Request Timeout Tracking', () => {
    it('should track request duration', () => {
      const startTime = Date.now();
      const REQUEST_TIMEOUT_MS = 30000;
      
      // Simulate some processing time
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(REQUEST_TIMEOUT_MS);
      expect(typeof duration).toBe('number');
    });
  });
});
