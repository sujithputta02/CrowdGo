import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
import { logger } from './logger';
import { getErrorMessage } from './types/errors';

/**
 * BigQuery Analytics Warehouse Service
 * Handles long-term archival of stadium events and KPI reporting.
 */

interface BigQueryRow {
  event_type: string;
  payload: string;
  timestamp: string;
  venue_id: string;
  wait_time_minutes: number;
  processed_at: string;
}

interface BusiestGateResult {
  gate_id: string;
  scan_count: number;
}

interface SurgeCountResult {
  recent_count: number;
}

interface EventPayload {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  venue_id: string;
}

let _bigquery: BigQuery | null = null;

function getBigQueryClient(): BigQuery {
  if (_bigquery) return _bigquery;

  logger.debug('Initializing BigQuery client with JSON key file');
  
  try {
    const keyPath = path.join(process.cwd(), 'gcp-key.json');
    _bigquery = new BigQuery({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      keyFilename: keyPath,
    });
  } catch (err) {
    logger.critical('Failed to initialize BigQuery client', err);
    throw err;
  }

  return _bigquery;
}

const DATASET_ID = 'crowdgo_analytics';
const TABLE_ID = 'stadium_events';
const SURGE_CACHE_TTL = 5000; // 5 seconds

// In-memory cache for surge trends to prevent BQ flooding
const surgeCache = new Map<string, { count: number; timestamp: number }>();

export const BigQueryService = {
  /**
   * Streams a row of event data to BigQuery for long-term analytics and surge prediction history.
   */
  async streamEvent(event: EventPayload): Promise<void> {
    try {
      const bq = getBigQueryClient();
      const dataset = bq.dataset(DATASET_ID);
      const table = dataset.table(TABLE_ID);

      const row: BigQueryRow = {
        event_type: event.type,
        payload: JSON.stringify(event.payload),
        timestamp: event.timestamp,
        venue_id: event.venue_id,
        wait_time_minutes: (event.payload?.wait as number) || (event.payload?.wait_time as number) || 0,
        processed_at: new Date().toISOString()
      };

      logger.debug('Archiving event to BigQuery', { 
        eventType: event.type, 
        waitTime: row.wait_time_minutes 
      });
      await table.insert([row]);
    } catch (error) {
      logger.warn('BigQuery streaming skipped - table may not exist', { error: getErrorMessage(error) });
    }
  },

  /**
   * Runs a KPI query for the operations dashboard
   */
  async getBusiestGate(): Promise<BusiestGateResult | null> {
    const bq = getBigQueryClient();
    const query = `
      SELECT 
        JSON_VALUE(payload, '$.gateId') as gate_id,
        COUNT(*) as scan_count
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      WHERE event_type = 'GATE_SCAN'
      AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
      GROUP BY gate_id
      ORDER BY scan_count DESC
      LIMIT 1
    `;

    const options = {
      query: query,
      location: 'us-central1',
    };

    const [rows] = await bq.query(options);
    return (rows[0] as BusiestGateResult) || null;
  },

  /**
   * Calculates the current surge momentum based on recent history.
   */
  async getHistoricalSurgeTrend(eventType: string): Promise<number> {
    try {
      const cacheKey = eventType;
      const now = Date.now();
      
      if (surgeCache.has(cacheKey)) {
        const cached = surgeCache.get(cacheKey)!;
        if (now - cached.timestamp < SURGE_CACHE_TTL) {
          return cached.count;
        }
      }

      const bq = getBigQueryClient();
      const query = `
        SELECT COUNT(*) as recent_count
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        WHERE event_type = @eventType
        AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)
      `;

      const options = {
        query: query,
        params: { eventType },
        location: 'us-central1',
      };

      const [rows] = await bq.query(options);
      const count = (rows[0] as SurgeCountResult)?.recent_count || 0;
      
      surgeCache.set(cacheKey, { count, timestamp: now });
      return count;
    } catch (error) {
       logger.warn("Surge trend query failed", { error: getErrorMessage(error) });
       return 0;
    }
  }
};
