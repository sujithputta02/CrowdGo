/**
 * Input Validation Schemas
 * Centralized validation for API requests and user inputs
 */

import { Location, PredictionRequest, IngestEvent } from './types';
import { logger } from './logger';

export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string
  ) {
    super(`Validation error on ${field}: ${message}`);
  }
}

export const Validators = {
  /**
   * Validate location coordinates
   */
  location(value: unknown): Location {
    if (!value || typeof value !== 'object') {
      throw new ValidationError('location', 'Location must be an object');
    }

    const { lat, lng } = value as Record<string, unknown>;

    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      throw new ValidationError('location.lat', 'Latitude must be between -90 and 90');
    }

    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      throw new ValidationError('location.lng', 'Longitude must be between -180 and 180');
    }

    return { lat, lng };
  },

  /**
   * Validate facility ID
   */
  facilityId(value: unknown): string {
    if (typeof value !== 'string' || value.length === 0) {
      throw new ValidationError('facilityId', 'Facility ID must be a non-empty string');
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new ValidationError('facilityId', 'Facility ID must contain only lowercase letters, numbers, and hyphens');
    }

    return value;
  },

  /**
   * Validate wait time
   */
  waitTime(value: unknown): number {
    if (typeof value !== 'number') {
      throw new ValidationError('waitTime', 'Wait time must be a number');
    }

    if (value < 0 || value > 1000) {
      throw new ValidationError('waitTime', 'Wait time must be between 0 and 1000 minutes');
    }

    return value;
  },

  /**
   * Validate facility type
   */
  facilityType(value: unknown): 'gate' | 'food' | 'restroom' {
    const validTypes = ['gate', 'food', 'restroom'];

    if (!validTypes.includes(value as string)) {
      throw new ValidationError('type', `Type must be one of: ${validTypes.join(', ')}`);
    }

    return value as 'gate' | 'food' | 'restroom';
  },

  /**
   * Validate prediction request
   */
  predictionRequest(value: unknown): PredictionRequest {
    if (!value || typeof value !== 'object') {
      throw new ValidationError('request', 'Request must be an object');
    }

    const req = value as Record<string, unknown>;

    return {
      facilityId: this.facilityId(req.facilityId),
      type: this.facilityType(req.type),
      currentWait: this.waitTime(req.currentWait),
    };
  },

  /**
   * Validate ingest event
   */
  ingestEvent(value: unknown): IngestEvent {
    if (!value || typeof value !== 'object') {
      throw new ValidationError('event', 'Event must be an object');
    }

    const event = value as Record<string, unknown>;

    const validTypes = ['GATE_SCAN', 'POS_SALE', 'ENTRY', 'EXIT'];
    if (!validTypes.includes(event.type as string)) {
      throw new ValidationError('type', `Type must be one of: ${validTypes.join(', ')}`);
    }

    if (!event.payload || typeof event.payload !== 'object') {
      throw new ValidationError('payload', 'Payload must be an object');
    }

    return {
      type: event.type as 'GATE_SCAN' | 'POS_SALE' | 'ENTRY' | 'EXIT',
      payload: event.payload as Record<string, unknown>,
      timestamp: (event.timestamp as number) || Date.now(),
      facilityId: this.facilityId(event.facilityId),
    };
  },

  /**
   * Validate email
   */
  email(value: unknown): string {
    if (typeof value !== 'string') {
      throw new ValidationError('email', 'Email must be a string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError('email', 'Invalid email format');
    }

    return value;
  },

  /**
   * Validate password
   */
  password(value: unknown): string {
    if (typeof value !== 'string') {
      throw new ValidationError('password', 'Password must be a string');
    }

    if (value.length < 8) {
      throw new ValidationError('password', 'Password must be at least 8 characters');
    }

    return value;
  },

  /**
   * Validate string with length constraints
   */
  string(value: unknown, minLength: number = 1, maxLength: number = 1000): string {
    if (typeof value !== 'string') {
      throw new ValidationError('string', 'Value must be a string');
    }

    if (value.length < minLength) {
      throw new ValidationError('string', `String must be at least ${minLength} characters`);
    }

    if (value.length > maxLength) {
      throw new ValidationError('string', `String must be at most ${maxLength} characters`);
    }

    return value;
  },

  /**
   * Validate number within range
   */
  number(value: unknown, min: number = -Infinity, max: number = Infinity): number {
    if (typeof value !== 'number') {
      throw new ValidationError('number', 'Value must be a number');
    }

    if (value < min || value > max) {
      throw new ValidationError('number', `Number must be between ${min} and ${max}`);
    }

    return value;
  },
};

/**
 * Safe validation wrapper that returns null on error
 */
export function validateSafe<T>(
  validator: () => T,
  defaultValue: T | null = null
): T | null {
  try {
    return validator();
  } catch (error) {
    logger.warn('Validation error', { error });
    return defaultValue;
  }
}
