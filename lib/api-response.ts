/**
 * Standardized API Response Wrapper
 * Ensures consistent error handling and response formatting
 */

import { NextResponse } from 'next/server';
import { ApiResponse, ApiError } from './types';
import { logger } from './logger';

export class ApiResponseHandler {
  /**
   * Success response
   */
  static success<T>(data: T, statusCode: number = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: Date.now(),
      },
      { status: statusCode }
    );
  }

  /**
   * Error response
   */
  static error(
    message: string,
    statusCode: number = 400,
    code?: string,
    details?: Record<string, any>
  ): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: code || 'ERROR',
          message,
          details,
        },
        timestamp: Date.now(),
      },
      { status: statusCode }
    );
  }

  /**
   * Validation error response
   */
  static validationError(
    field: string,
    message: string
  ): NextResponse<ApiResponse<null>> {
    return this.error(
      `Validation failed on field: ${field}`,
      400,
      'VALIDATION_ERROR',
      { field, message }
    );
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse<null>> {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  /**
   * Forbidden response
   */
  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse<null>> {
    return this.error(message, 403, 'FORBIDDEN');
  }

  /**
   * Not found response
   */
  static notFound(resource: string): NextResponse<ApiResponse<null>> {
    return this.error(`${resource} not found`, 404, 'NOT_FOUND');
  }

  /**
   * Rate limit response
   */
  static rateLimited(): NextResponse<ApiResponse<null>> {
    return this.error(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMITED'
    );
  }

  /**
   * Internal server error response
   */
  static internalError(message: string = 'Internal server error'): NextResponse<ApiResponse<null>> {
    return this.error(message, 500, 'INTERNAL_ERROR');
  }
}

// Export as apiResponse for convenience
export const apiResponse = ApiResponseHandler;

/**
 * Safe async handler wrapper
 */
export async function safeHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  try {
    return await handler();
  } catch (error) {
    logger.error('API handler error', error);
    return ApiResponseHandler.internalError() as any;
  }
}
