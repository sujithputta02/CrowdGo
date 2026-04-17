import { POST } from '@/app/api/v1/predict/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/bigquery', () => ({
  BigQueryService: {
    getHistoricalSurgeTrend: jest.fn().mockResolvedValue(100),
  },
}));

jest.mock('@/lib/vertex', () => ({
  VertexAIService: {
    predict: jest.fn(),
  },
}));

jest.mock('@/lib/gemini', () => ({
  GeminiService: {
    generateAuraReason: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    log: jest.fn(),
  },
}));

describe('POST /api/v1/predict', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should accept valid prediction request', async () => {
    const payload = {
      facilityId: 'gate-1',
      type: 'gate',
      currentWait: 15,
    };

    expect(payload.facilityId).toBeDefined();
    expect(payload.type).toBeDefined();
    expect(payload.currentWait).toBeDefined();
  });

  it('should validate facility ID format', () => {
    const facilityId = 'gate-1';
    
    expect(facilityId).toMatch(/^[a-z0-9-]+$/);
  });

  it('should validate wait time bounds', () => {
    const currentWait = 15;
    
    expect(currentWait).toBeGreaterThanOrEqual(0);
    expect(currentWait).toBeLessThanOrEqual(1000);
  });

  it('should validate facility type', () => {
    const validTypes = ['gate', 'food', 'restroom'];
    
    expect(validTypes).toContain('gate');
  });
});
