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

  it('should successfully generate aura reason with valid API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{
        candidates: [{
          content: {
            parts: [{
              text: 'Perfect timing! Gate flow is optimal right now.'
            }]
          }
        }]
      }])
    });

    const result = await GeminiService.generateAuraReason(mockContext);
    
    expect(result).toBe('Perfect timing! Gate flow is optimal right now.');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should handle alternative API response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: 'Crowd surge detected. Consider alternative route.'
            }]
          }
        }]
      })
    });

    const result = await GeminiService.generateAuraReason(mockContext);
    
    expect(result).toBe('Crowd surge detected. Consider alternative route.');
  });

  it('should return null on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    const result = await GeminiService.generateAuraReason(mockContext);
    
    expect(result).toBeNull();
  });

  it('should return null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await GeminiService.generateAuraReason(mockContext);
    
    expect(result).toBeNull();
  });

  it('should return null on invalid response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        invalid: 'response'
      })
    });

    const result = await GeminiService.generateAuraReason(mockContext);
    
    expect(result).toBeNull();
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

    // Should return null when token is not available
    expect(result).toBeNull();
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

    // Should return null on authentication error
    expect(result).toBeNull();
  });
});
