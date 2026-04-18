/**
 * Prediction Service
 * Derives real-time queue states from live venue data.
 */

import { logger } from '../logger.client';
import { getErrorMessage } from '../types/errors';

export type FacilityType = 'gate' | 'pos';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface QueueState {
  facilityId: string;
  waitRange: string;
  estimatedWaitMinutes: number;
  confidence: ConfidenceLevel;
  auraReason?: string;
  lastUpdated: string;
}

interface PredictionResponse {
  predictedWait: number;
  confidence: ConfidenceLevel;
  auraReason: string;
  engine: string;
}

const PREDICTION_TIMEOUT_MS = 5000;
const FALLBACK_WAIT_BUFFER = 3;

export const PredictionService = {
  /**
   * Processes live wait times into AI-driven predictive states.
   */
  getQueueStatus: async (
    facilityId: string, 
    currentWait: number, 
    type: FacilityType = 'pos', 
    signal?: AbortSignal
  ): Promise<QueueState> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PREDICTION_TIMEOUT_MS);

      const response = await fetch('/api/v1/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, type, currentWait }),
        signal: signal || controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Proxy returned ${response.status}`);
      }
      
      const prediction: PredictionResponse = await response.json();
      
      if (prediction.engine === 'fallback') {
        logger.warn('Prediction service returned fallback response');
      }

      return {
        facilityId,
        waitRange: `${prediction.predictedWait}-${prediction.predictedWait + 2} mins`,
        estimatedWaitMinutes: prediction.predictedWait,
        confidence: prediction.confidence,
        auraReason: prediction.auraReason,
        lastUpdated: new Date().toISOString()
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        logger.warn('Prediction service fallback triggered', { error: getErrorMessage(error) });
      }
      
      return {
        facilityId,
        waitRange: `${currentWait}-${currentWait + FALLBACK_WAIT_BUFFER} mins`,
        estimatedWaitMinutes: currentWait,
        confidence: 'low',
        auraReason: "Standard estimate (AI temporarily offline)",
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
