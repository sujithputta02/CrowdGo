/**
 * Google Maps API Type Definitions
 * Provides type safety for Google Maps JavaScript API
 */

export interface GoogleMapsLatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleMapsLatLngLiteral {
  lat: number;
  lng: number;
}

export interface GoogleMapsMap {
  setCenter(latLng: GoogleMapsLatLngLiteral): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: GoogleMapsLatLngBounds, padding?: number): void;
  getCenter(): GoogleMapsLatLng;
}

export interface GoogleMapsLatLngBounds {
  extend(point: GoogleMapsLatLng): void;
  getCenter(): GoogleMapsLatLng;
}

export interface GoogleMapsMarker {
  setMap(map: GoogleMapsMap | null): void;
  addListener(event: string, handler: () => void): void;
  map: GoogleMapsMap | null;
  auraCategory?: string;
}

export interface GoogleMapsPinElement {
  background: string;
  borderColor: string;
  glyphColor: string;
  scale: number;
}

export interface GoogleMapsPolyline {
  setMap(map: GoogleMapsMap | null): void;
}

export interface GoogleMapsPlace {
  displayName: string;
  location: GoogleMapsLatLng;
  businessStatus?: string;
  types?: string[];
}

export interface GoogleMapsSearchNearbyRequest {
  fields: string[];
  locationRestriction: {
    center: GoogleMapsLatLngLiteral;
    radius: number;
  };
  includedPrimaryTypes: string[];
  maxResultCount: number;
}

export interface GoogleMapsSearchNearbyResponse {
  places: GoogleMapsPlace[];
}

export interface GoogleMapsGeometry {
  encoding: {
    decodePath(encodedPath: string): GoogleMapsLatLng[];
  };
  spherical: {
    computeDistanceBetween(from: GoogleMapsLatLng, to: GoogleMapsLatLng): number;
  };
}

// Window augmentation for Google Maps global
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => GoogleMapsMap;
        LatLng: new (lat: number, lng: number) => GoogleMapsLatLng;
        LatLngBounds: new () => GoogleMapsLatLngBounds;
        Polyline: new (options: any) => GoogleMapsPolyline;
        geometry: GoogleMapsGeometry;
      };
    };
    _AURA_MAP_INITIALIZED?: boolean;
  }
}
