/**
 * Google Maps Positioning & Routing Service
 */

import { logger } from '../logger.client';
import { Location } from '../types';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteData {
  duration: string;
  distanceMeters: number;
  polyline: {
    encodedPolyline: string;
  };
}

export interface POI {
  name: string;
  lat: number;
  lng: number;
  type: string;
  id: string;
}

export const MapsService = {
  /**
   * Fetches a computed route from our secure backend proxy
   */
  async getWalkRoute(origin: LatLng, destination: LatLng): Promise<RouteData | null> {
    try {
      const response = await fetch('/api/v1/maps/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin, destination, travelMode: 'WALKING' }),
      });

      if (!response.ok) {
        logger.warn('Maps route fetch failed - likely API restriction');
        return null;
      }
      
      const data = await response.json();
      return data.routes?.[0] || null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error('Maps service route error', { message: error.message });
      }
      return null;
    }
  },

  // Wankhede Stadium, Mumbai - Home of IPL 2026
  WANKHEDE: { lat: 18.9389, lng: 72.8258 } as Location,
  
  LOCATIONS: {
    'gate-1': { lat: 18.9378, lng: 72.8257 },
    'gate-3': { lat: 18.9388, lng: 72.8245 },
    'gate-5': { lat: 18.9400, lng: 72.8265 },
    'churchgate': { lat: 18.9351, lng: 72.8273 },
    'seat-a1': { lat: 18.9392, lng: 72.8255 }
  } as Record<string, Location>,

  POINTS_OF_INTEREST: [
    { name: 'Gate 1 (Garware)', lat: 18.9378, lng: 72.8257, type: 'gate', id: 'gate-1' },
    { name: 'Gate 3 (Merchant)', lat: 18.9388, lng: 72.8245, type: 'gate', id: 'gate-3' },
    { name: 'Gate 5 (Gavaskar)', lat: 18.9400, lng: 72.8265, type: 'gate', id: 'gate-5' },
    { name: 'Churchgate Hub', lat: 18.9351, lng: 72.8273, type: 'hub', id: 'churchgate' },
  ] as POI[],

  SEAT_A1: { lat: 18.9392, lng: 72.8255 } as Location, // Sachin Tendulkar Stand 
};
