/**
 * Shared Type Definitions
 * Centralized types for API contracts, services, and components
 */

// Location Types
export interface Location {
  lat: number;
  lng: number;
}

export interface LocationBounds {
  northeast: Location;
  southwest: Location;
}

// Venue Types
export interface VenueService {
  id: string;
  name: string;
  type: 'gate' | 'food' | 'restroom' | 'info';
  wait: number;
  location: Location;
  capacity: number;
  currentCount: number;
}

export interface VenueState {
  id: string;
  name: string;
  location: Location;
  services: VenueService[];
  totalCapacity: number;
  currentOccupancy: number;
  lastUpdated: number;
}

// User Types
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  preferences: UserPreferences;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// Prediction Types
export interface PredictionRequest {
  facilityId: string;
  type: 'gate' | 'food' | 'restroom';
  currentWait: number;
}

export interface PredictionResponse {
  facilityId: string;
  originalWait: number;
  predictedWait: number;
  confidence: 'low' | 'medium' | 'high';
  auraReason: string;
  engine: 'vertex-ai' | 'gemini' | 'fallback';
}

export interface QueueState {
  facilityId: string;
  status: 'optimal' | 'busy' | 'locked-in';
  wait: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
}

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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Monitoring Types
export interface LogEntry {
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  context?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

// Analytics Types
export interface KPI {
  name: string;
  value: number;
  unit: string;
  trend: number;
  timestamp: number;
}

export interface AnalyticsData {
  kpis: KPI[];
  period: {
    start: number;
    end: number;
  };
}
