/**
 * Application Constants
 * Centralized constants to eliminate magic strings and numbers
 */

// Firestore Collections
export const FIRESTORE_COLLECTIONS = {
  VENUES: 'venues',
  USERS: 'users',
  EVENTS: 'events',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
} as const;

// Venue IDs
export const VENUE_IDS = {
  WANKHEDE: 'wankhede',
} as const;

// Event Types
export const EVENT_TYPES = {
  GATE_SCAN: 'GATE_SCAN',
  POS_SALE: 'POS_SALE',
  ENTRY: 'ENTRY',
  EXIT: 'EXIT',
} as const;

// Facility Types
export const FACILITY_TYPES = {
  GATE: 'gate',
  FOOD: 'food',
  RESTROOM: 'restroom',
  INFO: 'info',
} as const;

// Queue Status
export const QUEUE_STATUS = {
  OPTIMAL: 'optimal',
  BUSY: 'busy',
  LOCKED_IN: 'locked-in',
} as const;

// Prediction Confidence
export const CONFIDENCE_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Prediction Engines
export const PREDICTION_ENGINES = {
  VERTEX_AI: 'vertex-ai',
  GEMINI: 'gemini',
  FALLBACK: 'fallback',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

// User Preferences
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  INGEST: '/api/v1/ingest',
  PREDICT: '/api/v1/predict',
  ANALYTICS_KPIS: '/api/v1/analytics/kpis',
  MAPS_ROUTES: '/api/v1/maps/routes',
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 100,
  WINDOW_MS: 60 * 1000,
  CLEANUP_INTERVAL: 5 * 60 * 1000,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30 * 1000,
  PREDICTION: 10 * 1000,
  GEMINI: 15 * 1000,
  FIRESTORE: 10 * 1000,
} as const;

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  VENUE_STATE: 5 * 1000,
  PREDICTIONS: 10 * 1000,
  ROUTES: 30 * 1000,
  USER_PROFILE: 60 * 1000,
} as const;

// Validation Constraints
export const VALIDATION = {
  FACILITY_ID_PATTERN: /^[a-z0-9-]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_WAIT_TIME: 1000,
  MIN_WAIT_TIME: 0,
  MAX_LATITUDE: 90,
  MIN_LATITUDE: -90,
  MAX_LONGITUDE: 180,
  MIN_LONGITUDE: -180,
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  VENUE_NOT_FOUND: 'VENUE_NOT_FOUND',
  PREDICTION_FAILED: 'PREDICTION_FAILED',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Log Levels
export const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
} as const;

// Environment Variables
export const ENV_VARS = {
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  PUBSUB_VERIFICATION_TOKEN: process.env.PUBSUB_VERIFICATION_TOKEN,
  VERTEX_AI_LOCATION: process.env.VERTEX_AI_LOCATION || 'us-central1',
  VERTEX_AI_MODEL: process.env.VERTEX_AI_MODEL || 'gemini-1.5-flash',
} as const;

// Wankhede Stadium Coordinates
export const STADIUM_COORDINATES = {
  WANKHEDE: {
    lat: 19.0176,
    lng: 72.8194,
  },
} as const;

// Default Values
export const DEFAULTS = {
  ZOOM_LEVEL: 18,
  MAP_TYPE: 'roadmap' as const,
  THEME: 'dark' as const,
  LANGUAGE: 'en',
  NOTIFICATIONS_ENABLED: true,
} as const;
