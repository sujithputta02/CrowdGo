/**
 * SSRF Protection
 * Validates URLs for outbound requests to prevent Server-Side Request Forgery
 */

import { logger } from '../logger';

// Blocked IP ranges (private networks, localhost, link-local)
const BLOCKED_IP_PATTERNS = [
  /^127\./,                    // Loopback
  /^10\./,                     // Private network
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private network
  /^192\.168\./,               // Private network
  /^169\.254\./,               // Link-local
  /^::1$/,                     // IPv6 loopback
  /^::ffff:127\./,             // IPv4-mapped IPv6 loopback
  /^fe80:/i,                   // IPv6 link-local
  /^fc00:/i,                   // IPv6 unique local
  /^fd00:/i,                   // IPv6 unique local
];

// Allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// Blocked hostnames
const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal', // GCP metadata service
  '169.254.169.254',          // AWS/GCP metadata IP
];

/**
 * Validate URL for SSRF protection
 */
export function validateURL(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      logger.warn('SSRF: Blocked protocol', { url: urlString, protocol: url.protocol });
      return { valid: false, error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' };
    }

    // Check hostname against blocked list
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      logger.warn('SSRF: Blocked hostname', { url: urlString, hostname });
      return { valid: false, error: 'Access to this hostname is not allowed.' };
    }

    // Check for IP address patterns (both IPv4 and IPv6)
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        logger.warn('SSRF: Blocked IP range', { url: urlString, hostname });
        return { valid: false, error: 'Access to private IP ranges is not allowed.' };
      }
    }

    // Additional IPv6 checks (hostname may include brackets)
    const cleanHostname = hostname.replace(/^\[|\]$/g, ''); // Remove brackets
    if (cleanHostname.includes(':')) {
      // This is likely an IPv6 address
      if (cleanHostname === '::1' || cleanHostname.startsWith('fe80:') || cleanHostname.startsWith('fc00:') || cleanHostname.startsWith('fd00:')) {
        logger.warn('SSRF: Blocked IPv6 address', { url: urlString, hostname });
        return { valid: false, error: 'Access to private IP ranges is not allowed.' };
      }
    }

    // Check for URL encoding tricks (double encoding, etc.)
    if (urlString !== decodeURIComponent(urlString)) {
      const decoded = decodeURIComponent(urlString);
      if (decoded !== urlString) {
        logger.warn('SSRF: URL encoding detected', { url: urlString, decoded });
        return { valid: false, error: 'URL encoding is not allowed.' };
      }
    }

    return { valid: true };
  } catch (error) {
    logger.warn('SSRF: Invalid URL format', { url: urlString, error });
    return { valid: false, error: 'Invalid URL format.' };
  }
}

/**
 * Safe fetch wrapper with SSRF protection
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const validation = validateURL(url);
  
  if (!validation.valid) {
    throw new Error(`SSRF Protection: ${validation.error}`);
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Validate webhook URL before registering
 */
export function validateWebhookURL(url: string): boolean {
  const validation = validateURL(url);
  
  if (!validation.valid) {
    logger.error('Invalid webhook URL', { url, error: validation.error });
    return false;
  }

  // Additional webhook-specific checks
  try {
    const urlObj = new URL(url);
    
    // Webhooks should use HTTPS in production
    if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
      logger.warn('Webhook URL should use HTTPS in production', { url });
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
