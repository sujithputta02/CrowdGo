import { proxy } from '@/proxy';

// Mock Next.js internal classes
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url) => ({
      nextUrl: { pathname: new URL(url).pathname },
      headers: { 
        get: jest.fn((name) => name === 'x-forwarded-for' ? '127.0.0.1' : null) 
      },
    })),
    NextResponse: jest.fn().mockImplementation((body, init) => ({
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
    })),
  };
});

// Add next static method
(require('next/server').NextResponse as any).next = jest.fn().mockImplementation(() => {
  const headers = new Map();
  return {
    headers: {
      set: jest.fn((k, v) => headers.set(k, v)),
      get: jest.fn((k) => headers.get(k)),
    },
    status: 200,
  };
});

describe('Proxy (Middleware)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds security headers to API requests', async () => {
    const { NextRequest } = require('next/server');
    const req = new NextRequest('https://example.com/api/v1/predict');
    
    const res = proxy(req as any);

    expect((res as any).headers.get('X-Frame-Options')).toBe('DENY');
    expect((res as any).headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('implements rate limiting for API routes', () => {
    const { NextRequest } = require('next/server');
    const req = new NextRequest('https://example.com/api/v1/ingest');
    
    let lastResponse;
    // LIMIT is 50
    for (let i = 0; i < 55; i++) {
       lastResponse = proxy(req as any);
    }

    expect(lastResponse?.status).toBe(429);
  });

  it('returns 429 with proper error message when rate limited', () => {
    const { NextRequest, NextResponse } = require('next/server');
    const req = new NextRequest('https://example.com/api/v1/test');
    
    // Exhaust rate limit
    for (let i = 0; i < 51; i++) {
      proxy(req as any);
    }
    
    // Next request should return 429 with error message (line 54)
    const response = proxy(req as any);
    
    expect(response.status).toBe(429);
    // The response body should contain error message
    expect(NextResponse).toHaveBeenCalledWith(
      expect.stringContaining('Too Many Requests'),
      expect.objectContaining({ status: 429 })
    );
  });

  it('does not rate limit non-API routes', () => {
    const { NextRequest } = require('next/server');
    const req = new NextRequest('https://example.com/main');
    
    const res = proxy(req as any);
    
    // Should pass through without rate limiting
    expect(res.status).not.toBe(429);
  });
});
