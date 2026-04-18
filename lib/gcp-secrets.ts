import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import path from 'path';
import { logger } from './logger';
import { logSecretAccess } from './security/audit-logger';

/**
 * Secret Manager Client
 * Uses the gcp-key.json (aura-archiver service account)
 * Implements secret rotation support and audit logging
 */
let _client: SecretManagerServiceClient | null = null;

function getSecretClient() {
  if (_client) return _client;

  try {
    const keyPath = path.join(process.cwd(), 'gcp-key.json');
    _client = new SecretManagerServiceClient({
      keyFilename: keyPath,
    });
    return _client;
  } catch (error) {
    logger.critical('Secret Manager client initialization failed', error);
    throw error;
  }
}

// Simple in-memory cache to avoid excessive API calls
// TTL ensures secrets are refreshed periodically (supports rotation)
const secretCache = new Map<string, { value: string; timestamp: number; version: string }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes (allows rotation detection)

/**
 * Fetches a secret version from GCP Secret Manager
 * @param secretName The ID of the secret (e.g. 'MAPS_API_KEY')
 * @param version The version (defaults to 'latest')
 */
export async function getSecret(secretName: string, version: string = 'latest'): Promise<string> {
  const cacheKey = `${secretName}:${version}`;
  const now = Date.now();

  // Check cache
  if (secretCache.has(cacheKey)) {
    const cached = secretCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL) {
      logger.debug('Secret Manager cache hit', { secretName });
      return cached.value;
    }
  }

  try {
    const client = getSecretClient();
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crowdgo-493512';
    const name = `projects/${projectId}/secrets/${secretName}/versions/${version}`;

    logger.debug('Fetching secret from Secret Manager', { secretName });
    const [accessResponse] = await client.accessSecretVersion({ name });
    
    const payload = accessResponse.payload?.data?.toString();
    if (!payload) {
      await logSecretAccess(secretName, false);
      throw new Error(`Secret ${secretName} has no payload`);
    }

    // Cache with version info for rotation detection
    secretCache.set(cacheKey, { 
      value: payload, 
      timestamp: now,
      version: accessResponse.name || version,
    });
    
    await logSecretAccess(secretName, true);
    return payload;
  } catch (error: any) {
    const isNotFound = error.code === 5 || error.message?.includes('not found') || error.status === 404;
    
    // Check for fallback before throwing/logging error
    const envFallback = process.env[secretName] || process.env[`NEXT_PUBLIC_${secretName}`];

    if (isNotFound && envFallback) {
      logger.warn('Secret not found in GCP, using local ENV fallback', { secretName });
      await logSecretAccess(secretName, true, 'env-fallback');
      return envFallback;
    }

    if (!isNotFound) {
      logger.error('Error fetching secret from Secret Manager', error, { secretName });
    }
    
    await logSecretAccess(secretName, false);
    
    if (envFallback) {
      await logSecretAccess(secretName, true, 'env-fallback');
      return envFallback;
    }
    throw error;
  }
}

/**
 * Clear secret cache (useful for forcing rotation)
 */
export function clearSecretCache(secretName?: string): void {
  if (secretName) {
    // Clear specific secret
    for (const key of secretCache.keys()) {
      if (key.startsWith(`${secretName}:`)) {
        secretCache.delete(key);
      }
    }
    logger.info('Cleared secret cache', { secretName });
  } else {
    // Clear all secrets
    secretCache.clear();
    logger.info('Cleared all secret cache');
  }
}

/**
 * Get secret metadata (without exposing the value)
 */
export async function getSecretMetadata(secretName: string): Promise<{
  name: string;
  version: string;
  cached: boolean;
  cacheAge?: number;
}> {
  const cacheKey = `${secretName}:latest`;
  const cached = secretCache.get(cacheKey);
  
  if (cached) {
    return {
      name: secretName,
      version: cached.version,
      cached: true,
      cacheAge: Date.now() - cached.timestamp,
    };
  }

  return {
    name: secretName,
    version: 'unknown',
    cached: false,
  };
}
