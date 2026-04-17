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
  async log(message: string, severity: 'INFO' | 'WARNING' | 'ERROR' | 'NOTICE' | 'DEBUG' = 'INFO', payload: any = {}) {
    try {
      const logging = getLogging();
      const log = logging.log('vibe-check-logs');
      const metadata = {
        resource: { type: 'global' },
        severity,
      };

      const traceId = payload.traceId || `projects/${PROJECT_ID}/traces/${Math.random().toString(36).substring(7)}`;

      const entry = log.entry({
        ...metadata,
        trace: traceId,
      }, {
        message,
        ...payload,
        timestamp: new Date().toISOString(),
      });

      await log.write(entry);
      console.log(`[CloudLogging] ${severity}: ${message}`);
    } catch (error: any) {
      const isPermissionError = error.code === 7 || error.message?.includes('PERMISSION_DENIED');
      if (isPermissionError) {
        console.warn(`[Monitoring] Cloud Logging permission denied. (Add 'Logs Writer' role to service account to fix)`);
      } else {
        console.warn('[Monitoring] Failed to write to Cloud Logging:', error);
      }
    }
  },

  /**
   * Records a custom latency metric
   * (Standard practice is to log this; the metric is then created in GCP based on the log)
   */
  async recordLatency(operation: string, durationMs: number) {
    console.log(`[Monitoring] ${operation} Latency: ${durationMs}ms`);
    
    // We send this as a structured log with a special field for filtering
    return this.log(`Latency: ${operation}`, 'INFO', {
      operation,
      latency_ms: durationMs,
      type: 'metric'
    });
  }
};
