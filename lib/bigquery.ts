import { BigQuery } from '@google-cloud/bigquery';
import fs from 'fs';
import path from 'path';

/**
 * BigQuery Analytics Warehouse Service
 * Handles long-term archival of stadium events and KPI reporting.
 */
let _bigquery: BigQuery | null = null;

function getBigQueryClient() {
  if (_bigquery) return _bigquery;

  console.log('--- BQ AUTH: JSON-FILE ---');
  
  try {
    const keyPath = path.join(process.cwd(), 'gcp-key.json');
    _bigquery = new BigQuery({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      keyFilename: keyPath,
    });
  } catch (err) {
    console.error('CRITICAL: Failed to initialize BQ client with JSON file:', err);
    throw err;
  }

  return _bigquery;
}

const DATASET_ID = 'crowdgo_analytics';
const TABLE_ID = 'stadium_events';

// In-memory cache for surge trends to prevent BQ flooding
const surgeCache = new Map<string, { count: number; timestamp: number }>();
const SURGE_CACHE_TTL = 5000; // 5 seconds

export const BigQueryService = {
  /**
   * Streams a row of event data to BigQuery for long-term analytics and surge prediction history.
   * 
   * @param event - The event object containing type, payload, and stadium context
   */
  async streamEvent(event: {
    type: string,
    payload: any,
    timestamp: string,
    venue_id: string
  }) {
    try {
      const bq = getBigQueryClient();
      const dataset = bq.dataset(DATASET_ID);
      const table = dataset.table(TABLE_ID);

      const row = {
        event_type: event.type,
        payload: JSON.stringify(event.payload),
        timestamp: event.timestamp,
        venue_id: event.venue_id,
        wait_time_minutes: event.payload?.wait || event.payload?.wait_time || 0,
        processed_at: new Date().toISOString()
      };

      console.log(`BQ: Archiving event ${event.type} [Wait: ${row.wait_time_minutes} min]...`);
      await table.insert([row]);
    } catch (error) {
      // If table doesn't exist, we skip but log (production would handle schema creation)
      console.warn('BigQuery Streaming skipped (Table might not exist):', error);
    }
  },

  /**
   * Runs a KPI query for the operations dashboard
   */
  async getBusiestGate(): Promise<any> {
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
    return rows[0] || null;
  },

  /**
   * Calculates the current surge momentum based on recent history.
   * Compares the frequency of events (Gate Scans/POS) in the last 15 minutes.
   * 
   * @param eventType - The category of events to analyze ('GATE_SCAN' or 'POS_SALE')
   * @returns The count of recent events, used as a momentum multiplier for wait times
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
      const count = rows[0]?.recent_count || 0;
      
      surgeCache.set(cacheKey, { count, timestamp: now });
      return count;
    } catch (error) {
       console.warn("Surge Trend Query Failed:", error);
       return 0;
    }
  }
};
