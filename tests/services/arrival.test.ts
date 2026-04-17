import { ArrivalService, ArrivalRecommendation } from '@/lib/services/arrival.service';

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('ArrivalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get arrival recommendation for valid section', () => {
    const recommendation = ArrivalService.getRecommendation('105');

    expect(recommendation).toBeDefined();
    expect(recommendation.recommendedGate).toBeDefined();
    expect(recommendation.arrivalWindow).toBeDefined();
    expect(recommendation.status).toMatch(/early|on-time|late/);
    expect(recommendation.loadLevel).toMatch(/low|medium|high/);
  });

  it('should recommend gate 1 for sections 100-110', () => {
    const recommendation = ArrivalService.getRecommendation('105');

    expect(recommendation.recommendedGate).toBe('1');
  });

  it('should recommend gate 2 for sections 111-120', () => {
    const recommendation = ArrivalService.getRecommendation('115');

    expect(recommendation.recommendedGate).toBe('2');
  });

  it('should recommend gate 3 for sections above 120', () => {
    const recommendation = ArrivalService.getRecommendation('125');

    expect(recommendation.recommendedGate).toBe('3');
  });

  it('should return valid arrival window', () => {
    const recommendation = ArrivalService.getRecommendation('110');

    expect(recommendation.arrivalWindow).toMatch(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/);
  });

  it('should handle edge case sections', () => {
    const rec1 = ArrivalService.getRecommendation('100');
    const rec2 = ArrivalService.getRecommendation('111');
    const rec3 = ArrivalService.getRecommendation('121');

    expect(rec1.recommendedGate).toBe('1');
    expect(rec2.recommendedGate).toBe('2');
    expect(rec3.recommendedGate).toBe('3');
  });
});
