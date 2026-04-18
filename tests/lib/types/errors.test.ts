/**
 * Tests for Custom Error Classes and Utilities
 */

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
  PredictionError,
  isAppError,
  getErrorMessage,
  toAppError,
} from '@/lib/types/errors';

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with message, code, and status code', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 500);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should include details in error', () => {
      const details = { userId: '123', action: 'test' };
      const error = new AppError('Test error', 'TEST_ERROR', 500, details);
      
      expect(error.details).toEqual(details);
    });

    it('should default to 500 status code', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with 400 status code', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should include field information', () => {
      const error = new ValidationError('Invalid email', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with 401 status code', () => {
      const error = new AuthenticationError('Not authenticated');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Not authenticated');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should use default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an AuthorizationError with 403 status code', () => {
      const error = new AuthorizationError('Access denied');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Access denied');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should use default message', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with 404 status code', () => {
      const error = new NotFoundError('User');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('User not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should format message with resource name', () => {
      const error = new NotFoundError('Document');
      expect(error.message).toBe('Document not found');
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError with 429 status code', () => {
      const error = new RateLimitError('Too many requests');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Too many requests');
      expect(error.code).toBe('RATE_LIMITED');
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });

    it('should use default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create an ExternalServiceError with 503 status code', () => {
      const error = new ExternalServiceError('Google Maps');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('External service error: Google Maps');
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('ExternalServiceError');
    });

    it('should include service name in details', () => {
      const error = new ExternalServiceError('API Service');
      expect(error.details?.service).toBe('API Service');
    });

    it('should include original error message', () => {
      const originalError = new Error('Connection timeout');
      const error = new ExternalServiceError('Database', originalError);
      expect(error.details?.originalError).toBe('Connection timeout');
    });
  });

  describe('PredictionError', () => {
    it('should create a PredictionError with 500 status code', () => {
      const error = new PredictionError('Prediction failed');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Prediction failed');
      expect(error.code).toBe('PREDICTION_FAILED');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('PredictionError');
    });

    it('should include prediction details', () => {
      const error = new PredictionError('Model error', { model: 'gemini', facility: 'gate-1' });
      expect(error.details).toEqual({ model: 'gemini', facility: 'gate-1' });
    });
  });
});

describe('Error Utility Functions', () => {
  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test', 'TEST_CODE', 500);
      expect(isAppError(error)).toBe(true);
    });

    it('should return true for AppError subclasses', () => {
      expect(isAppError(new ValidationError('Test'))).toBe(true);
      expect(isAppError(new AuthenticationError('Test'))).toBe(true);
      expect(isAppError(new NotFoundError('Resource'))).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError({})).toBe(false);
      expect(isAppError(123)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should extract message from AppError', () => {
      const error = new ValidationError('Invalid input');
      expect(getErrorMessage(error)).toBe('Invalid input');
    });

    it('should convert string to message', () => {
      expect(getErrorMessage('Error string')).toBe('Error string');
    });

    it('should return default message for unknown types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
    });
  });

  describe('toAppError', () => {
    it('should return AppError as-is', () => {
      const error = new ValidationError('Test');
      const result = toAppError(error);
      expect(result).toBe(error);
      expect(result).toBeInstanceOf(ValidationError);
    });

    it('should convert Error to AppError', () => {
      const error = new Error('Test error');
      const result = toAppError(error);
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.statusCode).toBe(500);
    });

    it('should convert string to AppError', () => {
      const result = toAppError('Error message');
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.statusCode).toBe(500);
    });

    it('should convert unknown types to AppError', () => {
      const result = toAppError({ custom: 'error' });
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.statusCode).toBe(500);
    });

    it('should preserve original error in details', () => {
      const result = toAppError({ custom: 'error' });
      expect(result.details?.originalError).toBeDefined();
    });
  });
});

describe('Error Integration', () => {
  it('should work with try-catch blocks', () => {
    try {
      throw new ValidationError('Invalid data');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(getErrorMessage(error)).toBe('Invalid data');
      
      const appError = toAppError(error);
      expect(appError.statusCode).toBe(400);
    }
  });

  it('should preserve error details', () => {
    const originalError = new Error('Original');
    const wrappedError = new ExternalServiceError('API', originalError);
    
    expect(wrappedError.details?.originalError).toBe('Original');
  });

  it('should handle async errors', async () => {
    const asyncFunction = async () => {
      throw new AuthenticationError('Not logged in');
    };

    await expect(asyncFunction()).rejects.toThrow('Not logged in');
    
    try {
      await asyncFunction();
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(error).toBeInstanceOf(AuthenticationError);
    }
  });
});
