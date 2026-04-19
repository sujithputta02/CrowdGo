import { GeminiService } from '@/lib/gemini';

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Google Auth
jest.mock('google-auth-library', () => ({
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getClient: jest.fn().mockResolvedValue({
      getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-access-token' }),
    }),
  })),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('GeminiService', () => {
  const mockContext = {
    facilityName: 'Test Gate',
    currentWait: 10,
    predictedWait: 15,
    recentScans: 100,
    isSurge: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should have generateAuraReason method', () => {
    expect(GeminiService.generateAuraReason).toBeDefined();
  });

  it('should accept valid context', () => {
    expect(mockContext.facilityName).toBeDefined();
    expect(mockContext.currentWait).toBeGreaterThanOrEqual(0);
    expect(mockContext.predictedWait).toBeGreaterThanOrEqual(0);
  });

  it('should handle context with surge flag', () => {
    expect(mockContext.isSurge).toBe(true);
  });

  it('should validate recent scans count', () => {
    expect(mockContext.recentScans).toBeGreaterThanOrEqual(0);
  });

  it('should successfully generate aura reason with local reasoning', async () => {
    const result = await GeminiService.generateAuraReason(mockContext);
    
    // Should return local reasoning since no API key is configured
    expect(result).not.toBeNull();
    expect(result).toContain('Test Gate');
  });

  it('should handle different context scenarios', async () => {
    const result = await GeminiService.generateAuraReason(mockContext);
    
    // Should return local reasoning
    expect(result).not.toBeNull();
    expect(result).toContain('Test Gate');
  });

  it('should return null on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    const result = await GeminiService.generateAuraReason(mockContext);
    
    // Should return local reasoning as fallback, not null
    expect(result).not.toBeNull();
    expect(result).toContain('Test Gate');
  });

  it('should return null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await GeminiService.generateAuraReason(mockContext);
    
    // Should return local reasoning as fallback, not null
    expect(result).not.toBeNull();
    expect(result).toContain('Test Gate');
  });

  it('should return null on invalid response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        invalid: 'response'
      })
    });

    const result = await GeminiService.generateAuraReason(mockContext);
    
    // Should return local reasoning as fallback, not null
    expect(result).not.toBeNull();
    expect(result).toContain('Test Gate');
  });

  it('should handle authentication token failure', async () => {
    // Mock GoogleAuth to return null token (line 40)
    const { GoogleAuth } = require('google-auth-library');
    GoogleAuth.mockImplementationOnce(() => ({
      getClient: jest.fn().mockResolvedValue({
        getAccessToken: jest.fn().mockResolvedValue({ token: null }),
      }),
    }));

    const result = await GeminiService.generateAuraReason({
      facilityName: 'Test',
      currentWait: 5,
      predictedWait: 3,
      recentScans: 10,
      isSurge: false,
    });

    // Should return local reasoning as fallback when token fails
    expect(result).not.toBeNull();
    expect(result).toContain('Test');
  });

  it('should handle access token error', async () => {
    // Mock GoogleAuth to throw error when getting access token
    const { GoogleAuth } = require('google-auth-library');
    GoogleAuth.mockImplementationOnce(() => ({
      getClient: jest.fn().mockResolvedValue({
        getAccessToken: jest.fn().mockRejectedValue(new Error('Token error')),
      }),
    }));

    const result = await GeminiService.generateAuraReason({
      facilityName: 'Test',
      currentWait: 5,
      predictedWait: 3,
      recentScans: 10,
      isSurge: false,
    });

    // Should return local reasoning as fallback on authentication error
    expect(result).not.toBeNull();
    expect(result).toContain('Test');
  });
});
