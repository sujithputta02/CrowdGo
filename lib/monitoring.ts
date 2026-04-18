import { Logging } from '@google-cloud/logging';
import { MetricServiceClient } from '@google-cloud/monitoring';
import path from 'path';

/**
 * Cloud Monitoring & Logging Service
 * Ensures the app stays "Locked In" with structured logs and latency tracking.
 */
let _logging: Logging | null = null;
let _monitoring: MetricServiceClient | null = null;

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crowdgo-493512';

function getLogging() {
  if (_logging) return _logging;
  const keyPath = path.join(process.cwd(), 'gcp-key.json');
  _logging = new Logging({ projectId: PROJECT_ID, keyFilename: keyPath });
  return _logging;
}

function getMonitoring() {
  if (_monitoring) return _monitoring;
  const keyPath = path.join(process.cwd(), 'gcp-key.json');
  _monitoring = new MetricServiceClient({ keyFilename: keyPath });
  return _monitoring;
}

export const MonitoringService = {
  /**
   * Logs a structured message to Google Cloud Logging
   */
  async log(
    message: string, 
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'NOTICE' | 'DEBUG' = 'INFO', 
    payload: Record<string, unknown> = {}
  ) {
    try {
      const logging = getLogging();
      const log = logging.log('vibe-check-logs');

      const traceId = (payload.traceId as string | undefined) || `projects/${PROJECT_ID}/traces/${Math.random().toString(36).substring(7)}`;

      const entry = log.entry({
        resource: { type: 'global' },
        severity,
        trace: traceId,
      }, {
        message,
        ...payload,
        timestamp: new Date().toISOString(),
      });

      await log.write(entry);
      // Successfully written to Cloud Logging
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      const isPermissionError = err.code === 7 || err.message?.includes('PERMISSION_DENIED');
      if (isPermissionError) {
        // Permission error - silently skip to avoid circular logging
      } else {
        // Failed to write - silently skip to avoid circular logging
      }
    }
  },

  /**
   * Records a custom latency metric
   * (Standard practice is to log this; the metric is then created in GCP based on the log)
   */
  async recordLatency(operation: string, durationMs: number) {
    // Send this as a structured log with a special field for filtering
    return this.log(`Latency: ${operation}`, 'INFO', {
      operation,
      latency_ms: durationMs,
      type: 'metric'
    });
  }
};
