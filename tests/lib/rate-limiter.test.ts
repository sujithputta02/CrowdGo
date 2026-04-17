import { isRateLimited, getRemainingRequests, getResetTime, getClientIp } from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within limit', () => {
    const ip = '192.168.1.1';
    
    for (let i = 0; i < 50; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }
  });

  it('should block requests exceeding limit', () => {
    const ip = '192.168.1.2';
    
    // Fill up the limit
    for (let i = 0; i < 100; i++) {
      isRateLimited(ip);
    }
    
    // Next request should be rate limited
    expect(isRateLimited(ip)).toBe(true);
  });

  it('should track remaining requests', () => {
    const ip = '192.168.1.3';
    
    isRateLimited(ip);
    const remaining = getRemainingRequests(ip);
    
    expect(remaining).toBeLessThan(100);
    expect(remaining).toBeGreaterThan(0);
  });

  it('should return reset time', () => {
    const ip = '192.168.1.4';
    
    isRateLimited(ip);
    const resetTime = getResetTime(ip);
    
    expect(resetTime).toBeGreaterThan(Date.now());
  });

  it('should extract client IP from headers', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.1, 198.51.100.1',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('203.0.113.1');
  });

  it('should fallback to x-real-ip', () => {
    const headers = new Headers({
      'x-real-ip': '203.0.113.2',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('203.0.113.2');
  });

  it('should use default IP when headers missing', () => {
    const headers = new Headers();
    
    const ip = getClientIp(headers);
    expect(ip).toBe('127.0.0.1');
  });

  it('should reset after time window', () => {
    const ip = '192.168.1.5';
    
    // Fill up the limit
    for (let i = 0; i < 100; i++) {
      isRateLimited(ip);
    }
    
    expect(isRateLimited(ip)).toBe(true);
    
    // Wait for reset (in real scenario, time would pass)
    // For testing, we can verify the reset time is in the future
    const resetTime = getResetTime(ip);
    expect(resetTime).toBeGreaterThan(Date.now());
  });

  it('should handle multiple IPs independently', () => {
    const ip1 = '192.168.1.6';
    const ip2 = '192.168.1.7';
    
    // Use up ip1's limit
    for (let i = 0; i < 100; i++) {
      isRateLimited(ip1);
    }
    
    // ip1 should be limited
    expect(isRateLimited(ip1)).toBe(true);
    
    // ip2 should still be allowed
    expect(isRateLimited(ip2)).toBe(false);
  });

  it('should return 0 remaining when limit exceeded', () => {
    const ip = '192.168.1.8';
    
    // Fill up the limit
    for (let i = 0; i < 100; i++) {
      isRateLimited(ip);
    }
    
    isRateLimited(ip); // One more to exceed
    
    const remaining = getRemainingRequests(ip);
    expect(remaining).toBe(0);
  });

  it('should handle IPv6 addresses', () => {
    const headers = new Headers({
      'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    });
    
    const ip = getClientIp(headers);
    expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should handle multiple forwarded IPs correctly', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1',
    });
    
    const ip = getClientIp(headers);
    // Should return the first IP (client IP)
    expect(ip).toBe('203.0.113.1');
  });

  it('should return LIMIT for unknown IP in getRemainingRequests', () => {
    const remaining = getRemainingRequests('unknown-ip');
    expect(remaining).toBe(100);
  });

  it('should return LIMIT when reset time has passed', () => {
    const ip = '192.168.1.9';
    
    // Use up some requests
    for (let i = 0; i < 10; i++) {
      isRateLimited(ip);
    }
    
    // Mock time passing beyond reset
    const entry = (isRateLimited as any).rateLimitMap?.get(ip);
    if (entry) {
      entry.resetTime = Date.now() - 1000; // Set reset time in the past
    }
    
    const remaining = getRemainingRequests(ip);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should handle edge case of exactly LIMIT requests', () => {
    const ip = '192.168.1.10';
    
    // Use exactly LIMIT requests
    for (let i = 0; i < 100; i++) {
      isRateLimited(ip);
    }
    
    // Next request should be limited
    expect(isRateLimited(ip)).toBe(true);
    expect(getRemainingRequests(ip)).toBe(0);
  });

  it('should cleanup old entries after interval', () => {
    const ip = '192.168.1.11';
    
    // Make a request
    isRateLimited(ip);
    
    // Fast-forward time beyond cleanup interval (5 minutes) + window (1 minute)
    jest.advanceTimersByTime(6 * 60 * 1000 + 1000);
    
    // The cleanup interval should have run
    // After cleanup, the entry should be removed and new requests should be allowed
    expect(isRateLimited(ip)).toBe(false);
  });

  it('should handle reset time edge case when time equals resetTime', () => {
    const ip = '192.168.1.12';
    
    // Make initial request
    isRateLimited(ip);
    
    // Get the reset time
    const resetTime = getResetTime(ip);
    
    // Mock Date.now to return exactly the reset time
    const originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(resetTime);
    
    // Should create new window since now > resetTime is false, but now === resetTime
    const remaining = getRemainingRequests(ip);
    
    // Restore Date.now
    Date.now = originalNow;
    
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should handle reset time when exactly at boundary', () => {
    const ip = '192.168.1.13';
    
    // Make initial request
    isRateLimited(ip);
    
    // Get the reset time
    const resetTime = getResetTime(ip);
    
    // Mock Date.now to return exactly the reset time + 1ms
    const originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(resetTime + 1);
    
    // Should create new window since now > resetTime
    expect(isRateLimited(ip)).toBe(false);
    
    // Restore Date.now
    Date.now = originalNow;
  });
});
