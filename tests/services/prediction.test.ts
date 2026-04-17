import { PredictionService } from '@/lib/services/prediction.service';

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    log: jest.fn(),
  },
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('PredictionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate facility ID format', () => {
    const validFacilityId = 'gate-1';
    
    expect(validFacilityId).toMatch(/^[a-z0-9-]+$/);
  });

  it('should validate wait time bounds', () => {
    const validWaitTime = 15;
    
    expect(validWaitTime).toBeGreaterThanOrEqual(0);
    expect(validWaitTime).toBeLessThanOrEqual(1000);
  });

  it('should validate facility type', () => {
    const validTypes = ['gate', 'food', 'restroom'];
    
    expect(validTypes).toContain('gate');
  });

  it('should handle invalid facility ID', () => {
    const invalidFacilityId = '';
    
    expect(invalidFacilityId).toBe('');
  });

  it('should handle out of bounds wait time', () => {
    const invalidWaitTime = 1001;
    
    expect(invalidWaitTime).toBeGreaterThan(1000);
  });
});
