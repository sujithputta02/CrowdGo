import { Location } from './common';

// Event Types
export interface IngestEvent {
  type: 'GATE_SCAN' | 'POS_SALE' | 'ENTRY' | 'EXIT';
  payload: Record<string, any>;
  timestamp: number;
  facilityId: string;
}

export interface EventPayload {
  facilityId: string;
  count: number;
  timestamp?: number;
}

// Route Types
export interface RouteRequest {
  origin: Location;
  destination: Location;
  travelMode?: 'DRIVE' | 'WALK';
}

export interface RouteResponse {
  polyline: string;
  distance: number;
  duration: number;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}
