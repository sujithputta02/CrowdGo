import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import path from 'path';
import { logger } from './logger';

/**
 * Secret Manager Client
 * Uses the gcp-key.json (aura-archiver service account)
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
const secretCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

/**
 * Fetches a secret version from GCP Secret Manager
 * @param secretName The ID of the secret (e.g. 'MAPS_API_KEY')
 * @param version The version (defaults to 'latest')
 */
export async function getSecret(secretName: string, version: string = 'latest'): Promise<string> {
  const cacheKey = `${secretName}:${version}`;
  const now = Date.now();

  if (secretCache.has(cacheKey)) {
    const { value, timestamp } = secretCache.get(cacheKey)!;
    if (now - timestamp < CACHE_TTL) {
      logger.debug('Secret Manager cache hit', { secretName });
      return value;
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
      throw new Error(`Secret ${secretName} has no payload`);
    }

    secretCache.set(cacheKey, { value: payload, timestamp: now });
    return payload;
  } catch (error: any) {
    const isNotFound = error.code === 5 || error.message?.includes('not found') || error.status === 404;
    
    // Check for fallback before throwing/logging error
    const envFallback = process.env[secretName] || process.env[`NEXT_PUBLIC_${secretName}`];

    if (isNotFound && envFallback) {
      logger.warn('Secret not found in GCP, using local ENV fallback', { secretName });
      return envFallback;
    }

    if (!isNotFound) {
      logger.error('Error fetching secret from Secret Manager', error, { secretName });
    }
    
    if (envFallback) {
      return envFallback;
    }
    throw error;
  }
}
