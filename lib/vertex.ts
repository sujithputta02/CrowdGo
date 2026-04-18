import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';
import { getSecret } from './gcp-secrets';
import { MonitoringService } from './monitoring';
import { logger } from './logger';
import { getErrorMessage } from './types/errors';
import path from 'path';
import { google } from '@google-cloud/aiplatform/build/protos/protos';

/**
 * Production Vertex AI Service
 * Connects to real-time Google Cloud AI Platform endpoints.
 */

interface PredictionInstance {
  current_wait: number;
  recent_scans: number;
  stadium: string;
}

interface PredictionResult {
  predicted_wait?: number;
  wait?: number;
  confidence?: string;
  reason?: string;
}

type IValue = google.protobuf.IValue;

let _client: PredictionServiceClient | null = null;
let _endpointId: string | null = null;

async function getVertexClient(): Promise<PredictionServiceClient> {
  if (_client) return _client;

  try {
    const keyPath = path.join(process.cwd(), 'gcp-key.json');
    _client = new PredictionServiceClient({
      keyFilename: keyPath,
      apiEndpoint: `${process.env.VERTEX_AI_LOCATION || 'us-central1'}-aiplatform.googleapis.com`,
    });
    return _client;
  } catch (error) {
    MonitoringService.log('Vertex AI SDK Initialization Failed', 'ERROR', { 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

const PROJECT_ID = 'crowdgo-493512';
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

export const VertexAIService = {
  /**
   * Calls the Vertex AI endpoint for a real-time prediction
   */
  async predict(instance: PredictionInstance): Promise<PredictionResult | null> {
    const startTime = Date.now();

    // 1. Fetch Endpoint ID from Secret Manager or Env
    if (!_endpointId) {
      _endpointId = await getSecret('VERTEX_AI_ENDPOINT_ID').catch(() => process.env.VERTEX_AI_ENDPOINT_ID || null);
    }

    if (!_endpointId) {
      logger.warn("Vertex AI: No ENDPOINT_ID found. Skipping prediction.");
      return null;
    }

    try {
      const client = await getVertexClient();
      const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${_endpointId}`;
      
      const instances = [helpers.toValue(instance)];
      const parameters = helpers.toValue({});

      MonitoringService.log('Vertex AI Prediction: Started', 'DEBUG', { endpoint });

      const [response] = await client.predict({
        endpoint,
        instances: instances as any[],
        parameters: parameters as any,
      });
      
      const duration = Date.now() - startTime;
      MonitoringService.recordLatency('vibe_check_latency', duration);

      if (!response || !response.predictions || response.predictions.length === 0) {
        MonitoringService.log('Vertex AI: Empty Response', 'WARNING');
        return null;
      }

      const prediction = response.predictions[0];
      if (!prediction) {
        return null;
      }

      return helpers.fromValue(prediction as any) as PredictionResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      MonitoringService.log('Vertex AI SDK Error', 'ERROR', {
        error: getErrorMessage(error),
        duration_ms: duration
      });
      return null;
    }
  }
};
