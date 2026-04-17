import { MapsService, LatLng, RouteData } from '@/lib/services/maps.service';

describe('MapsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have valid Wankhede stadium coordinates', () => {
    expect(MapsService.WANKHEDE).toBeDefined();
    expect(MapsService.WANKHEDE.lat).toBe(18.9389);
    expect(MapsService.WANKHEDE.lng).toBe(72.8258);
  });

  it('should have predefined locations', () => {
    expect(MapsService.LOCATIONS).toBeDefined();
    expect(MapsService.LOCATIONS['gate-1']).toBeDefined();
    expect(MapsService.LOCATIONS['gate-3']).toBeDefined();
    expect(MapsService.LOCATIONS['gate-5']).toBeDefined();
  });

  it('should have points of interest', () => {
    expect(MapsService.POINTS_OF_INTEREST).toBeDefined();
    expect(MapsService.POINTS_OF_INTEREST.length).toBeGreaterThan(0);
  });

  it('should validate location coordinates', () => {
    const validLocation = MapsService.WANKHEDE;
    
    expect(validLocation.lat).toBeGreaterThanOrEqual(-90);
    expect(validLocation.lat).toBeLessThanOrEqual(90);
    expect(validLocation.lng).toBeGreaterThanOrEqual(-180);
    expect(validLocation.lng).toBeLessThanOrEqual(180);
  });

  it('should handle route calculation with valid inputs', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          routes: [{ 
            duration: '5 mins',
            distanceMeters: 500,
            polyline: { encodedPolyline: 'test' } 
          }],
        }),
      })
    ) as jest.Mock;

    const result = await MapsService.getWalkRoute(
      { latitude: 18.9389, longitude: 72.8258 },
      { latitude: 18.9400, longitude: 72.8265 }
    );

    expect(result).toBeDefined();
    expect(result?.duration).toBe('5 mins');
  });

  it('should handle route calculation errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API error'))
    ) as jest.Mock;

    const result = await MapsService.getWalkRoute(
      { latitude: 18.9389, longitude: 72.8258 },
      { latitude: 18.9400, longitude: 72.8265 }
    );

    expect(result).toBeNull();
  });

  it('should return null for failed API responses', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    ) as jest.Mock;

    const result = await MapsService.getWalkRoute(
      { latitude: 18.9389, longitude: 72.8258 },
      { latitude: 18.9400, longitude: 72.8265 }
    );

    expect(result).toBeNull();
  });

  it('should have SEAT_A1 location', () => {
    expect(MapsService.SEAT_A1).toBeDefined();
    expect(MapsService.SEAT_A1.lat).toBe(18.9392);
    expect(MapsService.SEAT_A1.lng).toBe(72.8255);
  });

  it('should return null when routes array is empty', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          routes: [], // Empty routes array (line 38 branch)
        }),
      })
    ) as jest.Mock;

    const result = await MapsService.getWalkRoute(
      { latitude: 18.9389, longitude: 72.8258 },
      { latitude: 18.9400, longitude: 72.8265 }
    );

    expect(result).toBeNull();
  });

  it('should return null when routes is undefined', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          // No routes property (line 38 branch)
        }),
      })
    ) as jest.Mock;

    const result = await MapsService.getWalkRoute(
      { latitude: 18.9389, longitude: 72.8258 },
      { latitude: 18.9400, longitude: 72.8265 }
    );

    expect(result).toBeNull();
  });
});
