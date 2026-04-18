/**
 * Security Audit Logger
 * Structured logging for security-relevant events
 */

import { logger } from '../logger';
import { MonitoringService } from '../monitoring';

export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'TOKEN_VERIFICATION_FAILED'
  | 'AUTHORIZATION_DENIED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_INPUT'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SECRET_ACCESS'
  | 'SECRET_ACCESS_FAILED'
  | 'ADMIN_ACTION'
  | 'DATA_ACCESS'
  | 'DATA_MODIFICATION'
  | 'WEBHOOK_VERIFICATION_FAILED'
  | 'CSRF_VALIDATION_FAILED'
  | 'SSRF_ATTEMPT_BLOCKED';

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  resource?: string;
  action?: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a security event with structured data
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    type: 'SECURITY_EVENT',
    event: event.type,
    userId: event.userId || 'anonymous',
    ip: event.ip || 'unknown',
    userAgent: event.userAgent || 'unknown',
    path: event.path,
    method: event.method,
    resource: event.resource,
    action: event.action,
    success: event.success,
    reason: event.reason,
    timestamp,
    ...event.metadata,
  };

  // Log to console in structured format
  if (event.success) {
    logger.info(`Security Event: ${event.type}`, logEntry);
  } else {
    logger.warn(`Security Event: ${event.type}`, logEntry);
  }

  // Send to Cloud Logging in production
  if (process.env.NODE_ENV === 'production') {
    try {
      await MonitoringService.log(
        `Security Event: ${event.type}`,
        event.success ? 'INFO' : 'WARNING',
        logEntry
      );
    } catch (error) {
      // Silently fail if Cloud Logging is unavailable
      logger.error('Failed to send security event to Cloud Logging', error);
    }
  }
}

/**
 * Log authentication attempt
 */
export async function logAuthAttempt(
  userId: string,
  ip: string,
  success: boolean,
  reason?: string
): Promise<void> {
  await logSecurityEvent({
    type: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
    userId,
    ip,
    success,
    reason,
  });
}

/**
 * Log authorization check
 */
export async function logAuthorizationCheck(
  userId: string,
  resource: string,
  action: string,
  granted: boolean,
  reason?: string
): Promise<void> {
  await logSecurityEvent({
    type: 'AUTHORIZATION_DENIED',
    userId,
    resource,
    action,
    success: granted,
    reason,
  });
}

/**
 * Log rate limit event
 */
export async function logRateLimitEvent(
  ip: string,
  path: string,
  exceeded: boolean
): Promise<void> {
  await logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    ip,
    path,
    success: !exceeded,
    reason: exceeded ? 'Rate limit exceeded' : 'Within rate limit',
  });
}

/**
 * Log secret access
 */
export async function logSecretAccess(
  secretName: string,
  success: boolean,
  userId?: string
): Promise<void> {
  await logSecurityEvent({
    type: success ? 'SECRET_ACCESS' : 'SECRET_ACCESS_FAILED',
    userId,
    resource: secretName,
    success,
  });
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logSecurityEvent({
    type: 'ADMIN_ACTION',
    userId,
    action,
    resource,
    success: true,
    metadata,
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  ip: string,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logSecurityEvent({
    type: 'SUSPICIOUS_ACTIVITY',
    ip,
    success: false,
    reason,
    metadata,
  });
}

/**
 * Log data access
 */
export async function logDataAccess(
  userId: string,
  resource: string,
  action: 'read' | 'write' | 'delete',
  success: boolean
): Promise<void> {
  await logSecurityEvent({
    type: action === 'read' ? 'DATA_ACCESS' : 'DATA_MODIFICATION',
    userId,
    resource,
    action,
    success,
  });
}
