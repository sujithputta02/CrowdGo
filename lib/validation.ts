/**
 * Input Validation Schemas
 * Centralized validation for API requests and user inputs
 */

import { Location, PredictionRequest, IngestEvent } from './types';

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
  location(value: any): Location {
    if (!value || typeof value !== 'object') {
      throw new ValidationError('location', 'Location must be an object');
    }

    const { lat, lng } = value;

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
  facilityId(value: any): string {
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
  waitTime(value: any): number {
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
  facilityType(value: any): 'gate' | 'food' | 'restroom' {
    const validTypes = ['gate', 'food', 'restroom'];

    if (!validTypes.includes(value)) {
      throw new ValidationError('type', `Type must be one of: ${validTypes.join(', ')}`);
    }

    return value;
  },

  /**
   * Validate prediction request
   */
  predictionRequest(value: any): PredictionRequest {
    if (!value || typeof value !== 'object') {
      throw new ValidationError('request', 'Request must be an object');
    }

    return {
      facilityId: this.facilityId(value.facilityId),
      type: this.facilityType(value.type),
      currentWait: this.waitTime(value.currentWait),
    };
  },

  /**
   * Validate ingest event
   */
  ingestEvent(value: any): IngestEvent {
    if (!value || typeof value !== 'object') {
      throw new ValidationError('event', 'Event must be an object');
    }

    const validTypes = ['GATE_SCAN', 'POS_SALE', 'ENTRY', 'EXIT'];
    if (!validTypes.includes(value.type)) {
      throw new ValidationError('type', `Type must be one of: ${validTypes.join(', ')}`);
    }

    if (!value.payload || typeof value.payload !== 'object') {
      throw new ValidationError('payload', 'Payload must be an object');
    }

    return {
      type: value.type,
      payload: value.payload,
      timestamp: value.timestamp || Date.now(),
      facilityId: this.facilityId(value.facilityId),
    };
  },

  /**
   * Validate email
   */
  email(value: any): string {
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
  password(value: any): string {
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
  string(value: any, minLength: number = 1, maxLength: number = 1000): string {
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
  number(value: any, min: number = -Infinity, max: number = Infinity): number {
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
    console.warn('Validation error:', error);
    return defaultValue;
  }
}
